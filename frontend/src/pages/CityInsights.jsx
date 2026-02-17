import { useState } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { INDIAN_STATES, CITIES_BY_STATE, CITY_DATA } from '../data/indianCitiesData'

const SUGGESTIONS = [
    { priority: 'HIGH', title: 'Increase Compost Bins', description: 'Add more compost bins in residential areas for organic waste', impact: '+8% diversion' },
    { priority: 'HIGH', title: 'Route Optimization', description: 'Consolidate collection routes for better fuel efficiency', impact: '-15% fuel' },
    { priority: 'MED', title: 'Education Campaign', description: 'Launch waste segregation awareness in schools and colleges', impact: '+5% participation' },
    { priority: 'MED', title: 'E-Waste Collection', description: 'Partner with electronics stores for e-waste drop-off points', impact: '+12% e-waste' },
    { priority: 'LOW', title: 'Bin Sensors', description: 'Install IoT fill-level sensors on public bins', impact: '+3% efficiency' },
    { priority: 'LOW', title: 'Mobile App', description: 'Develop resident-facing waste collection schedule app', impact: '+7% engagement' }
]

// City coordinates (approximate center points)
const CITY_COORDINATES = {
    // Tamil Nadu
    'Chennai': [13.0827, 80.2707],
    'Coimbatore': [11.0168, 76.9558],
    'Madurai': [9.9252, 78.1198],
    'Tiruchirappalli': [10.7905, 78.7047],
    'Salem': [11.6643, 78.1460],
    // Karnataka
    'Bengaluru': [12.9716, 77.5946],
    'Mysuru': [12.2958, 76.6394],
    'Mangaluru': [12.9141, 74.8560],
    'Hubballi': [15.3647, 75.1240],
    'Belagavi': [15.8497, 74.4977],
    // Kerala
    'Thiruvananthapuram': [8.5241, 76.9366],
    'Kochi': [9.9312, 76.2673],
    'Kozhikode': [11.2588, 75.7804],
    'Thrissur': [10.5276, 76.2144],
    'Kollam': [8.8932, 76.6141],
    // Maharashtra
    'Mumbai': [19.0760, 72.8777],
    'Pune': [18.5204, 73.8567],
    'Nagpur': [21.1458, 79.0882],
    'Thane': [19.2183, 72.9781],
    'Nashik': [19.9975, 73.7898],
    // Delhi
    'New Delhi': [28.6139, 77.2090],
    // Add more as needed - using approximate coordinates
}

function generateCollectionPoints(city) {
    const baseCoords = CITY_COORDINATES[city] || [28.6139, 77.2090]
    const points = []

    // Generate 8-12 random collection points around the city
    const numPoints = Math.floor(Math.random() * 5) + 8

    for (let i = 0; i < numPoints; i++) {
        const latOffset = (Math.random() - 0.5) * 0.1
        const lngOffset = (Math.random() - 0.5) * 0.1
        const fillLevel = ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]

        points.push({
            id: i,
            position: [baseCoords[0] + latOffset, baseCoords[1] + lngOffset],
            fillLevel,
            location: `Collection Point ${i + 1}`
        })
    }

    return points
}

export default function CityInsights() {
    const [selectedState, setSelectedState] = useState('Tamil Nadu')
    const [selectedCity, setSelectedCity] = useState('Chennai')

    const cityKey = `${selectedCity}, ${selectedState}`
    const data = CITY_DATA[cityKey]
    const collectionPoints = generateCollectionPoints(selectedCity)
    const cityCenter = CITY_COORDINATES[selectedCity] || [28.6139, 77.2090]

    const handleStateChange = (newState) => {
        setSelectedState(newState)
        setSelectedCity(CITIES_BY_STATE[newState][0])
    }

    const getFillColor = (fillLevel) => {
        switch (fillLevel) {
            case 'high': return '#ef4444'
            case 'medium': return '#eab308'
            case 'low': return '#22c55e'
            default: return '#6b7280'
        }
    }

    // Create route line connecting points
    const routePoints = collectionPoints.map(p => p.position)

    return (
        <div className="container mx-auto px-6 py-8 max-w-7xl">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <h1 className="text-3xl font-bold">City Insights Dashboard</h1>
                <div className="flex gap-3">
                    <select
                        value={selectedState}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-[rgb(var(--border))] bg-stone-800 font-medium"
                    >
                        {INDIAN_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-[rgb(var(--border))] bg-stone-800 font-medium"
                    >
                        {CITIES_BY_STATE[selectedState].map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="card p-6">
                    <div className="text-sm text-[rgb(var(--text-secondary))] mb-1">Recycling Rate</div>
                    <div className="text-3xl font-bold text-emerald-400">{data.recyclingRate}%</div>
                    <div className={`text-xs mt-1 ${data.deltas.recyclingRate > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {data.deltas.recyclingRate > 0 ? '↑' : '↓'} {Math.abs(data.deltas.recyclingRate)}% vs last month
                    </div>
                </div>
                <div className="card p-6">
                    <div className="text-sm text-[rgb(var(--text-secondary))] mb-1">Monthly Scans</div>
                    <div className="text-3xl font-bold">{data.monthlyScans.toLocaleString()}</div>
                    <div className={`text-xs mt-1 ${data.deltas.monthlyScans > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {data.deltas.monthlyScans > 0 ? '↑' : '↓'} {Math.abs(data.deltas.monthlyScans)}% vs last month
                    </div>
                </div>
                <div className="card p-6">
                    <div className="text-sm text-[rgb(var(--text-secondary))] mb-1">Active Routes</div>
                    <div className="text-3xl font-bold">{data.activeRoutes}</div>
                    <div className={`text-xs mt-1 ${data.deltas.activeRoutes === 0 ? 'text-[rgb(var(--text-secondary))]' : data.deltas.activeRoutes > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {data.deltas.activeRoutes === 0 ? '→' : data.deltas.activeRoutes > 0 ? '↑' : '↓'} {Math.abs(data.deltas.activeRoutes)} routes
                    </div>
                </div>
                <div className="card p-6">
                    <div className="text-sm text-[rgb(var(--text-secondary))] mb-1">CO₂ Saved (kg)</div>
                    <div className="text-3xl font-bold text-emerald-400">{data.co2Saved.toLocaleString()}</div>
                    <div className={`text-xs mt-1 ${data.deltas.co2Saved > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {data.deltas.co2Saved > 0 ? '↑' : '↓'} {Math.abs(data.deltas.co2Saved)}% vs last month
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Bar Chart */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Weekly Sorting Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.weeklyData}>
                            <XAxis dataKey="day" stroke="#a8a29e" />
                            <YAxis stroke="#a8a29e" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#292524', border: '1px solid #44403c' }}
                                labelStyle={{ color: '#fafaf9' }}
                            />
                            <Legend />
                            <Bar dataKey="Recyclable" stackId="a" fill="#10b981" />
                            <Bar dataKey="Compostable" stackId="a" fill="#84cc16" />
                            <Bar dataKey="Landfill" stackId="a" fill="#6b7280" />
                            <Bar dataKey="Hazardous" stackId="a" fill="#ef4444" />
                            <Bar dataKey="EWaste" stackId="a" fill="#f59e0b" />
                            <Bar dataKey="Special" stackId="a" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Waste Composition</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data.composition}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                label={(entry) => `${entry.name}: ${entry.value}%`}
                            >
                                {data.composition.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#292524', border: '1px solid #44403c' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* AI Suggestions */}
            <div className="card mb-8">
                <h3 className="text-lg font-semibold mb-4">AI-Generated Optimization Suggestions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SUGGESTIONS.map((suggestion, idx) => (
                        <div key={idx} className="border border-[rgb(var(--border))] rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold">{suggestion.title}</h4>
                                <span className={`text-xs px-2 py-1 rounded ${suggestion.priority === 'HIGH' ? 'bg-red-900 text-red-300' :
                                    suggestion.priority === 'MED' ? 'bg-yellow-900 text-yellow-300' :
                                        'bg-blue-900 text-blue-300'
                                    }`}>
                                    {suggestion.priority}
                                </span>
                            </div>
                            <p className="text-sm text-[rgb(var(--text-secondary))] mb-2">{suggestion.description}</p>
                            <div className="text-xs font-medium text-emerald-400">Est. Impact: {suggestion.impact}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Collection Map */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Collection Hotspot Map - {selectedCity}</h3>
                <div className="rounded-lg h-96 bg-stone-800 relative overflow-hidden">
                    <svg width="100%" height="100%" className="absolute inset-0">
                        {/* Grid background */}
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#44403c" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />

                        {/* Collection route */}
                        <polyline
                            points={collectionPoints.map((p, i) => `${(i / collectionPoints.length) * 90 + 5}%,${Math.random() * 80 + 10}%`).join(' ')}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            opacity="0.6"
                        />

                        {/* Collection points */}
                        {collectionPoints.map((point, idx) => {
                            const x = (idx / collectionPoints.length) * 90 + 5
                            const y = Math.random() * 80 + 10
                            return (
                                <g key={point.id}>
                                    <circle
                                        cx={`${x}%`}
                                        cy={`${y}%`}
                                        r="8"
                                        fill={getFillColor(point.fillLevel)}
                                        stroke="#fff"
                                        strokeWidth="2"
                                        className="cursor-pointer hover:r-10 transition-all"
                                    />
                                    <text
                                        x={`${x}%`}
                                        y={`${y - 2}%`}
                                        textAnchor="middle"
                                        fill="#fafaf9"
                                        fontSize="10"
                                        className="pointer-events-none"
                                    >
                                        {idx + 1}
                                    </text>
                                </g>
                            )
                        })}
                    </svg>

                    {/* City label */}
                    <div className="absolute top-4 left-4 bg-stone-900/90 px-3 py-2 rounded-lg text-sm">
                        📍 {selectedCity}, {selectedState}
                    </div>

                    {/* Collection points info */}
                    <div className="absolute bottom-4 right-4 bg-stone-900/90 px-3 py-2 rounded-lg text-xs">
                        {collectionPoints.length} Collection Points
                    </div>
                </div>

                {/* Map Legend */}
                <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>High Fill (&gt;80%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>Medium Fill (40-80%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Low Fill (&lt;40%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500"></div>
                        <span className="text-xs">Collection Route</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
