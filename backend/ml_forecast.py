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
        
    def load_real_data(self):
        """
        Load real historical data (2019-2023) from CSV and interpolate to daily.
        """
        print(f"[ML] Loading real data from CSV...")
        try:
            csv_path = os.path.join(os.path.dirname(__file__), 'data', 'Waste_Management_and_Recycling_India.csv')
            if not os.path.exists(csv_path):
                print("[ML] Single real data CSV not found, generating synthetic.")
                return self.generate_synthetic_data()
                
            df = pd.read_csv(csv_path)
            df.columns = [c.strip() for c in df.columns]
            
            data = []
            
            # Process each city as a "region"
            # We will map specific waste types to our material types
            type_map = {
                'Plastic': ['PET', 'HDPE', 'PP'], # Split plastic into 3 types
                'Organic': ['Paper'], # Use Organic trend as proxy for Paper
                'E-Waste': ['Aluminum', 'Steel'], # Metals in E-waste
                'Construction': ['Cardboard'], # Use Construction trend as proxy for Cardboard
                'Hazardous': []
            }
            
            # Only process cities that are in our target list, or expand list?
            # Let's expand regions to include all cities in CSV if possible, or just the top ones.
            # Forecaster init has self.regions. Let's update that dynamically or filter.
            # Using specific cities for now to match UI dropdowns roughly
            target_cities = df['City/District'].unique()
            self.regions = list(target_cities) # Update regions to match CSV
            
            for city in self.regions:
                city_df = df[df['City/District'] == city]
                
                # We need to interpolate yearly points to daily
                # Years: 2019, 2020, 2021, 2022, 2023
                
                for waste_type, materials in type_map.items():
                    if not materials: continue
                    
                    type_rows = city_df[city_df['Waste Type'] == waste_type].sort_values('Year')
                    if type_rows.empty: continue
                    
                    # Get yearly TPD
                    yearly_tpd = type_rows.set_index('Year')['Waste Generated (Tons/Day)'].to_dict()
                    
                    start_date = datetime(2019, 1, 1)
                    end_date = datetime(2023, 12, 31)
                    delta_days = (end_date - start_date).days
                    
                    for i in range(delta_days + 1):
                        current_date = start_date + timedelta(days=i)
                        year = current_date.year
                        month = current_date.month
                        day_of_week = current_date.weekday()
                        
                        # Get baseline TPD for this year (interpolate ideally, but step is okay for now)
                        # Or linear interpolation between years
                        val_curr = yearly_tpd.get(year, 0)
                        val_next = yearly_tpd.get(year + 1, val_curr)
                        
                        # Fraction of year passed
                        day_of_year = current_date.timetuple().tm_yday
                        alpha = day_of_year / 365.0
                        interpolated_tpd = val_curr + (val_next - val_curr) * alpha
                        
                        # Seasonality & Noise
                        weekly_factor = 1.1 if day_of_week >= 5 else 0.95
                        seasonal_factor = 1.0 + 0.1 * np.sin(2 * np.pi * day_of_year / 365) # Simple wave
                        
                        daily_total_material = interpolated_tpd * weekly_factor * seasonal_factor
                        
                        # Distribute among sub-materials (e.g. Plastic -> PET, HDPE, PP)
                        # Assume even split for simplicity or ratios
                        split_ratio = 1.0 / len(materials)
                        
                        for mat in materials:
                            vol = daily_total_material * split_ratio
                            # Add noise
                            vol += np.random.normal(0, vol * 0.05)
                            
                            data.append({
                                'date': current_date.strftime('%Y-%m-%d'),
                                'day_of_week': day_of_week,
                                'month': month,
                                'region': city,
                                'material_type': mat,
                                'volume_tons': round(max(0, vol), 2)
                            })
                            
            print(f"[ML] Loaded and interpolated {len(data)} real data points.")
            return pd.DataFrame(data)
            
        except Exception as e:
            print(f"[ML] Error loading real data: {e}")
            return self.generate_synthetic_data()

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
                # Fallback to default material types if not set?
                # Actually self.regions matches UI, so we must support all self.material_types
                pass
                for material in self.material_types:
                    # Base volume with realistic city-scale data (approx. Tons Per Day for a major metro)
                    # Based on ~10% plastic composition of 10,000+ TPD total waste
                    base_volume = {
                        'PET': 650,      # ~6-7% of total waste
                        'HDPE': 400,     # ~4%
                        'PP': 350,       # ~3.5%
                        'Aluminum': 150, # ~1.5%
                        'Steel': 200,    # ~2%
                        'Cardboard': 850,# ~8.5%
                        'Paper': 700     # ~7%
                    }[material]
                    
                    # Regional multipliers based on population/industrial activity
                    region_multiplier = {
                        'Mumbai': 1.8,    # ~11,000+ TPD Total
                        'Delhi': 1.9,     # ~11,500+ TPD Total
                        'Bangalore': 1.2, # ~5,000 TPD
                        'Chennai': 1.1,   # ~5,000 TPD
                        'Kolkata': 1.0,   # ~4,500 TPD
                        'Hyderabad': 1.3  # ~6,000 TPD
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
if not os.path.exists('backend/models') or True: # Force retrain for now to pick up new CSV data
    print("[ML] Training new models with Real Data...")
    df = forecaster.load_real_data()
    forecaster.train_models(df)
    forecaster.save_models()
    
    # Save sample data for reference
    df.to_json('backend/data/training_waste_data.json', orient='records', indent=2)
    print("[ML] Training data saved to backend/data/training_waste_data.json")
else:
    print("[ML] Loading existing models...")
    forecaster.load_models()

print("[ML] Forecaster ready!")
