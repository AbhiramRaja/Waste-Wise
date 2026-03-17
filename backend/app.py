from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import threading
import traceback
import sys

# Import ML forecasting module in background
ml_forecast = None
ml_load_failed = False
ml_error_details = None

def _load_ml():
    global ml_forecast, ml_load_failed, ml_error_details
    try:
        print("[APP] Starting background ML loading...")
        # Ensure we can find the module even if path is weird
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        import ml_forecast as _ml
        ml_forecast = _ml
        print("[APP] ML Forecasting module loaded successfully")
    except Exception as e:
        ml_load_failed = True
        ml_error_details = str(e)
        print(f"[APP] ML Forecasting load FAILED: {e}")
        traceback.print_exc()

# Start background thread
threading.Thread(target=_load_ml, daemon=True).start()

app = Flask(__name__)
# Explicitly allow the Vercel origin and all common headers
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

@app.errorhandler(Exception)
def handle_exception(e):
    """Global error handler for any uncaught server errors."""
    print(f"[SERVER ERROR] {str(e)}")
    traceback.print_exc()
    return jsonify({
        "error": "Internal Server Error",
        "message": str(e),
        "status": 500
    }), 500

def ml_not_ready_response():
    """Returns appropriate 503 response when ML is not ready."""
    if ml_load_failed:
        return jsonify({
            'error': f'ML forecasting failed to load: {ml_error_details}',
            'status': 'error'
        }), 503
    return jsonify({
        'error': 'ML models are training or loading in the background. This takes ~30–60 seconds on first launch.',
        'ml_loading': True,
        'status': 'loading'
    }), 503

@app.route('/')
def health_check():
    status = "active"
    ml_status = "loading"
    if ml_forecast: ml_status = "ready"
    if ml_load_failed: ml_status = "failed"
    
    return jsonify({
        "status": status,
        "service": "WasteWise Backend",
        "ml_module": ml_status,
        "environment": "production" if os.getenv('RENDER') else "development",
        "ml_error": ml_error_details
    }), 200

@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    import utils
    try:
        data = utils.get_dashboard_data()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/city-data', methods=['GET'])
def city_data():
    import utils
    try:
        city = request.args.get('city')
        if not city:
            return jsonify({'message': 'City parameter required'}), 400

        data = utils.get_multi_city_data(city)
        if data:
            return jsonify(data), 200
        return jsonify({'message': 'No real data available'}), 404
    except Exception as e:
        print(f"[CITY-DATA ERROR] {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    import utils
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        response_text = utils.get_chat_response(data['message'], data.get('history', []))
        return jsonify({'response': response_text}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to generate response'}), 500

# ML FORECASTING ENDPOINTS
@app.route('/api/forecast/supply', methods=['GET'])
def get_supply_forecast():
    if ml_forecast is None:
        return ml_not_ready_response()
    
    try:
        material = request.args.get('material', 'PET')
        region = request.args.get('region', 'Mumbai')
        days = int(request.args.get('days', 30))
        
        predictions = ml_forecast.forecaster.predict_future_supply(material, region, days)
        return jsonify({
            'material': material,
            'region': region,
            'days_ahead': days,
            'predictions': predictions
        }), 200
    except Exception as e:
        print(f"[FORECAST ERROR] {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecast/materials', methods=['GET'])
def get_material_types():
    if ml_forecast is None:
        return ml_not_ready_response()
    
    try:
        return jsonify({
            'materials': ml_forecast.forecaster.material_types,
            'regions': ml_forecast.forecaster.regions
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# MARKETPLACE ENDPOINTS
@app.route('/api/listings/create', methods=['POST'])
def create_listing():
    from marketplace import exchange as market
    try:
        data = request.json
        listing = market.create_listing(data)
        return jsonify(listing), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/listings', methods=['GET'])
def get_listings():
    from marketplace import exchange as market
    try:
        filters = {}
        if request.args.get('material'): filters['material_type'] = request.args.get('material')
        if request.args.get('region'): filters['region'] = request.args.get('region')
        
        listings = market.get_listings(filters)
        return jsonify(listings), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/contracts/lock', methods=['POST'])
def lock_contract():
    from marketplace import exchange as market
    try:
        data = request.json
        contract = market.lock_contract(data.get('listing_id'), data.get('manufacturer_name'))
        return jsonify(contract), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/market/analytics', methods=['GET'])
def get_market_analytics():
    from marketplace import exchange as market
    try:
        return jsonify(market.get_market_analytics()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return health_check()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, port=port, host='0.0.0.0')
