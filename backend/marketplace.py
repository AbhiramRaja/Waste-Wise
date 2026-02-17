import json
import uuid
from datetime import datetime
import os

class Marketplace:
    def __init__(self, data_file=None):
        if data_file is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            self.data_file = os.path.join(base_dir, 'data', 'marketplace_data.json')
        else:
            self.data_file = data_file
        self.listings = []
        self.contracts = []
        self.load_data()
        
        # Seed data if empty
        if not self.listings:
            self.seed_data()

    def load_data(self):
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r') as f:
                    data = json.load(f)
                    self.listings = data.get('listings', [])
                    self.contracts = data.get('contracts', [])
                print(f"[Marketplace] Loaded {len(self.listings)} listings and {len(self.contracts)} contracts")
            else:
                self.listings = []
                self.contracts = []
        except Exception as e:
            print(f"[Marketplace] Error loading data: {e}")
            self.listings = []
            self.contracts = []

    def save_data(self):
        try:
            os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
            with open(self.data_file, 'w') as f:
                json.dump({
                    'listings': self.listings,
                    'contracts': self.contracts
                }, f, indent=2)
        except Exception as e:
            print(f"[Marketplace] Error saving data: {e}")

    def seed_data(self):
        print("[Marketplace] Seeding initial data...")
        dummy_listings = [
            {
                "id": str(uuid.uuid4()),
                "recycler_name": "GreenCycle Mumbai",
                "material_type": "PET",
                "purity_grade": "Food-Grade",
                "volume_tons": 250,
                "available_date": "2026-03-15",
                "region": "Mumbai",
                "price_per_ton": 45000,
                "status": "available",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "recycler_name": "Delhi Waste Solutions",
                "material_type": "HDPE",
                "purity_grade": "Industrial",
                "volume_tons": 120,
                "available_date": "2026-03-01",
                "region": "Delhi",
                "price_per_ton": 38000,
                "status": "available",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "recycler_name": "Bangalore EcoHub",
                "material_type": "Aluminum",
                "purity_grade": "Standard",
                "volume_tons": 50,
                "available_date": "2026-02-28",
                "region": "Bangalore",
                "price_per_ton": 110000,
                "status": "available",
                "created_at": datetime.now().isoformat()
            },
             {
                "id": str(uuid.uuid4()),
                "recycler_name": "Chennai PureRecycle",
                "material_type": "PET",
                "purity_grade": "Food-Grade",
                "volume_tons": 300,
                "available_date": "2026-04-01",
                "region": "Chennai",
                "price_per_ton": 46000,
                "status": "available",
                "created_at": datetime.now().isoformat()
            }
        ]
        self.listings.extend(dummy_listings)
        self.save_data()

    def create_listing(self, data):
        listing = {
            "id": str(uuid.uuid4()),
            "recycler_name": data.get("recycler_name"),
            "material_type": data.get("material_type"),
            "purity_grade": data.get("purity_grade"),
            "volume_tons": float(data.get("volume_tons")),
            "available_date": data.get("available_date"),
            "region": data.get("region"),
            "price_per_ton": float(data.get("price_per_ton")),
            "status": "available",
            "created_at": datetime.now().isoformat()
        }
        self.listings.append(listing)
        self.save_data()
        return listing

    def get_listings(self, filters=None):
        if not filters:
            return [l for l in self.listings if l['status'] == 'available']
        
        filtered = []
        for l in self.listings:
            if l['status'] != 'available':
                continue
                
            match = True
            if filters.get('material_type') and l['material_type'] != filters['material_type']:
                match = False
            if filters.get('region') and l['region'] != filters['region']:
                match = False
            if filters.get('purity_grade') and l['purity_grade'] != filters['purity_grade']:
                match = False
            
            if match:
                filtered.append(l)
        
        return filtered

    def lock_contract(self, listing_id, manufacturer_name):
        listing = next((l for l in self.listings if l['id'] == listing_id), None)
        if not listing:
            raise ValueError("Listing not found")
        
        if listing['status'] != 'available':
            raise ValueError("Listing is no longer available")
        
        # update listing status
        listing['status'] = 'locked'
        
        # create contract
        contract = {
            "id": str(uuid.uuid4()),
            "listing_id": listing_id,
            "manufacturer_name": manufacturer_name,
            "recycler_name": listing['recycler_name'],
            "material_type": listing['material_type'],
            "volume_tons": listing['volume_tons'],
            "price_per_ton": listing['price_per_ton'],
            "total_value": listing['volume_tons'] * listing['price_per_ton'],
            "contract_date": datetime.now().isoformat(),
            "status": "confirmed"
        }
        self.contracts.append(contract)
        self.save_data()
        return contract

    def get_market_analytics(self):
        total_volume = sum(c['volume_tons'] for c in self.contracts)
        total_value = sum(c['total_value'] for c in self.contracts)
        active_listings = len([l for l in self.listings if l['status'] == 'available'])
        
        return {
            "total_volume_traded": total_volume,
            "total_value_traded": total_value,
            "active_listings": active_listings,
            "latest_contracts": self.contracts[-5:]
        }

# Initialize marketplace
exchange = Marketplace()
