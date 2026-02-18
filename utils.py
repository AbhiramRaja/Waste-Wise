import google.generativeai as genai
import pandas as pd
import random

def get_disposal_guidance(waste_type, api_key):
    """
    Generates disposal guidance using Google Gemini API.
    """
    if not api_key:
        return "Please provide a valid Gemini API Key."
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are an expert in waste management and recycling.
        A user has identified a piece of waste as: {waste_type}.
        
        Please provide a short, strict guide on how to dispose of this specific item correctly.
        Format your response as 3 clear bullet points.
        Focus on:
        1. Whether it is recyclable, compostable, or trash.
        2. Preparation steps (e.g., rinse, remove cap).
        3. Which specific bin color is typically used (mention standard colors like Blue for recycle, Green for organic, Black for trash, but note that this varies).
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error connecting to Gemini: {str(e)}"

def get_mock_dashboard_data():
    """
    Generates mock data for the city-level dashboard.
    """
    # 1. Ward-level waste composition
    wards = [f'Ward {i}' for i in range(1, 6)]
    waste_types = ['Plastic', 'Paper', 'Metal', 'Glass', 'Organic']
    
    data = []
    for ward in wards:
        for w_type in waste_types:
            data.append({
                'Ward': ward,
                'Waste Type': w_type,
                'Volume (kg)': random.randint(50, 500)
            })
    
    df_composition = pd.DataFrame(data)
    
    # 2. Daily Collection Trends (Past 7 days)
    dates = pd.date_range(end=pd.Timestamp.today(), periods=7).strftime('%Y-%m-%d').tolist()
    trend_data = []
    
    for date in dates:
        trend_data.append({
            'Date': date,
            'Total Collected (Tons)': random.uniform(10, 25),
            'Recycling Rate (%)': random.uniform(30, 60)
        })
    
    df_trends = pd.DataFrame(trend_data)
    
    return df_composition, df_trends
