// Comprehensive Indian Cities Data - All South Indian States + Major North Indian States
// 10-15 real cities per state with varied waste management statistics

export const INDIAN_STATES = [
    // South Indian States
    'Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana',
    // North Indian States
    'Maharashtra', 'Delhi', 'Uttar Pradesh', 'Gujarat', 'Rajasthan',
    'Punjab', 'Haryana', 'West Bengal', 'Madhya Pradesh', 'Bihar'
]

export const CITIES_BY_STATE = {
    // SOUTH INDIAN STATES
    'Tamil Nadu': [
        'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
        'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi',
        'Thanjavur', 'Dindigul', 'Kanchipuram', 'Cuddalore', 'Karur'
    ],
    'Karnataka': [
        'Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi',
        'Davangere', 'Ballari', 'Vijayapura', 'Shivamogga', 'Tumakuru',
        'Raichur', 'Bidar', 'Hosapete', 'Gadag', 'Udupi'
    ],
    'Kerala': [
        'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam',
        'Palakkad', 'Alappuzha', 'Kannur', 'Kottayam', 'Malappuram',
        'Kasaragod', 'Pathanamthitta', 'Idukki', 'Wayanad', 'Ernakulam'
    ],
    'Andhra Pradesh': [
        'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool',
        'Rajahmundry', 'Tirupati', 'Kakinada', 'Kadapa', 'Anantapur',
        'Vizianagaram', 'Eluru', 'Ongole', 'Nandyal', 'Machilipatnam'
    ],
    'Telangana': [
        'Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar',
        'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet',
        'Siddipet', 'Miryalaguda', 'Jagtial', 'Mancherial', 'Nirmal'
    ],

    // NORTH INDIAN STATES
    'Maharashtra': [
        'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik',
        'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Navi Mumbai',
        'Sangli', 'Jalgaon', 'Akola', 'Latur', 'Ahmednagar'
    ],
    'Delhi': [
        'New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi',
        'Central Delhi', 'North East Delhi', 'North West Delhi', 'South East Delhi', 'South West Delhi',
        'Shahdara', 'Dwarka', 'Rohini', 'Najafgarh', 'Narela'
    ],
    'Uttar Pradesh': [
        'Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi',
        'Meerut', 'Prayagraj', 'Bareilly', 'Aligarh', 'Moradabad',
        'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi'
    ],
    'Gujarat': [
        'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar',
        'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad',
        'Morbi', 'Surendranagar', 'Bharuch', 'Vapi', 'Navsari'
    ],
    'Rajasthan': [
        'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer',
        'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar',
        'Pali', 'Tonk', 'Kishangarh', 'Beawar', 'Hanumangarh'
    ],
    'Punjab': [
        'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda',
        'Mohali', 'Pathankot', 'Hoshiarpur', 'Batala', 'Moga',
        'Abohar', 'Malerkotla', 'Khanna', 'Phagwara', 'Muktsar'
    ],
    'Haryana': [
        'Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar',
        'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula',
        'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Thanesar'
    ],
    'West Bengal': [
        'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri',
        'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur',
        'Shantipur', 'Dankuni', 'Dhulian', 'Ranaghat', 'Haldia'
    ],
    'Madhya Pradesh': [
        'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain',
        'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa',
        'Murwara', 'Singrauli', 'Burhanpur', 'Khandwa', 'Bhind'
    ],
    'Bihar': [
        'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia',
        'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar',
        'Munger', 'Chhapra', 'Danapur', 'Bettiah', 'Saharsa'
    ]
}

// Generate varied city data
function generateCityData(city, state) {
    // Base values vary by city size and region
    const citySize = {
        // Metro cities
        'Mumbai': 'metro', 'Delhi': 'metro', 'Bengaluru': 'metro', 'Chennai': 'metro',
        'Hyderabad': 'metro', 'Kolkata': 'metro', 'Pune': 'metro', 'Ahmedabad': 'metro',
        // Tier 1
        'Jaipur': 'tier1', 'Lucknow': 'tier1', 'Kanpur': 'tier1', 'Nagpur': 'tier1',
        'Indore': 'tier1', 'Thane': 'tier1', 'Bhopal': 'tier1', 'Visakhapatnam': 'tier1',
        'Vadodara': 'tier1', 'Ludhiana': 'tier1', 'Agra': 'tier1', 'Nashik': 'tier1',
        'Faridabad': 'tier1', 'Meerut': 'tier1', 'Rajkot': 'tier1', 'Varanasi': 'tier1',
        'Surat': 'tier1', 'Amritsar': 'tier1', 'Vijayawada': 'tier1', 'Jodhpur': 'tier1',
        'Madurai': 'tier1', 'Raipur': 'tier1', 'Kota': 'tier1', 'Gwalior': 'tier1',
        'Coimbatore': 'tier1', 'Mysuru': 'tier1', 'Kochi': 'tier1', 'Thiruvananthapuram': 'tier1'
    }

    const tier = citySize[city] || 'tier2'

    // Base statistics by tier
    const baseStats = {
        metro: {
            recyclingRate: [75, 85],
            monthlyScans: [25000, 45000],
            activeRoutes: [40, 60],
            co2Saved: [6000, 12000]
        },
        tier1: {
            recyclingRate: [68, 78],
            monthlyScans: [8000, 18000],
            activeRoutes: [18, 35],
            co2Saved: [2000, 5000]
        },
        tier2: {
            recyclingRate: [55, 70],
            monthlyScans: [2000, 8000],
            activeRoutes: [8, 18],
            co2Saved: [800, 2500]
        }
    }

    const stats = baseStats[tier]

    // Add some randomness for variety
    const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

    const recyclingRate = random(stats.recyclingRate[0], stats.recyclingRate[1])
    const monthlyScans = random(stats.monthlyScans[0], stats.monthlyScans[1])
    const activeRoutes = random(stats.activeRoutes[0], stats.activeRoutes[1])
    const co2Saved = random(stats.co2Saved[0], stats.co2Saved[1])

    // Deltas vary
    const deltas = {
        recyclingRate: random(-2, 12),
        monthlyScans: random(5, 25),
        activeRoutes: random(-1, 3),
        co2Saved: random(3, 18)
    }

    // Weekly data with realistic city-level tonnage (Thousands of Tons)
    // Scale factor: Metro ~8000-12000 TPD, Tier1 ~3000-6000 TPD, Tier2 ~1000-2500 TPD
    const scaleFactor = tier === 'metro' ? 20 : tier === 'tier1' ? 8 : 3

    const weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
        const baseMultiplier = day === 'Sat' || day === 'Sun' ? 0.9 : 1.1 // More industrial waste on weekdays
        return {
            day,
            Recyclable: Math.floor(random(150, 300) * scaleFactor * baseMultiplier),
            Compostable: Math.floor(random(200, 400) * scaleFactor * baseMultiplier),
            Landfill: Math.floor(random(100, 250) * scaleFactor * baseMultiplier),
            Hazardous: Math.floor(random(5, 15) * scaleFactor * baseMultiplier),
            EWaste: Math.floor(random(3, 10) * scaleFactor * baseMultiplier),
            Special: Math.floor(random(2, 8) * scaleFactor * baseMultiplier)
        }
    })

    // Composition varies by region
    const compositions = [
        [42, 28, 18, 6, 4, 2], // High recycling
        [38, 30, 20, 6, 4, 2], // Balanced
        [35, 25, 26, 7, 5, 2], // Higher landfill
        [40, 32, 16, 6, 4, 2]  // High compost
    ]

    const composition = compositions[random(0, 3)]

    return {
        recyclingRate,
        monthlyScans,
        activeRoutes,
        co2Saved,
        deltas,
        weeklyData,
        composition: [
            { name: 'Recyclable', value: composition[0], color: '#10b981' },
            { name: 'Compostable', value: composition[1], color: '#84cc16' },
            { name: 'Landfill', value: composition[2], color: '#6b7280' },
            { name: 'Hazardous', value: composition[3], color: '#ef4444' },
            { name: 'E-Waste', value: composition[4], color: '#f59e0b' },
            { name: 'Special', value: composition[5], color: '#8b5cf6' }
        ]
    }
}

// Generate all city data
export const CITY_DATA = {}

Object.keys(CITIES_BY_STATE).forEach(state => {
    CITIES_BY_STATE[state].forEach(city => {
        const key = `${city}, ${state}`
        CITY_DATA[key] = generateCityData(city, state)
    })
})
