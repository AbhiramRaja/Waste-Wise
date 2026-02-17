import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Scanner from './pages/Scanner'
import CityInsights from './pages/CityInsights'
import Learn from './pages/Learn'
import WasteDatabase from './pages/WasteDatabase'
import ConveyorSimulation from './pages/ConveyorSimulation'
import ChatBot from './components/ChatBot'
import SupplyForecast from './pages/SupplyForecast'
import RecyclerDashboard from './pages/RecyclerDashboard'
import ManufacturerDashboard from './pages/ManufacturerDashboard'

function NavBar() {
    const location = useLocation()

    const tabs = [
        { path: '/', label: 'Scan', icon: '🔍' },
        { path: '/insights', label: 'City Insights', icon: '📊' },
        { path: '/learn', label: 'Learn', icon: '📚' },
        { path: '/database', label: 'Database', icon: '🗄️' },
        { path: '/simulation', label: 'Simulation', icon: '🏭' },
        { path: '/supply-forecast', label: 'Forecast', icon: '📈' },
        { path: '/recycler', label: 'Sell Materials', icon: '♻️' },
        { path: '/manufacturer', label: 'Buy Materials', icon: '📦' }
    ]

    return (
        <nav className="glass sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="text-3xl">♻️</div>
                        <div>
                            <h1 className="text-xl font-semibold">
                                WasteWise India
                            </h1>
                            <p className="text-xs text-[rgb(var(--text-secondary))]">AI Waste Management</p>
                        </div>
                    </Link>

                    <div className="flex items-center space-x-2">
                        {tabs.map(tab => (
                            <Link key={tab.path} to={tab.path}>
                                <button
                                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${location.pathname === tab.path
                                        ? 'tab-active'
                                        : 'tab-inactive'
                                        }`}
                                >
                                    <span className="mr-1.5">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    )
}

function LiveTicker() {
    const [tickerData, setTickerData] = useState({
        city: 'Mumbai',
        scans: 1247,
        diverted: 342
    })

    useEffect(() => {
        const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata']
        const interval = setInterval(() => {
            setTickerData({
                city: cities[Math.floor(Math.random() * cities.length)],
                scans: Math.floor(Math.random() * 2000) + 500,
                diverted: Math.floor(Math.random() * 500) + 100
            })
        }, 8000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="fixed bottom-0 left-0 right-0 glass border-t border-[rgb(var(--border))] py-2 px-4 text-xs text-center text-[rgb(var(--text-secondary))]">
            🇮🇳 Live: <span className="font-medium">{tickerData.city}</span> • {tickerData.scans} scans today • {tickerData.diverted}kg compost diverted
        </div>
    )
}

function App() {
    return (
        <Router>
            <div className="min-h-screen pb-12">
                <NavBar />
                <Routes>
                    <Route path="/" element={<Scanner />} />
                    <Route path="/insights" element={<CityInsights />} />
                    <Route path="/learn" element={<Learn />} />
                    <Route path="/database" element={<WasteDatabase />} />
                    <Route path="/simulation" element={<ConveyorSimulation />} />
                    <Route path="/supply-forecast" element={<SupplyForecast />} />
                    <Route path="/recycler" element={<RecyclerDashboard />} />
                    <Route path="/manufacturer" element={<ManufacturerDashboard />} />
                </Routes>
                <LiveTicker />
                <ChatBot />
            </div>
        </Router>
    )
}

export default App
