import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found")
else:
    genai.configure(api_key=api_key)
    print(f"Testing Gemini 1.5 Flash with key: {api_key[:5]}...")
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Hello, can you hear me?")
        print(f"Success! Response: {response.text}")
    except Exception as e:
        print(f"Error testing gemini-1.5-flash: {e}")
        
    print("\nTesting Gemini 2.0 Flash...")
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content("Hello?")
        print(f"Success! Response: {response.text}")
    except Exception as e:
        print(f"Error testing gemini-2.0-flash: {e}")
