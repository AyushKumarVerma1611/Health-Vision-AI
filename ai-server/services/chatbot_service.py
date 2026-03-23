import os
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

SYSTEM_PROMPT = """You are HealthVision AI, a medical assistant chatbot. You help users understand their symptoms and provide health guidance. Always recommend consulting a doctor for serious concerns. Be empathetic, clear, and concise.

Structure your responses with these sections when appropriate:
- **Possible Conditions**: List potential conditions related to the described symptoms
- **Urgency Level**: Rate as Low, Medium, or High
- **Immediate Steps**: What the person can do right now
- **When to See a Doctor**: Clear guidance on when professional help is needed

Important rules:
1. Never diagnose — only suggest possibilities
2. Always recommend professional medical consultation for serious symptoms
3. Be empathetic and reassuring while being factually accurate
4. If symptoms suggest an emergency (chest pain, difficulty breathing, severe bleeding), immediately advise calling emergency services
5. Provide evidence-based information only
6. Include a brief disclaimer that you are an AI assistant, not a doctor"""


def chat(message: str, history: list = None) -> str:
    """
    Process a chat message with conversation history using Gemini.

    Args:
        message: The user's current message
        history: List of previous messages [{"role": "user"|"assistant", "content": str}]

    Returns:
        AI response string
    """
    if not GEMINI_AVAILABLE or not os.getenv("GEMINI_API_KEY"):
        return "⚠️ **AI Chat Unavailable**: The Gemini API is not configured. Please set the GEMINI_API_KEY environment variable to enable the AI health assistant."

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")

        conversation_parts = [SYSTEM_PROMPT + "\n\n"]

        if history:
            for msg in history[-10:]:  # Keep last 10 messages for context
                role = "User" if msg.get("role") == "user" else "Assistant"
                conversation_parts.append(f"{role}: {msg.get('content', '')}\n")

        conversation_parts.append(f"User: {message}\nAssistant:")

        full_prompt = "\n".join(conversation_parts)

        response = model.generate_content(full_prompt)

        if response and response.text:
            return response.text.strip()
        else:
            return "I apologize, but I wasn't able to generate a response. Could you please rephrase your question?"

    except Exception as e:
        print(f"[Chatbot Service] Error: {e}")
        return _handle_error(str(e))


def _handle_error(error_message: str) -> str:
    """Return a friendly error message."""
    if "quota" in error_message.lower() or "rate" in error_message.lower():
        return f"⚠️ **Google API Quota Exceeded**: {error_message}\n\nPlease check your Google Cloud Console to verify your active quota or billing details for this API key."

    return f"⚠️ **API Error**: {error_message}\n\nPlease try again or verify your GEMINI_API_KEY."

