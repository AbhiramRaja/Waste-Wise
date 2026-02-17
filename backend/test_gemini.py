import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key found: {api_key[:10]}..." if api_key else "No API key found")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    response = model.generate_content("Say 'Hello, I am working!' in one sentence.")
    print("\n✅ Gemini API is working!")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"\n❌ Gemini API Error: {str(e)}")
    print("\nPossible issues:")
    print("1. API key might be invalid")
    print("2. Gemini API might not be enabled in Google Cloud Console")
    print("3. Visit: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com")
