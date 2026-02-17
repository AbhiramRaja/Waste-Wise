import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from 'axios'

export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/api/dashboard')
            setDashboardData(response.data)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-2xl text-gray-400">Loading analytics...</div>
            </div>
        )
    }

    // Transform composition data for charting
    const compositionByWard = dashboardData?.composition.reduce((acc, item) => {
        const existing = acc.find(x => x.ward === item.ward)
        if (existing) {
            existing[item.type] = item.volume
        } else {
            acc.push({ ward: item.ward, [item.type]: item.volume })
        }
        return acc
    }, [])

    // Calculate total waste by ward for insights
    const wardTotals = compositionByWard?.map(ward => ({
        ward: ward.ward,
        total: Object.keys(ward).filter(k => k !== 'ward').reduce((sum, type) => sum + ward[type], 0)
    }))

    const highestVolumeWard = wardTotals?.reduce((max, ward) =>
        ward.total > max.total ? ward : max
        , wardTotals[0])

    return (
        <div className="container mx-auto px-4 pb-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold mb-2">Municipal Waste Analytics</h1>
                <p className="text-gray-400">Real-time insights across city wards</p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <motion.div
                    className="card"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Wards Monitored</p>
                            <p className="text-3xl font-bold mt-1">5</p>
                        </div>
                        <div className="text-4xl">🏙️</div>
                    </div>
                </motion.div>

                <motion.div
                    className="card"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Avg Collection (Tons/Day)</p>
                            <p className="text-3xl font-bold mt-1">
                                {dashboardData?.trends.reduce((sum, d) => sum + d.total, 0) / dashboardData?.trends.length || 0}
                            </p>
                        </div>
                        <div className="text-4xl">📦</div>
                    </div>
                </motion.div>

                <motion.div
                    className="card"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Avg Recycling Rate</p>
                            <p className="text-3xl font-bold mt-1">
                                {(dashboardData?.trends.reduce((sum, d) => sum + d.recyclingRate, 0) / dashboardData?.trends.length || 0).toFixed(1)}%
                            </p>
                        </div>
                        <div className="text-4xl">♻️</div>
                    </div>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Waste Composition Chart */}
                <motion.div
                    className="card"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-xl font-semibold mb-4">Waste Composition by Ward</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={compositionByWard}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="ward" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Bar dataKey="Plastic" stackId="a" fill="#EF4444" />
                            <Bar dataKey="Paper" stackId="a" fill="#F59E0B" />
                            <Bar dataKey="Metal" stackId="a" fill="#10B981" />
                            <Bar dataKey="Glass" stackId="a" fill="#3B82F6" />
                            <Bar dataKey="Organic" stackId="a" fill="#8B5CF6" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Collection Trends Chart */}
                <motion.div
                    className="card"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h2 className="text-xl font-semibold mb-4">Collection Trends (Last 7 Days)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dashboardData?.trends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="total" stroke="#14B8A6" strokeWidth={2} name="Total (Tons)" />
                            <Line type="monotone" dataKey="recyclingRate" stroke="#8B5CF6" strokeWidth={2} name="Recycling Rate (%)" />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Predictive Insights */}
            <motion.div
                className="card bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <div className="flex items-start space-x-4">
                    <div className="text-4xl">⚠️</div>
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">🚑 Predictive Logistics Alert</h3>
                        <p className="text-gray-300">
                            <span className="font-semibold text-amber-400">{highestVolumeWard?.ward}</span> has experienced a{' '}
                            <span className="font-semibold text-amber-400">15% surge</span> in waste volume this week.
                        </p>
                        <div className="mt-4 p-3 bg-black/20 rounded-lg">
                            <p className="text-sm text-gray-400">
                                <strong className="text-white">Recommendation:</strong> Re-route 2 additional collection trucks to{' '}
                                {highestVolumeWard?.ward} to prevent overflow and optimize fuel efficiency.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
