
import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

# Mocking the class structure slightly or just extracting the function logic
def load_real_data():
    """
    Load real historical data (2019-2023) from CSV and interpolate to daily.
    """
    print(f"[ML] Loading real data from CSV...")
    try:
        csv_path = os.path.join('backend', 'data', 'Waste_Management_and_Recycling_India.csv')
        if not os.path.exists(csv_path):
            print(f"[ML] CSV not found at {csv_path}")
            return None
            
        df = pd.read_csv(csv_path)
        df.columns = [c.strip() for c in df.columns]
        
        print(f"CSV Loaded. Rows: {len(df)}")
        print(f"Columns: {df.columns.tolist()}")
        print(f"Cities: {df['City/District'].unique()[:5]}")
        
        data = []
        
        type_map = {
            'Plastic': ['PET', 'HDPE', 'PP'],
            'Organic': [], 
            'E-Waste': ['Aluminum', 'Steel'],
            'Construction': [],
            'Hazardous': []
        }
        
        target_cities = df['City/District'].unique()
        print(f"Processing {len(target_cities)} cities...")
        
        for city in target_cities:
            city_df = df[df['City/District'] == city]
            
            for waste_type, materials in type_map.items():
                if not materials: continue
                
                type_rows = city_df[city_df['Waste Type'] == waste_type].sort_values('Year')
                if type_rows.empty: continue
                
                yearly_tpd = type_rows.set_index('Year')['Waste Generated (Tons/Day)'].to_dict()
                
                start_date = datetime(2019, 1, 1)
                end_date = datetime(2023, 12, 31)
                delta_days = (end_date - start_date).days
                
                for i in range(delta_days + 1):
                    current_date = start_date + timedelta(days=i)
                    year = current_date.year
                    
                    val_curr = yearly_tpd.get(year, 0)
                    val_next = yearly_tpd.get(year + 1, val_curr)
                    
                    # Simple interpolation
                    day_of_year = current_date.timetuple().tm_yday
                    alpha = day_of_year / 365.0
                    interpolated_tpd = val_curr + (val_next - val_curr) * alpha
                    
                    # Split ratio
                    split_ratio = 1.0 / len(materials)
                    
                    for mat in materials:
                        vol = interpolated_tpd * split_ratio
                        if vol > 0:
                            data.append({
                                'date': current_date.strftime('%Y-%m-%d'),
                                'region': city,
                                'material_type': mat,
                                'volume_tons': round(vol, 2)
                            })
                        
        print(f"[ML] Generated {len(data)} data points.")
        return pd.DataFrame(data)
        
    except Exception as e:
        print(f"[ML] Error: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    df = load_real_data()
    if df is not None and not df.empty:
        print(df.head())
    else:
        print("Empty DataFrame")
