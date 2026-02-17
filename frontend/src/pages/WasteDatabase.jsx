import { useState } from 'react'

const WASTE_ITEMS = [
    // Recyclable
    { name: 'Plastic Water Bottle', emoji: '🍶', category: 'Recyclable', disposal: 'Recycling' },
    { name: 'Aluminum Can', emoji: '🥫', category: 'Recyclable', disposal: 'Recycling' },
    { name: 'Cardboard Box', emoji: '📦', category: 'Recyclable', disposal: 'Recycling' },
    { name: 'Glass Jar', emoji: '🫙', category: 'Recyclable', disposal: 'Recycling' },
    { name: 'Newspaper', emoji: '📰', category: 'Recyclable', disposal: 'Recycling' },
    { name: 'Magazine', emoji: '📖', category: 'Recyclable', disposal: 'Recycling' },
    { name: 'Paper Bag', emoji: '🛍️', category: 'Recyclable', disposal: 'Recycling' },
    { name: 'Milk Carton', emoji: '🥛', category: 'Recyclable', disposal: 'Recycling' },

    // Compostable
    { name: 'Apple Core', emoji: '🍎', category: 'Compostable', disposal: 'Compost' },
    { name: 'Banana Peel', emoji: '🍌', category: 'Compostable', disposal: 'Compost' },
    { name: 'Coffee Grounds', emoji: '☕', category: 'Compostable', disposal: 'Compost' },
    { name: 'Eggshells', emoji: '🥚', category: 'Compostable', disposal: 'Compost' },
    { name: 'Vegetable Scraps', emoji: '🥕', category: 'Compostable', disposal: 'Compost' },
    { name: 'Tea Bags', emoji: '🍵', category: 'Compostable', disposal: 'Compost' },
    { name: 'Yard Waste', emoji: '🌿', category: 'Compostable', disposal: 'Compost' },
    { name: 'Flowers', emoji: '🌸', category: 'Compostable', disposal: 'Compost' },

    // Landfill
    { name: 'Chip Bag', emoji: '🍟', category: 'Landfill', disposal: 'Trash' },
    { name: 'Styrofoam', emoji: '📦', category: 'Landfill', disposal: 'Trash' },
    { name: 'Plastic Wrap', emoji: '🎁', category: 'Landfill', disposal: 'Trash' },
    { name: 'Straw', emoji: '🥤', category: 'Landfill', disposal: 'Trash' },
    { name: 'Tissue', emoji: '🧻', category: 'Landfill', disposal: 'Trash' },
    { name: 'Napkin', emoji: '🍽️', category: 'Landfill', disposal: 'Trash' },
    { name: 'Broken Ceramic', emoji: '🍽️', category: 'Landfill', disposal: 'Trash' },
    { name: 'Rubber Gloves', emoji: '🧤', category: 'Landfill', disposal: 'Trash' },

    // Hazardous
    { name: 'Battery', emoji: '🔋', category: 'Hazardous', disposal: 'Hazardous' },
    { name: 'Paint Can', emoji: '🎨', category: 'Hazardous', disposal: 'Hazardous' },
    { name: 'Motor Oil', emoji: '🛢️', category: 'Hazardous', disposal: 'Hazardous' },
    { name: 'Cleaning Products', emoji: '🧴', category: 'Hazardous', disposal: 'Hazardous' },
    { name: 'Pesticides', emoji: '🪲', category: 'Hazardous', disposal: 'Hazardous' },
    { name: 'Light Bulbs (CFL)', emoji: '💡', category: 'Hazardous', disposal: 'Hazardous' },
    { name: 'Thermometer', emoji: '🌡️', category: 'Hazardous', disposal: 'Hazardous' },
    { name: 'Aerosol Cans', emoji: '🥫', category: 'Hazardous', disposal: 'Hazardous' },

    // E-Waste
    { name: 'Old Phone', emoji: '📱', category: 'E-Waste', disposal: 'E-Waste' },
    { name: 'Laptop', emoji: '💻', category: 'E-Waste', disposal: 'E-Waste' },
    { name: 'Charger', emoji: '🔌', category: 'E-Waste', disposal: 'E-Waste' },
    { name: 'Headphones', emoji: '🎧', category: 'E-Waste', disposal: 'E-Waste' },
    { name: 'Keyboard', emoji: '⌨️', category: 'E-Waste', disposal: 'E-Waste' },
    { name: 'Mouse', emoji: '🖱️', category: 'E-Waste', disposal: 'E-Waste' },
    { name: 'Cables', emoji: '🔌', category: 'E-Waste', disposal: 'E-Waste' },
    { name: 'Old TV', emoji: '📺', category: 'E-Waste', disposal: 'E-Waste' },

    // Special
    { name: 'Old Clothes', emoji: '👕', category: 'Special', disposal: 'Donate/Special' },
    { name: 'Shoes', emoji: '👟', category: 'Special', disposal: 'Donate/Special' },
    { name: 'Furniture', emoji: '🪑', category: 'Special', disposal: 'Special Pickup' },
    { name: 'Mattress', emoji: '🛏️', category: 'Special', disposal: 'Special Pickup' },
    { name: 'Appliances', emoji: '🔌', category: 'Special', disposal: 'Special Pickup' },
    { name: 'Tires', emoji: '🛞', category: 'Special', disposal: 'Special Pickup' },
    { name: 'Books', emoji: '📚', category: 'Special', disposal: 'Donate/Special' },
    { name: 'Toys', emoji: '🧸', category: 'Special', disposal: 'Donate/Special' }
]

const CATEGORIES = ['All', 'Recyclable', 'Compostable', 'Landfill', 'Hazardous', 'E-Waste', 'Special']

const DISPOSAL_COLORS = {
    'Recycling': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    'Compost': 'bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300',
    'Trash': 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
    'Hazardous': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    'E-Waste': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    'Donate/Special': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    'Special Pickup': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
}

export default function WasteDatabase() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')

    const filteredItems = WASTE_ITEMS.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="container mx-auto px-6 py-8 max-w-7xl">
            <h1 className="text-3xl font-bold mb-8">Waste Database</h1>

            {/* Search Bar */}
            <div className="card mb-6">
                <input
                    type="text"
                    placeholder="Search waste items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-[rgb(var(--border))] bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2 mb-8">
                {CATEGORIES.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${selectedCategory === category
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Results Count */}
            <div className="text-sm text-[rgb(var(--text-secondary))] mb-4">
                Showing {filteredItems.length} of {WASTE_ITEMS.length} items
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map((item, idx) => (
                    <div key={idx} className="card p-4 hover:scale-105 transition-transform">
                        <div className="text-4xl mb-3 text-center">{item.emoji}</div>
                        <h3 className="font-semibold text-center mb-2">{item.name}</h3>
                        <div className="text-xs text-center text-[rgb(var(--text-secondary))] mb-2">
                            {item.category}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded text-center font-medium ${DISPOSAL_COLORS[item.disposal]}`}>
                            {item.disposal}
                        </div>
                    </div>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-12 text-[rgb(var(--text-secondary))]">
                    <div className="text-6xl mb-4">🔍</div>
                    <p>No items found matching your search.</p>
                </div>
            )}
        </div>
    )
}
