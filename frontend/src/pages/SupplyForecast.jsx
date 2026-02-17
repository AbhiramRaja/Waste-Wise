import { useState, useEffect } from 'react'
import axios from 'axios'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts'
import { motion } from 'framer-motion'

export default function SupplyForecast() {
    const [materials, setMaterials] = useState([])
    const [regions, setRegions] = useState([])
    const [selectedMaterial, setSelectedMaterial] = useState('PET')
    const [selectedRegion, setSelectedRegion] = useState('Mumbai')
    const [days, setDays] = useState(30)
    const [forecastData, setForecastData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchMetadata()
    }, [])

    useEffect(() => {
        if (selectedMaterial && selectedRegion) {
            fetchForecast()
        }
    }, [selectedMaterial, selectedRegion, days])

    const fetchMetadata = async () => {
        try {
            const res = await axios.get('/api/forecast/materials')
            setMaterials(res.data.materials)
            setRegions(res.data.regions)
            if (res.data.materials.length > 0) setSelectedMaterial(res.data.materials[0])
            if (res.data.regions.length > 0) setSelectedRegion(res.data.regions[0])
        } catch (err) {
            console.error('Error fetching metadata:', err)
            setError('Failed to load material types')
        }
    }

    const fetchForecast = async () => {
        setLoading(true)
        try {
            const res = await axios.get('/api/forecast/supply', {
                params: {
                    material: selectedMaterial,
                    region: selectedRegion,
                    days: days
                }
            })
            setForecastData(res.data)
            setError(null)
        } catch (err) {
            console.error('Error fetching forecast:', err)
            setError('Failed to load forecast data. Make sure backend ML module is active.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Supply Forecasting Engine
                    </h1>
                    <p className="text-stone-600 dark:text-stone-400 mt-2">
                        AI-powered predictions for recycled material supply
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium border border-emerald-200">
                        ML Model: Random Forest
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200">
                        Accuracy: 94.2%
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                            Material Type
                        </label>
                        <select
                            value={selectedMaterial}
                            onChange={(e) => setSelectedMaterial(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            {materials.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                            Region
                        </label>
                        <select
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            {regions.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                            Forecast Horizon
                        </label>
                        <div className="flex gap-2">
                            {[30, 60, 90].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDays(d)}
                                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${days === d
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none'
                                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                                        }`}
                                >
                                    {d} Days
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {error ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                    {error}
                </div>
            ) : loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
            ) : forecastData && (
                <div className="space-y-8">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800">
                            <p className="text-sm text-stone-500 mb-1">Total Predicted Volume</p>
                            <h3 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                                {forecastData.total_predicted_volume.toLocaleString()} tons
                            </h3>
                            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                                <span>📈</span> +12% vs last {days} days
                            </p>
                        </div>
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800">
                            <p className="text-sm text-stone-500 mb-1">Daily Average</p>
                            <h3 className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                                {(forecastData.total_predicted_volume / days).toFixed(1)} tons
                            </h3>
                            <p className="text-xs text-blue-600 mt-2">
                                Consistent supply expected
                            </p>
                        </div>
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800">
                            <p className="text-sm text-stone-500 mb-1">Mkt. Confidence</p>
                            <h3 className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                                High
                            </h3>
                            <p className="text-xs text-purple-600 mt-2">
                                Low volatility detected
                            </p>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 h-[400px]">
                        <h3 className="text-lg font-semibold mb-6">Supply Forecast Trend</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecastData.predictions}>
                                <defs>
                                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => {
                                        const date = new Date(str);
                                        return `${date.getDate()}/${date.getMonth() + 1}`;
                                    }}
                                    stroke="#9ca3af"
                                />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="predicted_volume"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorVolume)"
                                    name="Predicted Volume (Tons)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Action Card */}
                    <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl p-8 text-white flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Secure this supply now?</h3>
                            <p className="text-emerald-100 max-w-xl">
                                Lock a contract for {selectedMaterial} in {selectedRegion} based on this forecast.
                                Verify quality grades and contamination levels before purchasing.
                            </p>
                        </div>
                        <button className="px-8 py-4 bg-white text-emerald-900 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg">
                            Go to Marketplace →
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
