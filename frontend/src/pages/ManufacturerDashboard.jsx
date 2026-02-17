import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'

export default function ManufacturerDashboard() {
    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        material: '',
        region: '',
        grade: ''
    })
    const [manufacturerName] = useState('Packaging Corp India') // Demo user
    const [contractSuccess, setContractSuccess] = useState(null)
    const [processingId, setProcessingId] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchListings()
    }, [filters])

    const fetchListings = async () => {
        setLoading(true)
        try {
            const params = {}
            if (filters.material) params.material = filters.material
            if (filters.region) params.region = filters.region
            if (filters.grade) params.grade = filters.grade

            const res = await axios.get('/api/listings', { params })
            setListings(res.data)
        } catch (err) {
            console.error(err)
            setError('Failed to fetch listings')
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value })
    }

    const handleLockContract = async (listingId) => {
        setProcessingId(listingId)
        try {
            await axios.post('/api/contracts/lock', {
                listing_id: listingId,
                manufacturer_name: manufacturerName
            })
            setContractSuccess('Contract secured successfully! Supply chain locked.')
            fetchListings() // Refresh to remove locked listing
            setTimeout(() => setContractSuccess(null), 5000)
        } catch (err) {
            console.error(err)
            setError('Failed to lock contract. It might have been taken.')
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Manufacturer Procurement
                    </h1>
                    <p className="text-stone-600 dark:text-stone-400 mt-2">
                        Browse and secure certified recycled materials
                    </p>
                </div>
                <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
                    Buyer: {manufacturerName}
                </div>
            </div>

            {/* Success Message */}
            {contractSuccess && (
                <div className="mb-8 p-4 bg-green-100 border border-green-200 text-green-800 rounded-xl flex items-center gap-3 animate-pulse">
                    <span className="text-2xl">🎉</span>
                    <span className="font-bold">{contractSuccess}</span>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Material Type</label>
                        <select
                            name="material"
                            value={filters.material}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                        >
                            <option value="">All Materials</option>
                            {['PET', 'HDPE', 'PP', 'Aluminum', 'Steel', 'Cardboard', 'Paper'].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Purity Grade</label>
                        <select
                            name="grade"
                            value={filters.grade}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                        >
                            <option value="">All Grades</option>
                            <option value="Food-Grade">Food-Grade ⭐</option>
                            <option value="Industrial">Industrial</option>
                            <option value="Standard">Standard</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Region</label>
                        <select
                            name="region"
                            value={filters.region}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                        >
                            <option value="">All Regions</option>
                            {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'].map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Listings Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : listings.length === 0 ? (
                <div className="text-center py-20 text-stone-500">
                    No listings match your criteria. Try adjusting filters.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map(listing => (
                        <motion.div
                            key={listing.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden hover:shadow-lg transition-all"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${listing.purity_grade === 'Food-Grade'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-blue-50 text-blue-800'
                                        }`}>
                                        {listing.purity_grade}
                                    </span>
                                    <span className="text-xs text-stone-400">
                                        Listed: {new Date(listing.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold mb-1">{listing.material_type}</h3>
                                <p className="text-stone-500 text-sm mb-4">Seller: {listing.recycler_name}</p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-stone-500">Volume</span>
                                        <span className="font-bold">{listing.volume_tons} Tons</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-stone-500">Price</span>
                                        <span className="font-bold text-emerald-600">₹{listing.price_per_ton}/ton</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-stone-500">Region</span>
                                        <span className="font-bold">{listing.region}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-stone-500">Available</span>
                                        <span className="font-bold">{listing.available_date}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleLockContract(listing.id)}
                                    disabled={processingId === listing.id}
                                    data-testid={`lock-contract-btn-${listing.id}`}
                                    className={`w-full py-3 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${processingId === listing.id
                                            ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                >
                                    {processingId === listing.id ? (
                                        <><span>⏳</span> Processing...</>
                                    ) : (
                                        <><span>🔒</span> Lock Contract</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
