import os
import json
from dotenv import load_dotenv

load_dotenv()

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
    api_key = os.getenv("GEMINI_API_KEY", "")
    if api_key:
        genai.configure(api_key=api_key)
except ImportError:
    GEMINI_AVAILABLE = False


def predict(file_bytes: bytes, mime_type: str = "application/pdf") -> dict:
    """
    Analyze a medical document (PDF or Image) using Gemini Vision.
    
    Args:
        file_bytes: Raw bytes of the document.
        mime_type: The MIME type of the file (e.g., 'application/pdf', 'image/jpeg').
        
    Returns:
        Structured JSON analysis.
    """
    if not GEMINI_AVAILABLE or not os.getenv("GEMINI_API_KEY"):
        return {
            "prediction": "AI Unavailable",
            "confidence": 0,
            "description": "The Gemini API is not configured. Please set the GEMINI_API_KEY environment variable.",
            "recommendations": []
        }

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        prompt = """
        You are an expert AI clinical assistant. Analyze the provided medical document/lab report.
        Extract the key information and provide a structured summary emphasizing actionable health insights.
        
        Return your response ONLY as a valid JSON object with the following strictly typed schema:
        {
          "prediction": "A very short, 3-5 word high-level summary (e.g., 'Abnormal Blood Test Findings', 'Routine Normal ECG', 'Critical Vitamin D Deficiency')",
          "confidence": 95,
          "description": "A comprehensive 3-5 sentence overall summary of the document's contents and the patient's general status.",
          "recommendations": [
            "Extract specific High-Priority Findings exactly as they appear (e.g. 'HbA1c: 7.10% (High)')",
            "Extract any Out of Range values with their normal reference ranges.",
            "List any necessary next steps or clinical recommendations."
          ]
        }
        
        Do not include any markdown backticks in your output. Just return the raw JSON string.
        """

        # Gemini supports inline data up to ~20MB for PDFs and Images on newer models.
        document_part = {
            "mime_type": mime_type,
            "data": file_bytes
        }

        response = model.generate_content([prompt, document_part])
        response_text = response.text.strip().strip("`").removeprefix("json").strip()
        
        try:
            result = json.loads(response_text)
            return {
                "prediction": result.get("prediction", "Document Analyzed"),
                "confidence": result.get("confidence", 90) / 100.0, # scale to 0.0-1.0
                "description": result.get("description", "Analysis complete."),
                "recommendation": "", # keep empty, we use recommendations list
                "recommendations": result.get("recommendations", [])
            }
        except json.JSONDecodeError:
            # Fallback if Gemini failed to output strict JSON
            return {
                "prediction": "Document Analysis",
                "confidence": 0.85,
                "description": response_text[:500] + ("..." if len(response_text) > 500 else ""),
                "recommendations": ["AI response could not be fully parsed into structured formatting."]
            }

    except Exception as e:
        error_msg = str(e)
        print(f"[Document Service] Error: {error_msg}")
        if "429" in error_msg or "quota" in error_msg.lower() or "exhausted" in error_msg.lower():
            raise ValueError("Google API Quota Exceeded. Please wait a minute before analyzing more documents.")
        raise ValueError(f"Failed to analyze document: {error_msg}")
