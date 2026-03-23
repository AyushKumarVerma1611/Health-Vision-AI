import io
import base64
import numpy as np

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False


def generate_gradcam(model, image_array: np.ndarray, last_conv_layer_name: str = None) -> str:
    """
    Generate a Grad-CAM heatmap for the given image using the provided model.
    Returns the heatmap as a base64-encoded JPEG string.

    Args:
        model: TensorFlow/Keras model
        image_array: Preprocessed image array with shape (1, H, W, 3)
        last_conv_layer_name: Name of the last convolutional layer.
                             If None, will try to find it automatically.
    Returns:
        Base64 encoded JPEG string of the heatmap overlay
    """
    if not TF_AVAILABLE or not CV2_AVAILABLE:
        return _generate_mock_heatmap(image_array)

    try:
        if last_conv_layer_name is None:
            for layer in reversed(model.layers):
                if isinstance(layer, (tf.keras.layers.Conv2D,)):
                    last_conv_layer_name = layer.name
                    break

        if last_conv_layer_name is None:
            return _generate_mock_heatmap(image_array)

        grad_model = tf.keras.models.Model(
            inputs=model.input,
            outputs=[model.get_layer(last_conv_layer_name).output, model.output]
        )

        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(image_array)
            predicted_class = tf.argmax(predictions[0])
            class_output = predictions[:, predicted_class]

        grads = tape.gradient(class_output, conv_outputs)

        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

        conv_outputs = conv_outputs[0]
        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)

        heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-8)
        heatmap = heatmap.numpy()

        heatmap = cv2.resize(heatmap, (image_array.shape[2], image_array.shape[1]))

        heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap), cv2.COLORMAP_JET)

        original = np.uint8(image_array[0] * 255)
        overlaid = cv2.addWeighted(original, 0.6, heatmap_colored, 0.4, 0)

        _, buffer = cv2.imencode('.jpg', cv2.cvtColor(overlaid, cv2.COLOR_RGB2BGR))
        return base64.b64encode(buffer).decode('utf-8')

    except Exception as e:
        print(f"Grad-CAM generation error: {e}")
        return _generate_mock_heatmap(image_array)


def _generate_mock_heatmap(image_array: np.ndarray) -> str:
    """Generate a mock heatmap when the model or OpenCV is not available."""
    try:
        h = image_array.shape[1] if len(image_array.shape) > 3 else image_array.shape[0]
        w = image_array.shape[2] if len(image_array.shape) > 3 else image_array.shape[1]

        y, x = np.mgrid[0:h, 0:w]
        center_y, center_x = h // 2, w // 2
        heatmap = np.exp(-((x - center_x) ** 2 + (y - center_y) ** 2) / (2 * (min(h, w) // 4) ** 2))
        heatmap = (heatmap * 255).astype(np.uint8)

        if CV2_AVAILABLE:
            heatmap_colored = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

            if len(image_array.shape) > 3:
                original = np.uint8(image_array[0] * 255)
            else:
                original = np.uint8(image_array * 255) if image_array.max() <= 1 else image_array

            overlaid = cv2.addWeighted(original, 0.6, heatmap_colored, 0.4, 0)
            _, buffer = cv2.imencode('.jpg', cv2.cvtColor(overlaid, cv2.COLOR_RGB2BGR))
            return base64.b64encode(buffer).decode('utf-8')
        else:
            from PIL import Image as PILImage
            heatmap_rgb = np.stack([heatmap, np.zeros_like(heatmap), 255 - heatmap], axis=-1).astype(np.uint8)
            img = PILImage.fromarray(heatmap_rgb)
            buf = io.BytesIO()
            img.save(buf, format='JPEG')
            return base64.b64encode(buf.getvalue()).decode('utf-8')

    except Exception:
        return ""


def overlay_heatmap(original_image: np.ndarray, heatmap: np.ndarray, alpha: float = 0.4) -> np.ndarray:
    """
    Overlay a heatmap onto the original image.

    Args:
        original_image: Original image as numpy array (H, W, 3) in uint8
        heatmap: Heatmap as numpy array (H, W) with values 0-1
        alpha: Blending factor for the heatmap

    Returns:
        Blended image as numpy array
    """
    if not CV2_AVAILABLE:
        return original_image

    heatmap_resized = cv2.resize(heatmap, (original_image.shape[1], original_image.shape[0]))
    heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)
    overlaid = cv2.addWeighted(original_image, 1 - alpha, heatmap_colored, alpha, 0)
    return overlaid
