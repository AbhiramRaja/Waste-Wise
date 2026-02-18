import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'

export default function RecyclerDashboard() {
    const location = useLocation()
    const navigate = useNavigate()
    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        recycler_name: 'GreenCycle Mumbai', // Default for demo
        material_type: 'PET',
        purity_grade: 'Standard',
        volume_tons: '',
        region: 'Mumbai',
        price_per_ton: '',
        available_date: new Date().toISOString().split('T')[0]
    })
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    useEffect(() => {
        fetchListings()

        // Check for pre-filled data from Scanner
        if (location.state) {
            const { material, grade, price } = location.state

            // Map Grade A/B/C to Industry Terms
            let mappedGrade = 'Standard'
            if (grade === 'A') mappedGrade = 'Food-Grade'
            if (grade === 'B') mappedGrade = 'Standard'
            if (grade === 'C') mappedGrade = 'Industrial'

            setFormData(prev => ({
                ...prev,
                material_type: material || 'PET',
                purity_grade: mappedGrade,
                price_per_ton: price || '',
                volume_tons: '' // User still needs to input volume
            }))

            // Clear state to prevent re-filling on refresh
            window.history.replaceState({}, document.title)
        }
    }, [location.state])

    const fetchListings = async () => {
        try {
            const res = await axios.get('/api/listings')
            setListings(res.data)
        } catch (err) {
            console.error(err)
            setError('Failed to fetch listings')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        try {
            await axios.post('/api/listings/create', formData)
            setSuccess('Listing created successfully!')
            fetchListings() // Refresh list
            // Reset form partly
            setFormData({ ...formData, volume_tons: '', price_per_ton: '' })
        } catch (err) {
            console.error(err)
            setError('Failed to create listing')
        }
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-stone-800 dark:text-white">
                        Recycler Dashboard
                    </h1>
                    <p className="text-stone-600 dark:text-stone-400 mt-2">
                        Manage your recycled material inventory and listings
                    </p>
                </div>
                <div className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg font-medium">
                    Logged in as: {formData.recycler_name}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Listing Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span>➕</span> Create New Listing
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Material Type</label>
                                <select
                                    name="material_type"
                                    data-testid="material-select"
                                    value={formData.material_type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                                >
                                    {['PET', 'HDPE', 'PP', 'Aluminum', 'Steel', 'Cardboard', 'Paper'].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Purity Grade</label>
                                    <select
                                        name="purity_grade"
                                        value={formData.purity_grade}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                                    >
                                        <option value="Food-Grade">Food-Grade ⭐</option>
                                        <option value="Industrial">Industrial</option>
                                        <option value="Standard">Standard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Region</label>
                                    <select
                                        name="region"
                                        value={formData.region}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                                    >
                                        {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'].map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Volume (Tons)</label>
                                    <input
                                        type="number"
                                        name="volume_tons"
                                        value={formData.volume_tons}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Price (₹/Ton)</label>
                                    <input
                                        type="number"
                                        name="price_per_ton"
                                        data-testid="price-input"
                                        value={formData.price_per_ton}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Available Date</label>
                                <input
                                    type="date"
                                    name="available_date"
                                    value={formData.available_date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                                />
                            </div>

                            <button
                                type="submit"
                                data-testid="post-listing-btn"
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-200 dark:shadow-none"
                            >
                                Post Listing
                            </button>

                            {success && (
                                <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center">
                                    {success}
                                </div>
                            )}
                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
                                    {error}
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Active Listings */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-6">Your Active Listings</h2>

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {listings.map(listing => (
                                <motion.div
                                    key={listing.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-stone-900 p-5 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${listing.purity_grade === 'Food-Grade'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-stone-100 text-stone-600'
                                                }`}>
                                                {listing.purity_grade}
                                            </span>
                                            <h3 className="text-lg font-bold mt-1">{listing.material_type}</h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-emerald-600">
                                                {listing.volume_tons} Tons
                                            </div>
                                            <div className="text-sm text-stone-500">
                                                @ ₹{listing.price_per_ton}/ton
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-sm text-stone-500 pt-3 border-t border-stone-100 dark:border-stone-800">
                                        <div className="flex items-center gap-1">
                                            <span>📍</span> {listing.region}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span>📅</span> Available: {listing.available_date}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
