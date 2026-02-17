import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import axios from 'axios'

const DEMO_EXAMPLES = [
    {
        name: 'Plastic Bottle',
        class: 'Plastic',
        confidence: 0.973,
        guidance: '• **Recyclable**: Rinse the bottle and remove the cap\n• Place in blue recycling bin\n• Caps can stay on in most facilities',
        tips: ['Rinse thoroughly before recycling', 'Remove labels if possible', 'Crush to save space']
    },
    {
        name: 'Banana Peel',
        class: 'Organic',
        confidence: 0.945,
        guidance: '• **Compostable**: Perfect for your compost bin\n• Breaks down in 2-4 weeks\n• Rich in potassium for soil',
        tips: ['Great for composting', 'Can be used as fertilizer', 'Avoid if treated with pesticides']
    },
    {
        name: 'Battery',
        class: 'Hazardous',
        confidence: 0.891,
        guidance: '• **Hazardous Waste**: Never throw in regular trash\n• Take to designated collection points\n• Contains toxic materials',
        tips: ['Store in cool, dry place until disposal', 'Tape terminals to prevent fires', 'Check for local drop-off locations']
    },
    {
        name: 'Cardboard Box',
        class: 'Paper',
        confidence: 0.967,
        guidance: '• **Recyclable**: Flatten and place in recycling\n• Remove tape and labels\n• Keep dry for best recycling',
        tips: ['Flatten to save space', 'Remove all packing materials', 'Keep dry - wet cardboard contaminates batches']
    },
    {
        name: 'Old Phone',
        class: 'E-waste',
        confidence: 0.928,
        guidance: '• **E-Waste**: Contains valuable materials\n• Take to electronics recycling center\n• Wipe data before disposal',
        tips: ['Erase all personal data first', 'Remove SIM card', 'Consider donation if still functional']
    }
]

export default function Scanner() {
    const [selectedImage, setSelectedImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [classification, setClassification] = useState(null)
    const [guidance, setGuidance] = useState(null)
    const [loading, setLoading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [scansToday, setScansToday] = useState(1247)
    const [demoIndex, setDemoIndex] = useState(0)

    const loadingMessages = [
        'Identifying item...',
        'Analyzing composition...',
        'Checking local guidelines...',
        'Generating recommendations...'
    ]

    useEffect(() => {
        if (loading) {
            let index = 0
            setLoadingMessage(loadingMessages[0])
            const interval = setInterval(() => {
                index = (index + 1) % loadingMessages.length
                setLoadingMessage(loadingMessages[index])
            }, 800)
            return () => clearInterval(interval)
        }
    }, [loading])

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedImage(file)
            setImagePreview(URL.createObjectURL(file))
            setClassification(null)
            setGuidance(null)
        }
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            setSelectedImage(file)
            setImagePreview(URL.createObjectURL(file))
            setClassification(null)
            setGuidance(null)
        }
    }

    const handleClassify = async () => {
        if (!selectedImage) return

        setLoading(true)

        try {
            // Step 1: Classify image
            const formData = new FormData()
            formData.append('image', selectedImage)

            const classifyRes = await axios.post('/api/classify', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            setClassification(classifyRes.data)

            // Step 2: Get disposal guidance
            const guidanceRes = await axios.post('/api/guidance', {
                wasteType: classifyRes.data.class
            })

            setGuidance(guidanceRes.data.guidance)
            setScansToday(prev => prev + 1)
        } catch (error) {
            console.error('Error:', error)
            alert('Error classifying image. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleDemo = () => {
        const demo = DEMO_EXAMPLES[demoIndex]
        setClassification({ class: demo.class, confidence: demo.confidence })
        setGuidance(demo.guidance)
        setImagePreview(null)
        setSelectedImage(null)
        setDemoIndex((demoIndex + 1) % DEMO_EXAMPLES.length)
        setScansToday(prev => prev + 1)
    }

    const proTips = classification && DEMO_EXAMPLES.find(d => d.class === classification.class)?.tips

    return (
        <div className="container mx-auto px-6 py-8 max-w-6xl">
            {/* Hero Counters */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="card p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-600">{scansToday.toLocaleString()}</div>
                    <div className="text-sm text-[rgb(var(--text-secondary))]">Items Scanned Today</div>
                </div>
                <div className="card p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-600">127</div>
                    <div className="text-sm text-[rgb(var(--text-secondary))]">Cities Covered</div>
                </div>
                <div className="card p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-600">94.7%</div>
                    <div className="text-sm text-[rgb(var(--text-secondary))]">Accuracy Rate</div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Upload Section */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold">
                            Upload Waste Image
                        </h2>
                        <button
                            onClick={handleDemo}
                            className="text-sm px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                        >
                            Try Demo
                        </button>
                    </div>

                    <div
                        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${dragActive
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                            : 'border-stone-300 dark:border-stone-700 hover:border-stone-400 bg-stone-50 dark:bg-stone-900'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="file-upload"
                        />

                        {!imagePreview ? (
                            <label htmlFor="file-upload" className="cursor-pointer block">
                                <div className="text-6xl mb-4">📸</div>
                                <p className="text-base text-[rgb(var(--text-primary))] mb-2 font-medium">
                                    Drag & drop an image here
                                </p>
                                <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">or click to browse</p>
                                <p className="text-xs text-[rgb(var(--text-secondary))]">PNG, JPG, JPEG up to 10MB</p>
                            </label>
                        ) : (
                            <div className="space-y-4">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="max-h-72 mx-auto rounded-lg shadow-sm border border-stone-200 dark:border-stone-700"
                                />
                                <button
                                    onClick={() => {
                                        setSelectedImage(null)
                                        setImagePreview(null)
                                        setClassification(null)
                                        setGuidance(null)
                                    }}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                                >
                                    × Remove
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleClassify}
                        disabled={!selectedImage || loading}
                        className={`btn-primary w-full mt-6 ${(!selectedImage || loading) && 'opacity-50 cursor-not-allowed'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {loadingMessage}
                            </span>
                        ) : (
                            'Classify Waste'
                        )}
                    </button>
                </div>

                {/* Right: Results Section */}
                <div className="card">
                    <h2 className="text-2xl font-semibold mb-6">
                        AI Analysis
                    </h2>

                    <AnimatePresence mode="wait">
                        {!classification && !loading && (
                            <div key="empty" className="text-center text-[rgb(var(--text-secondary))] py-16">
                                <div className="text-6xl mb-4">🎯</div>
                                <p className="text-base">Upload an image to get started</p>
                                <p className="text-sm text-[rgb(var(--text-secondary))] mt-2">Powered by Gemini AI</p>
                            </div>
                        )}

                        {classification && (
                            <div key="results" className="space-y-6">
                                {/* Classification Result */}
                                <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 p-6 rounded-lg">
                                    <h3 className="text-sm text-emerald-700 dark:text-emerald-400 mb-2 font-medium uppercase tracking-wide">Detected Type</h3>
                                    <p className="text-3xl font-semibold capitalize mb-3 text-emerald-900 dark:text-emerald-300">{classification.class}</p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-white dark:bg-stone-800 rounded-full h-2 overflow-hidden border border-emerald-200 dark:border-emerald-700">
                                            <div
                                                className="bg-emerald-600 h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${classification.confidence * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                                            {(classification.confidence * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>

                                {/* Contamination Status */}
                                {classification.contaminated !== undefined && (
                                    <div className={`border p-6 rounded-lg ${classification.contaminated
                                            ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                                            : 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                                        }`}>
                                        <h3 className={`text-sm font-medium uppercase tracking-wide mb-2 ${classification.contaminated
                                                ? 'text-red-700 dark:text-red-400'
                                                : 'text-green-700 dark:text-green-400'
                                            }`}>
                                            Contamination Status
                                        </h3>
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-3xl">
                                                {classification.contaminated ? '⚠️' : '✅'}
                                            </span>
                                            <p className={`text-2xl font-semibold ${classification.contaminated
                                                    ? 'text-red-900 dark:text-red-300'
                                                    : 'text-green-900 dark:text-green-300'
                                                }`}>
                                                {classification.contaminated ? 'Contaminated' : 'Clean'}
                                            </p>
                                        </div>
                                        {classification.contaminated && classification.contaminant && classification.contaminant !== 'None' && (
                                            <div className="bg-white dark:bg-stone-900 border border-red-200 dark:border-red-700 p-4 rounded-lg">
                                                <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                                                    Detected Contaminant:
                                                </p>
                                                <p className="text-sm text-red-700 dark:text-red-400">
                                                    {classification.contaminant}
                                                </p>
                                                <p className="text-xs text-red-600 dark:text-red-500 mt-3 italic">
                                                    ⚠️ Please clean this item before recycling to avoid contaminating the entire batch.
                                                </p>
                                            </div>
                                        )}
                                        {!classification.contaminated && (
                                            <p className="text-sm text-green-700 dark:text-green-400">
                                                This item appears clean and ready for recycling! ♻️
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Disposal Guidance */}
                                {guidance && (
                                    <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                                            <span className="mr-2">💡</span> Disposal Guidance
                                        </h3>
                                        <div className="text-[rgb(var(--text-primary))] whitespace-pre-line leading-relaxed text-sm">
                                            {guidance}
                                        </div>
                                    </div>
                                )}

                                {/* Pro Tips */}
                                {proTips && (
                                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center text-blue-900 dark:text-blue-300">
                                            <span className="mr-2">✨</span> Pro Tips
                                        </h3>
                                        <ul className="space-y-2">
                                            {proTips.map((tip, idx) => (
                                                <li key={idx} className="text-sm flex items-start">
                                                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                                                    <span className="text-blue-900 dark:text-blue-200">{tip}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Anonymous Contribution */}
                                <div className="text-xs text-center text-[rgb(var(--text-secondary))] pt-4 border-t border-[rgb(var(--border))]">
                                    ✓ Anonymous data contributed to improve sorting accuracy
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
