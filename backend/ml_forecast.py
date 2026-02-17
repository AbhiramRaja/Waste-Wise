import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import json
import pickle
import os

class WasteSupplyForecaster:
    """
    ML-based forecasting system for recycled material supply.
    Uses Random Forest to predict future material volumes.
    """
    
    def __init__(self):
        self.models = {}  # One model per material type
        self.material_types = ['PET', 'HDPE', 'PP', 'Aluminum', 'Steel', 'Cardboard', 'Paper']
        self.regions = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad']
        
    def generate_synthetic_data(self, days=180):
        """
        Generate 6 months of synthetic waste collection data.
        Includes seasonal patterns, weekly cycles, and regional variations.
        """
        print(f"[ML] Generating {days} days of synthetic data...")
        
        data = []
        start_date = datetime.now() - timedelta(days=days)
        
        for day in range(days):
            current_date = start_date + timedelta(days=day)
            day_of_week = current_date.weekday()
            month = current_date.month
            
            for region in self.regions:
                for material in self.material_types:
                    # Base volume with regional variation
                    base_volume = {
                        'PET': 50,
                        'HDPE': 30,
                        'PP': 25,
                        'Aluminum': 15,
                        'Steel': 20,
                        'Cardboard': 40,
                        'Paper': 35
                    }[material]
                    
                    # Regional multipliers
                    region_multiplier = {
                        'Mumbai': 1.5,
                        'Delhi': 1.4,
                        'Bangalore': 1.3,
                        'Chennai': 1.1,
                        'Kolkata': 1.0,
                        'Hyderabad': 1.2
                    }[region]
                    
                    # Weekly pattern (more waste on weekends)
                    weekly_factor = 1.2 if day_of_week >= 5 else 1.0
                    
                    # Seasonal pattern (festivals, holidays)
                    seasonal_factor = 1.0
                    if month in [10, 11]:  # Diwali season
                        seasonal_factor = 1.3
                    elif month in [3, 4]:  # Holi season
                        seasonal_factor = 1.15
                    
                    # Calculate volume with noise
                    volume = base_volume * region_multiplier * weekly_factor * seasonal_factor
                    volume += np.random.normal(0, volume * 0.1)  # 10% noise
                    volume = max(0, volume)  # No negative volumes
                    
                    data.append({
                        'date': current_date.strftime('%Y-%m-%d'),
                        'day_of_week': day_of_week,
                        'month': month,
                        'region': region,
                        'material_type': material,
                        'volume_tons': round(volume, 2)
                    })
        
        df = pd.DataFrame(data)
        print(f"[ML] Generated {len(df)} data points")
        return df
    
    def prepare_features(self, df):
        """
        Create features for ML model.
        """
        # Add rolling averages
        df = df.sort_values('date')
        df['prev_7day_avg'] = df.groupby(['region', 'material_type'])['volume_tons'].transform(
            lambda x: x.rolling(window=7, min_periods=1).mean()
        )
        df['prev_30day_avg'] = df.groupby(['region', 'material_type'])['volume_tons'].transform(
            lambda x: x.rolling(window=30, min_periods=1).mean()
        )
        
        return df
    
    def train_models(self, df):
        """
        Train Random Forest models for each material type.
        """
        print("[ML] Training Random Forest models...")
        
        df = self.prepare_features(df)
        
        for material in self.material_types:
            material_data = df[df['material_type'] == material].copy()
            
            # Features
            X = material_data[['day_of_week', 'month', 'prev_7day_avg', 'prev_30day_avg']]
            # Encode region as numeric
            material_data['region_encoded'] = pd.Categorical(material_data['region']).codes
            X['region'] = material_data['region_encoded']
            
            # Target
            y = material_data['volume_tons']
            
            # Train/test split
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Train model
            model = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=10)
            model.fit(X_train, y_train)
            
            # Evaluate
            train_score = model.score(X_train, y_train)
            test_score = model.score(X_test, y_test)
            
            print(f"[ML] {material}: Train R² = {train_score:.3f}, Test R² = {test_score:.3f}")
            
            self.models[material] = model
        
        print("[ML] All models trained successfully!")
    
    def predict_future_supply(self, material_type, region, days_ahead=30):
        """
        Predict future supply for a specific material and region.
        """
        if material_type not in self.models:
            raise ValueError(f"No model trained for {material_type}")
        
        model = self.models[material_type]
        
        # Generate future dates
        predictions = []
        current_date = datetime.now()
        
        # Use recent averages as baseline
        prev_7day_avg = 50  # Placeholder, would use real data
        prev_30day_avg = 48
        
        region_code = self.regions.index(region) if region in self.regions else 0
        
        for day in range(days_ahead):
            future_date = current_date + timedelta(days=day)
            day_of_week = future_date.weekday()
            month = future_date.month
            
            # Prepare features
            features = np.array([[day_of_week, month, prev_7day_avg, prev_30day_avg, region_code]])
            
            # Predict
            predicted_volume = model.predict(features)[0]
            
            predictions.append({
                'date': future_date.strftime('%Y-%m-%d'),
                'predicted_volume': round(predicted_volume, 2)
            })
            
            # Update rolling averages (simplified)
            prev_7day_avg = predicted_volume
        
        return predictions
    
    def get_market_forecast(self, days_ahead=90):
        """
        Get complete market forecast for all materials and regions.
        """
        forecast = {}
        
        for material in self.material_types:
            forecast[material] = {}
            for region in self.regions:
                try:
                    predictions = self.predict_future_supply(material, region, days_ahead)
                    total_volume = sum(p['predicted_volume'] for p in predictions)
                    forecast[material][region] = {
                        'total_volume_tons': round(total_volume, 2),
                        'daily_predictions': predictions[:30]  # First 30 days
                    }
                except Exception as e:
                    print(f"[ML] Error predicting {material} in {region}: {e}")
        
        return forecast
    
    def save_models(self, path='backend/models'):
        """
        Save trained models to disk.
        """
        os.makedirs(path, exist_ok=True)
        for material, model in self.models.items():
            filename = f"{path}/{material}_model.pkl"
            with open(filename, 'wb') as f:
                pickle.dump(model, f)
        print(f"[ML] Models saved to {path}")
    
    def load_models(self, path='backend/models'):
        """
        Load trained models from disk.
        """
        for material in self.material_types:
            filename = f"{path}/{material}_model.pkl"
            if os.path.exists(filename):
                with open(filename, 'rb') as f:
                    self.models[material] = pickle.load(f)
        print(f"[ML] Models loaded from {path}")


# Initialize and train on import
print("[ML] Initializing Waste Supply Forecaster...")
forecaster = WasteSupplyForecaster()

# Generate and train if models don't exist
if not os.path.exists('backend/models'):
    print("[ML] No existing models found. Training new models...")
    df = forecaster.generate_synthetic_data(days=180)
    forecaster.train_models(df)
    forecaster.save_models()
    
    # Save sample data for reference
    df.to_json('backend/data/synthetic_waste_data.json', orient='records', indent=2)
    print("[ML] Synthetic data saved to backend/data/synthetic_waste_data.json")
else:
    print("[ML] Loading existing models...")
    forecaster.load_models()

print("[ML] Forecaster ready!")
