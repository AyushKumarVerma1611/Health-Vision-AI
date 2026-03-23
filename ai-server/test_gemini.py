import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

try:
    print("Testing Gemini API Key...")
    response = model.generate_content("Hello")
    print("Success:", response.text)
except Exception as e:
    print("Error encountered:")
    print(repr(e))
