#!/usr/bin/env python3
"""
Gemini API Diagnostic Tool
Tests which models are available with your API key
"""

import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ ERROR: GEMINI_API_KEY not found in .env file")
    exit(1)

print(f"✓ API Key found: {api_key[:15]}...")
print("\nTesting Gemini API...\n")

# Test with the old package
try:
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    
    print("📋 Attempting to list available models...")
    
    try:
        models = genai.list_models()
        print("\n✅ Available models:")
        for model in models:
            if 'generateContent' in model.supported_generation_methods:
                print(f"  - {model.name}")
    except Exception as e:
        print(f"❌ Could not list models: {str(e)}")
    
    # Test basic generation
    print("\n🧪 Testing text generation with gemini-1.5-flash...")
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Say 'Hello, I work!'")
        print(f"✅ Text generation works!")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Text generation failed: {str(e)}")
    
    # Test vision
    print("\n🖼️  Testing vision with gemini-1.5-flash...")
    try:
        from PIL import Image
        import io
        
        # Create a simple test image
        test_img = Image.new('RGB', (100, 100), color='red')
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(["What color is this image?", test_img])
        print(f"✅ Vision works!")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Vision failed: {str(e)}")

except ImportError:
    print("❌ google-generativeai package not installed")
    print("Run: pip3 install google-generativeai")

print("\n" + "="*60)
print("TROUBLESHOOTING GUIDE")
print("="*60)
print("""
If you see 404 errors:

1. Enable the Generative Language API:
   → Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
   → Click "Enable"
   
2. Verify your API key:
   → Go to: https://aistudio.google.com/app/apikey
   → Create a new key if needed
   → Update backend/.env with the new key
   
3. Wait 1-2 minutes after enabling the API

4. Restart the backend:
   → Press Ctrl+C in the terminal
   → Run: python3 app.py

If you still have issues, the API might not be available in your region.
""")
