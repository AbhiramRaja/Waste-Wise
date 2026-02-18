from flask import Flask, request, jsonify
from flask_cors import CORS
import utils
import os
from werkzeug.utils import secure_filename
import tempfile

# Import ML forecasting module
try:
    import ml_forecast
    ML_ENABLED = True
    print("[APP] ML Forecasting module loaded successfully")
except Exception as e:
    ML_ENABLED = False
    print(f"[APP] ML Forecasting disabled: {e}")

from marketplace import exchange as market



app = Flask(__name__)
CORS(app)

# Configure upload settings
UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/classify', methods=['POST'])
def classify():
    """
    POST /api/classify
    Accepts image file, returns waste classification
    """
    print(f"\n[API] === CLASSIFY REQUEST RECEIVED ===")
    print(f"[API] Files in request: {list(request.files.keys())}")
    print(f"[API] Form data: {list(request.form.keys())}")
    
    if 'image' not in request.files:
        print(f"[API] ERROR: No image file in request")
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    print(f"[API] Image file: {file.filename}")
    
    if file.filename == '':
        print(f"[API] ERROR: Empty filename")
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        print(f"[API] ERROR: Invalid file type")
        return jsonify({'error': 'Invalid file type'}), 400
    
    try:
        # Save temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        print(f"[API] Saving to: {filepath}")
        file.save(filepath)
        
        # Classify
        print(f"[API] Starting classification...")
        result = utils.classify_waste(filepath)
        print(f"[API] Classification complete: {result}")
        
        # Clean up
        os.remove(filepath)
        print(f"[API] Temp file removed")
        
        return jsonify(result), 200
    
    except Exception as e:
        print(f"[API] EXCEPTION: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/guidance', methods=['POST'])
def guidance():
    """
    POST /api/guidance
    Accepts waste type, returns disposal guidance
    """
    data = request.get_json()
    
    if not data or 'wasteType' not in data:
        return jsonify({'error': 'wasteType is required'}), 400
    
    waste_type = data['wasteType']
    
    try:
        guidance_text = utils.get_disposal_guidance(waste_type)
        return jsonify({'guidance': guidance_text}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    """
    GET /api/dashboard
    Returns mock city-level analytics
    """
    try:
        data = utils.get_dashboard_data()
        return jsonify(data), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/city-data', methods=['GET'])
def city_data():
    """
    GET /api/city-data?city=Pune&state=Maharashtra
    Returns real data for supported cities, or 404 if not found
    """
    city = request.args.get('city')
    state = request.args.get('state')
    
    if not city:
        return jsonify({'message': 'City parameter required'}), 400

    # 1. Try Comprehensive Multi-City CSV (New Dataset)
    data = utils.get_multi_city_data(city)
    if data:
        return jsonify(data), 200
        
    # 2. Fallback to Legacy Pune Data (if specific CSV fails but legacy works)
    if city.lower() == 'pune':
        data = utils.get_pune_data()
        if data:
            return jsonify(data), 200
            
    return jsonify({'message': 'No real data available, use mock'}), 404


@app.route('/api/chat', methods=['POST'])
def chat():
    """
    POST /api/chat
    Accepts user message and conversation history, returns AI response
    """
    print(f"\n[API] === CHAT REQUEST RECEIVED ===")
    
    data = request.get_json()
    
    if not data or 'message' not in data:
        print(f"[API] ERROR: No message in request")
        return jsonify({'error': 'Message is required'}), 400
    
    user_message = data['message']
    conversation_history = data.get('history', [])
    
    print(f"[API] User message: {user_message}")
    print(f"[API] History length: {len(conversation_history)}")
    
    try:
        response_text = utils.get_chat_response(user_message, conversation_history)
        print(f"[API] Chat response generated successfully")
        return jsonify({'response': response_text}), 200
    
    except Exception as e:
        print(f"[API] EXCEPTION: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to generate response'}), 500

# ============================================================
# ML FORECASTING ENDPOINTS
# ============================================================

@app.route('/api/forecast/supply', methods=['GET'])
def get_supply_forecast():
    """
    GET /api/forecast/supply?material=PET&region=Mumbai&days=30
    Returns predicted supply for specific material and region
    """
    if not ML_ENABLED:
        return jsonify({'error': 'ML forecasting not available'}), 503
    
    material = request.args.get('material', 'PET')
    region = request.args.get('region', 'Mumbai')
    days = int(request.args.get('days', 30))
    
    try:
        predictions = ml_forecast.forecaster.predict_future_supply(material, region, days)
        total_volume = sum(p['predicted_volume'] for p in predictions)
        
        return jsonify({
            'material': material,
            'region': region,
            'days_ahead': days,
            'total_predicted_volume': round(total_volume, 2),
            'predictions': predictions
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecast/market', methods=['GET'])
def get_market_forecast():
    """
    GET /api/forecast/market?days=90
    Returns complete market forecast for all materials and regions
    """
    if not ML_ENABLED:
        return jsonify({'error': 'ML forecasting not available'}), 503
    
    days = int(request.args.get('days', 90))
    
    try:
        forecast = ml_forecast.forecaster.get_market_forecast(days)
        return jsonify({
            'days_ahead': days,
            'forecast': forecast
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecast/materials', methods=['GET'])
def get_material_types():
    """
    GET /api/forecast/materials
    Returns list of available material types and regions
    """
    if not ML_ENABLED:
        return jsonify({'error': 'ML forecasting not available'}), 503
    
    return jsonify({
        'materials': ml_forecast.forecaster.material_types,
        'regions': ml_forecast.forecaster.regions
    }), 200

# ============================================================
# MARKETPLACE ENDPOINTS
# ============================================================

@app.route('/api/listings/create', methods=['POST'])
def create_listing():
    """Create a new material listing (Recycler)"""
    data = request.json
    try:
        required_fields = ['recycler_name', 'material_type', 'purity_grade', 'volume_tons', 'region', 'price_per_ton']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        listing = market.create_listing(data)
        return jsonify(listing), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/listings', methods=['GET'])
def get_listings():
    """Get available listings with filters"""
    filters = {}
    if request.args.get('material'):
        filters['material_type'] = request.args.get('material')
    if request.args.get('region'):
        filters['region'] = request.args.get('region')
    if request.args.get('grade'):
        filters['purity_grade'] = request.args.get('grade')
    
    listings = market.get_listings(filters)
    return jsonify(listings), 200

@app.route('/api/contracts/lock', methods=['POST'])
def lock_contract():
    """Lock a contract (Manufacturer)"""
    data = request.json
    try:
        listing_id = data.get('listing_id')
        manufacturer_name = data.get('manufacturer_name')
        
        if not listing_id or not manufacturer_name:
            return jsonify({'error': 'Missing listing_id or manufacturer_name'}), 400
            
        contract = market.lock_contract(listing_id, manufacturer_name)
        return jsonify(contract), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/market/analytics', methods=['GET'])
def get_market_analytics():
    """Get market overview stats"""
    stats = market.get_market_analytics()
    return jsonify(stats), 200

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200


# Vercel serverless function handler
def handler(request):
    return app(request)

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Starting Flask Backend on http://localhost:5001")
    print("=" * 60)
    app.run(debug=True, port=5001)
