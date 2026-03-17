from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import threading
import traceback

# Import ML forecasting module in background
ml_forecast = None
ml_load_failed = False

def _load_ml():
    global ml_forecast, ml_load_failed
    try:
        print("[APP] Starting background ML loading...")
        import ml_forecast as _ml
        ml_forecast = _ml
        print("[APP] ML Forecasting module loaded successfully")
    except Exception as e:
        ml_load_failed = True
        print(f"[APP] ML Forecasting load FAILED: {e}")
        traceback.print_exc()

# Start background thread
threading.Thread(target=_load_ml, daemon=True).start()

from marketplace import exchange as market

app = Flask(__name__)
CORS(app)

def ml_not_ready_response():
    """Returns appropriate 503 response when ML is not ready."""
    if ml_load_failed:
        return jsonify({
            'error': 'ML forecasting failed to load. Check logs for details.',
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
        "environment": "production" if os.getenv('RENDER') else "development"
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
    city = request.args.get('city')
    if not city:
        return jsonify({'message': 'City parameter required'}), 400

    data = utils.get_multi_city_data(city)
    if data:
        return jsonify(data), 200
    return jsonify({'message': 'No real data available'}), 404

@app.route('/api/chat', methods=['POST'])
def chat():
    import utils
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400
    
    try:
        response_text = utils.get_chat_response(data['message'], data.get('history', []))
        return jsonify({'response': response_text}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to generate response'}), 500

# ML FORECASTING ENDPOINTS
@app.route('/api/forecast/supply', methods=['GET'])
def get_supply_forecast():
    if ml_forecast is None:
        return ml_not_ready_response()
    
    material = request.args.get('material', 'PET')
    region = request.args.get('region', 'Mumbai')
    days = int(request.args.get('days', 30))
    
    try:
        predictions = ml_forecast.forecaster.predict_future_supply(material, region, days)
        return jsonify({
            'material': material,
            'region': region,
            'days_ahead': days,
            'predictions': predictions
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecast/materials', methods=['GET'])
def get_material_types():
    if ml_forecast is None:
        return ml_not_ready_response()
    
    return jsonify({
        'materials': ml_forecast.forecaster.material_types,
        'regions': ml_forecast.forecaster.regions
    }), 200

# MARKETPLACE ENDPOINTS
@app.route('/api/listings/create', methods=['POST'])
def create_listing():
    data = request.json
    try:
        listing = market.create_listing(data)
        return jsonify(listing), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/listings', methods=['GET'])
def get_listings():
    filters = {}
    if request.args.get('material'): filters['material_type'] = request.args.get('material')
    if request.args.get('region'): filters['region'] = request.args.get('region')
    
    listings = market.get_listings(filters)
    return jsonify(listings), 200

@app.route('/api/contracts/lock', methods=['POST'])
def lock_contract():
    data = request.json
    try:
        contract = market.lock_contract(data.get('listing_id'), data.get('manufacturer_name'))
        return jsonify(contract), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/market/analytics', methods=['GET'])
def get_market_analytics():
    return jsonify(market.get_market_analytics()), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, port=port, host='0.0.0.0')
