import streamlit as st
from ultralytics import YOLO
from PIL import Image
import utils
import plotly.express as px
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- Page Config ---
st.set_page_config(
    page_title="Smart Waste Sorter",
    page_icon="♻️",
    layout="wide"
)

# --- Sidebar ---
st.sidebar.title("⚙️ Settings")
# Get API key from env or user input (pre-filled if in env)
env_api_key = os.getenv("GEMINI_API_KEY", "")
api_key = st.sidebar.text_input("Enter Gemini API Key", value=env_api_key, type="password")
st.sidebar.markdown("---")
st.sidebar.info("Upload an image of waste to get classification and disposal advice.")

# --- Main Interface ---
st.title("♻️ Smart Waste Sorter & Analytics")
st.markdown("### AI-Powered Classification & Municipal Insights")

# Tabs for different functionalities
tab1, tab2 = st.tabs(["🗑️ Waste Scanner", "📊 City Dashboard"])

# --- Tab 1: Waste Scanner ---
with tab1:
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("Upload Waste Image")
        uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])
        
        if uploaded_file is not None:
            image = Image.open(uploaded_file)
            st.image(image, caption='Uploaded Image', use_column_width=True)
            
            # Classification Button
            if st.button("🔍 Classify Waste"):
                with st.spinner('Analyzing image with YOLOv8...'):
                    # Load model (using standard yolov8n-cls for demo purposes)
                    # In a real scenario, this would be a custom trained model on waste dataset
                    try:
                        model = YOLO('yolov8n-cls.pt') 
                        results = model(image)
                        
                        # Get top prediction
                        probs = results[0].probs
                        top1_index = probs.top1
                        top1_label = results[0].names[top1_index]
                        confidence = probs.top1conf.item()
                        
                        # Display Result
                        st.success(f"**Detected:** {top1_label.title()} ({confidence:.2%} confidence)")
                        
                        # Get Gemini Guidance
                        if api_key:
                            with st.spinner('Fetching disposal guidance from Gemini...'):
                                guidance = utils.get_disposal_guidance(top1_label, api_key)
                                st.markdown("### 🤖 Disposal Guidance")
                                st.markdown(guidance)
                        else:
                            st.warning("Please enter your Gemini API Key in the sidebar to get disposal guidance.")
                            
                    except Exception as e:
                        st.error(f"Error loading model or processing image: {e}")

    with col2:
        st.info("💡 **Did you know?** Proper segregation can increase recycling efficiency by up to 40%.")
        # Placeholder for future gamification or real-time stats

# --- Tab 2: City Dashboard ---
with tab2:
    st.subheader("Municipal Waste Insights")
    
    df_composition, df_trends = utils.get_mock_dashboard_data()
    
    # Row 1: Charts
    row1_col1, row1_col2 = st.columns(2)
    
    with row1_col1:
        st.markdown("#### Waste Composition by Ward")
        fig_bar = px.bar(df_composition, x='Ward', y='Volume (kg)', color='Waste Type', 
                         title="Waste Composition Breakup", barmode='stack')
        st.plotly_chart(fig_bar, use_container_width=True)
        
    with row1_col2:
        st.markdown("#### Collection Trends (Last 7 Days)")
        fig_line = px.line(df_trends, x='Date', y=['Total Collected (Tons)', 'Recycling Rate (%)'], 
                           markers=True, title="Collection Efficiency")
        st.plotly_chart(fig_line, use_container_width=True)
    
    # Row 2: "Smart" Insights
    st.markdown("---")
    st.markdown("### 🚑 Predictive Logistics")
    
    # Simple logic to simulate an insight
    high_volume_ward = df_composition.groupby('Ward')['Volume (kg)'].sum().idxmax()
    st.warning(f"⚠️ **Action Required:** {high_volume_ward} has a 15% surge in waste volume today. Re-route 2 additional trucks.")

# --- Footer ---
st.markdown("---")
st.markdown("Built for **Innofusion Smart AI** Hackathon | Powered by **YOLOv8 & Gemini**")
