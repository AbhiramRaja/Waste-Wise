from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import threading
import traceback
import sys

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

@app.route('/')
def health_check():
    status = "active"
    
    return jsonify({
        "status": status,
        "service": "WasteWise Backend",
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
