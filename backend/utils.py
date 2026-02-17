import google.generativeai as genai
import pandas as pd
import random
import os
from dotenv import load_dotenv
from PIL import Image

# Load environment variables
load_dotenv()

def classify_waste(image_path):
    """
    Classifies waste using Gemini Vision AI.
    Returns: dict with 'class', 'confidence'
    """
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        raise Exception("GEMINI_API_KEY not found in environment variables")
    
    try:
        print(f"[DEBUG] Starting Gemini Vision classification for: {image_path}")
        genai.configure(api_key=api_key)
        
        # Load image
        img = Image.open(image_path)
        print(f"[DEBUG] Image loaded: {img.size}")
        
        # Use Gemini Flash Latest (supports vision, better quota)
        model = genai.GenerativeModel('gemini-flash-latest')
        print(f"[DEBUG] Gemini Flash Latest model initialized")
        
        prompt = """Analyze this image and identify:
1. The PRIMARY type of waste visible
2. Whether it is CONTAMINATED

WASTE CATEGORIES (choose ONE):
- Plastic (bottles, bags, containers)
- Paper (cardboard, magazines, newspapers)
- Metal (cans, foil, utensils)
- Glass (bottles, jars)
- Organic (food waste, plant material)
- E-waste (electronics, batteries)
- Hazardous (chemicals, sharp objects)

CONTAMINATION means:
- Food residue on recyclables
- Liquids still inside containers
- Mixed materials stuck together
- Dirt, grease, or oil stains
- Non-recyclable attachments (labels, tape)

Respond in this EXACT format:
WASTE_TYPE: [category name]
CONFIDENCE: [number from 60-95]
CONTAMINATED: [YES or NO]
CONTAMINANT: [brief description if YES, otherwise write NONE]

Be specific and accurate."""
        
        print(f"[DEBUG] Sending request to Gemini Vision...")
        response = model.generate_content([prompt, img])
        print(f"[DEBUG] Gemini response: {response.text}")
        
        # Parse response
        text = response.text.strip()
        waste_type = "Mixed Waste"
        confidence = 0.7
        contaminated = False
        contaminant = "None"
        
        for line in text.split('\n'):
            if 'WASTE_TYPE:' in line or 'WASTE TYPE:' in line:
                waste_type = line.split(':', 1)[1].strip()
                # Remove any extra text in parentheses
                if '(' in waste_type:
                    waste_type = waste_type.split('(')[0].strip()
            elif 'CONFIDENCE:' in line:
                conf_str = line.split(':', 1)[1].strip().replace('%', '').strip()
                try:
                    confidence = float(conf_str) / 100
                except:
                    confidence = 0.75
            elif 'CONTAMINATED:' in line:
                contaminated_str = line.split(':', 1)[1].strip().upper()
                contaminated = contaminated_str == 'YES'
            elif 'CONTAMINANT:' in line:
                contaminant = line.split(':', 1)[1].strip()
                if contaminant.upper() == 'NONE':
                    contaminant = "None"
        
        print(f"[DEBUG] Parsed - Type: {waste_type}, Confidence: {confidence:.2%}, Contaminated: {contaminated}, Contaminant: {contaminant}")
        
        return {
            'class': waste_type,
            'confidence': confidence,
            'contaminated': contaminated,
            'contaminant': contaminant
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"[ERROR] Gemini Vision error: {error_msg}")
        import traceback
        traceback.print_exc()
        
        # Fallback
        return {
            'class': 'Unknown Waste',
            'confidence': 0.5,
            'contaminated': False,
            'contaminant': 'None'
        }

def get_disposal_guidance(waste_type):
    """
    Generates disposal guidance using Google Gemini API.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        raise Exception("GEMINI_API_KEY not found in environment variables")
    
    try:
        print(f"[DEBUG] Getting guidance for waste type: {waste_type}")
        genai.configure(api_key=api_key)
        
        # Use Gemini Flash Latest (only working model for this key)
        model = genai.GenerativeModel('gemini-flash-latest')
        print(f"[DEBUG] Gemini Flash Latest initialized")
        
        prompt = f"""You are an expert in waste management.
        The waste type is: {waste_type}.
        
        Provide 3 short bullet points on how to dispose of it:
        1. Category (recyclable/compostable/trash)
        2. Preparation steps
        3. Which bin to use
        
        Keep it very concise."""
        
        print(f"[DEBUG] Sending request to Gemini...")
        response = model.generate_content(prompt)
        print(f"[DEBUG] Gemini response received")
        
        return response.text
    except Exception as e:
        error_msg = str(e)
        print(f"[ERROR] Gemini API error: {error_msg}")
        
        # Check for common errors
        if "API_KEY_INVALID" in error_msg or "not enabled" in error_msg:
            return f"⚠️ **API Configuration Issue**\n\nThe Gemini API might not be enabled for your API key.\n\n**Steps to fix:**\n1. Visit: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com\n2. Enable the 'Generative Language API'\n3. Restart the backend server\n\n**For now, here's generic guidance for {waste_type}:**\n• Check if recyclable in your area\n• Clean and dry before disposal\n• Consult local waste management guidelines"
        
        return f"⚠️ Could not fetch AI guidance. Generic tips for {waste_type}: Clean it, check if recyclable, and dispose accordingly."

def get_dashboard_data():
    """
    Generates mock data for the city-level dashboard.
    Returns: dict with 'composition' and 'trends'
    """
    # Ward-level waste composition
    wards = [f'Ward {i}' for i in range(1, 6)]
    waste_types = ['Plastic', 'Paper', 'Metal', 'Glass', 'Organic']
    
    composition_data = []
    for ward in wards:
        for w_type in waste_types:
            composition_data.append({
                'ward': ward,
                'type': w_type,
                'volume': random.randint(50, 500)
            })
    
    # Daily Collection Trends (Past 7 days)
    dates = pd.date_range(end=pd.Timestamp.today(), periods=7).strftime('%Y-%m-%d').tolist()
    trend_data = []
    
    for date in dates:
        trend_data.append({
            'date': date,
            'total': round(random.uniform(10, 25), 2),
            'recyclingRate': round(random.uniform(30, 60), 2)
        })
    
    return {
        'composition': composition_data,
        'trends': trend_data
    }

def get_chat_response(user_message, history=[]):
    """
    Generates chatbot response using Gemini API.
    Args:
        user_message: User's question
        history: List of previous messages [{'role': 'user'/'assistant', 'content': '...'}]
    Returns:
        AI response string
    """
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        return "⚠️ API key not configured. Please contact support."
    
    try:
        print(f"[DEBUG] Chat request: {user_message}")
        genai.configure(api_key=api_key)
        
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # System prompt with waste management expertise
        system_prompt = """You are WasteBot 🤖, an expert AI assistant for waste management in India.

Your expertise includes:
- Waste classification (plastic, paper, metal, glass, organic, e-waste, hazardous)
- Recycling guidelines and local regulations
- Contamination prevention and cleaning tips
- Composting and waste reduction strategies
- Indian waste management policies and initiatives
- Proper disposal methods for different materials

Guidelines for responses:
- Be concise (2-4 sentences maximum)
- Use emojis to make responses engaging
- Provide actionable, practical advice
- Reference Indian context when relevant (e.g., Swachh Bharat Mission)
- If unsure, suggest contacting local municipality or waste management authority
- Be friendly and encouraging about sustainable practices

Remember: Your goal is to help Indians manage waste better and promote recycling!"""
        
        # Build conversation context with history
        full_prompt = system_prompt + "\n\n"
        
        # Include last 5 messages for context (to avoid token limits)
        for msg in history[-5:]:
            role = "User" if msg['role'] == 'user' else "Assistant"
            full_prompt += f"{role}: {msg['content']}\n"
        
        full_prompt += f"User: {user_message}\nAssistant:"
        
        print(f"[DEBUG] Sending chat request to Gemini...")
        response = model.generate_content(full_prompt)
        print(f"[DEBUG] Chat response received")
        
        return response.text.strip()
        
    except Exception as e:
        error_msg = str(e)
        print(f"[ERROR] Chat error: {error_msg}")
        
        # Friendly error message
        return "⚠️ I'm having trouble connecting right now. Please try again in a moment!"

