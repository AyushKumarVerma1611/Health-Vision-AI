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


def generate_brief(user_data: dict) -> str:
    """
    Generate a comprehensive medical history brief using Gemini AI.

    Args:
        user_data: dict containing:
            - chats: list of chat sessions with messages
            - analyses: list of analysis results
            - report_names: list of uploaded report filenames
    
    Returns:
        Formatted brief text
    """
    chats = user_data.get("chats", [])
    analyses = user_data.get("analyses", [])
    report_names = user_data.get("report_names", [])

    chat_summary = _summarize_chats(chats)
    analysis_summary = _summarize_analyses(analyses)
    reports_list = ", ".join(report_names) if report_names else "No uploaded documents"

    prompt = f"""You are a clinical AI assistant. Generate a structured Medical History Brief based on the following patient data from the HealthVision AI platform.

CHAT HISTORY (symptom discussions):
{chat_summary}

AI ANALYSIS RESULTS:
{analysis_summary}

UPLOADED DOCUMENTS:
{reports_list}

Generate a brief with exactly these sections:
1. PATIENT HEALTH SUMMARY (2-3 sentences overview)
2. REPORTED SYMPTOMS & COMPLAINTS (bullet points from chat history)
3. AI-DETECTED CONDITIONS (with confidence levels from analysis results)
4. RISK PROFILE (Heart Risk: X%, Diabetes Risk: Y% if available)
5. OBSERVED TRENDS (any patterns in the data over time)
6. RECOMMENDED ACTIONS (3-5 specific actionable items)
7. DISCLAIMER (state this is AI-generated and not a substitute for medical advice)

Be concise, clinical, and factual. Never invent conditions not present in the data. If a section has no relevant data, state "No data available" for that section."""

    if not GEMINI_AVAILABLE or not os.getenv("GEMINI_API_KEY"):
        return "⚠️ AI Brief Generation Unavailable: The Gemini API is not configured. Please set the GEMINI_API_KEY environment variable to enable AI-powered brief generation."

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)

        if response and response.text:
            return response.text.strip()
        else:
            return "⚠️ Unable to generate brief: The AI did not return a response. Please try again."

    except Exception as e:
        print(f"[Brief Service] Error: {e}")
        return f"⚠️ Brief generation failed: {str(e)}. Please try again or check the Gemini API configuration."


def _summarize_chats(chats: list) -> str:
    """Create a summary of chat history for the prompt."""
    if not chats:
        return "No symptom discussions recorded."

    summaries = []
    for chat in chats[:10]:  # Limit to 10 most relevant chats
        title = chat.get("title", "Untitled")
        messages = chat.get("messages", [])
        user_messages = [m.get("content", "") for m in messages if m.get("role") == "user"]
        if user_messages:
            summary = f"- Session '{title}': Patient reported - {'; '.join(user_messages[:3])}"
            summaries.append(summary)

    return "\n".join(summaries) if summaries else "No symptom discussions recorded."


def _summarize_analyses(analyses: list) -> str:
    """Create a summary of analysis results for the prompt."""
    if not analyses:
        return "No analyses performed."

    summaries = []
    for analysis in analyses:
        a_type = analysis.get("type", "unknown").upper()
        prediction = analysis.get("prediction", "N/A")
        confidence = analysis.get("confidence", 0)
        risk_pct = analysis.get("riskPercentage", None)
        risk_level = analysis.get("riskLevel", None)
        date = analysis.get("date", "Unknown date")

        if risk_pct is not None:
            summaries.append(f"- {a_type}: Risk {risk_pct}% ({risk_level}) on {date}")
        else:
            summaries.append(f"- {a_type}: {prediction} (confidence: {confidence}%) on {date}")

    return "\n".join(summaries)
