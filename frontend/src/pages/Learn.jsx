import { useState } from 'react'

const CATEGORIES = [
    {
        name: 'Recyclable',
        emoji: '♻️',
        color: 'from-emerald-500 to-green-600',
        description: 'Clean paper, cardboard, plastic bottles, metal cans',
        examples: ['Plastic Bottles', 'Aluminum Cans', 'Cardboard', 'Glass Bottles']
    },
    {
        name: 'Compostable',
        emoji: '🌱',
        color: 'from-lime-500 to-green-500',
        description: 'Food scraps, yard waste, organic materials',
        examples: ['Vegetable Peels', 'Fruit Waste', 'Tea Leaves', 'Coconut Shells']
    },
    {
        name: 'Hazardous',
        emoji: '⚠️',
        color: 'from-red-500 to-orange-600',
        description: 'Batteries, chemicals, paint, medical waste',
        examples: ['Batteries', 'Paint Cans', 'Medicines', 'Tube Lights']
    },
    {
        name: 'E-Waste',
        emoji: '🔌',
        color: 'from-amber-500 to-orange-500',
        description: 'Electronics, phones, computers, cables',
        examples: ['Old Phones', 'Laptops', 'Chargers', 'LED Bulbs']
    },
    {
        name: 'General Waste',
        emoji: '🗑️',
        color: 'from-stone-500 to-gray-600',
        description: 'Non-recyclable items, contaminated materials',
        examples: ['Chip Packets', 'Thermocol', 'Broken Ceramics', 'Used Tissues']
    },
    {
        name: 'Special Programs',
        emoji: '🎯',
        color: 'from-purple-500 to-indigo-600',
        description: 'Textiles, furniture, bulk items requiring special handling',
        examples: ['Old Clothes', 'Furniture', 'Mattresses', 'Tyres']
    }
]

const QUIZ_QUESTIONS = [
    {
        question: 'Where should coconut shells go after Pongal/Onam celebrations?',
        context: 'You have leftover coconut shells from festival preparations.',
        options: [
            { label: 'A', text: 'Recycling bin', correct: false },
            { label: 'B', text: 'Compost bin', correct: true },
            { label: 'C', text: 'Trash bin', correct: false },
            { label: 'D', text: 'Burn them', correct: false }
        ],
        explanation: 'Coconut shells are organic waste and perfect for composting! They break down slowly but add valuable nutrients. Never burn them as it creates air pollution.'
    },
    {
        question: 'What should you do with used agarbatti (incense stick) packets?',
        context: 'You just finished your daily pooja and have empty agarbatti packets.',
        options: [
            { label: 'A', text: 'Throw in general waste', correct: true },
            { label: 'B', text: 'Recycle with paper', correct: false },
            { label: 'C', text: 'Compost them', correct: false },
            { label: 'D', text: 'Reuse for storage', correct: false }
        ],
        explanation: 'Agarbatti packets are usually made of mixed materials (foil + paper) and contaminated with ash, making them non-recyclable. They go in general waste.'
    },
    {
        question: 'Expired medicines from your home medicine cabinet should go to:',
        context: 'You found old tablets and syrups while cleaning.',
        options: [
            { label: 'A', text: 'Flush down the toilet', correct: false },
            { label: 'B', text: 'Regular dustbin', correct: false },
            { label: 'C', text: 'Pharmacy take-back program', correct: true },
            { label: 'D', text: 'Mix with food waste', correct: false }
        ],
        explanation: 'Many pharmacies in India now have medicine take-back programs. Never flush medicines - they contaminate water bodies. Check with local chemists for disposal options.'
    },
    {
        question: 'Used tea leaves (chai patti) should be disposed in:',
        context: 'You just made chai and have wet tea leaves left.',
        options: [
            { label: 'A', text: 'Sink drain', correct: false },
            { label: 'B', text: 'Compost bin', correct: true },
            { label: 'C', text: 'Trash bin', correct: false },
            { label: 'D', text: 'Recycling bin', correct: false }
        ],
        explanation: 'Tea leaves are excellent for composting! They\'re nitrogen-rich and help plants grow. You can also use them directly in garden soil. Never put them down the drain.'
    },
    {
        question: 'Broken earthen diyas (clay lamps) after Diwali should go in:',
        context: 'You have broken clay diyas after Diwali celebrations.',
        options: [
            { label: 'A', text: 'Compost - they\'re natural clay', correct: false },
            { label: 'B', text: 'Recycling bin', correct: false },
            { label: 'C', text: 'General waste', correct: true },
            { label: 'D', text: 'E-waste', correct: false }
        ],
        explanation: 'While clay is natural, broken ceramics and pottery go in general waste. They don\'t decompose quickly enough for composting and can\'t be recycled with regular materials.'
    },
    {
        question: 'Plastic ghee/oil containers should be recycled only if:',
        context: 'You finished a 1kg ghee container and want to dispose it.',
        options: [
            { label: 'A', text: 'They have the recycling symbol', correct: false },
            { label: 'B', text: 'They are washed clean and dry', correct: true },
            { label: 'C', text: 'They are a certain brand', correct: false },
            { label: 'D', text: 'Any plastic can be recycled', correct: false }
        ],
        explanation: 'Oil/ghee containers MUST be washed thoroughly before recycling. Greasy containers contaminate entire recycling batches. Use hot water and soap to clean them properly.'
    },
    {
        question: 'Old mobile phone chargers and cables are classified as:',
        context: 'You have multiple old phone chargers lying around.',
        options: [
            { label: 'A', text: 'General waste', correct: false },
            { label: 'B', text: 'Recyclable plastic', correct: false },
            { label: 'C', text: 'E-waste', correct: true },
            { label: 'D', text: 'Hazardous waste', correct: false }
        ],
        explanation: 'Chargers and cables are e-waste! They contain valuable metals and should go to e-waste collection centers. Many mobile shops and municipal corporations have e-waste bins.'
    },
    {
        question: 'Banana leaves used for serving food should be:',
        context: 'You used banana leaves for a traditional meal.',
        options: [
            { label: 'A', text: 'Composted', correct: true },
            { label: 'B', text: 'Thrown in general waste', correct: false },
            { label: 'C', text: 'Recycled', correct: false },
            { label: 'D', text: 'Fed to cows', correct: false }
        ],
        explanation: 'Banana leaves are 100% compostable! They decompose quickly and are perfect for composting. This is why they\'re an eco-friendly alternative to plastic plates.'
    }
]

export default function Learn() {
    const [quizStarted, setQuizStarted] = useState(false)
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [showExplanation, setShowExplanation] = useState(false)
    const [score, setScore] = useState(0)
    const [quizQuestions, setQuizQuestions] = useState([])

    const startQuiz = () => {
        // Randomly select 6 questions from the pool of 8
        const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5)
        setQuizQuestions(shuffled.slice(0, 6))
        setQuizStarted(true)
        setCurrentQuestion(0)
        setScore(0)
        setSelectedAnswer(null)
        setShowExplanation(false)
    }

    const currentQuizQuestion = quizQuestions[currentQuestion]
    const isQuizComplete = currentQuestion >= quizQuestions.length

    const handleAnswerSelect = (optionIndex) => {
        if (showExplanation) return

        setSelectedAnswer(optionIndex)
        setShowExplanation(true)

        if (currentQuizQuestion.options[optionIndex].correct) {
            setScore(prev => prev + 1)
        }
    }

    const handleNext = () => {
        if (currentQuestion < quizQuestions.length - 1) {
            setCurrentQuestion(prev => prev + 1)
            setSelectedAnswer(null)
            setShowExplanation(false)
        } else {
            // Move to completion screen
            setCurrentQuestion(quizQuestions.length)
        }
    }

    const handleRestart = () => {
        setCurrentQuestion(0)
        setSelectedAnswer(null)
        setShowExplanation(false)
        setScore(0)
        setQuizQuestions([])
        setQuizStarted(false)
    }

    return (
        <div className="container mx-auto px-6 py-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8">Learn About Waste</h1>

            {/* Category Cards */}
            {!quizStarted && (
                <div className="mb-12">
                    <h2 className="text-xl font-semibold mb-4">Waste Categories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {CATEGORIES.map((category, idx) => (
                            <div key={idx} className="card hover:scale-105 transition-transform">
                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl mb-4`}>
                                    {category.emoji}
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                                <p className="text-sm text-[rgb(var(--text-secondary))] mb-3">{category.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {category.examples.map((example, i) => (
                                        <span key={i} className="text-xs px-2 py-1 bg-stone-800 rounded">
                                            {example}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quiz Section */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Interactive Quiz</h2>
                    {quizStarted && !isQuizComplete && (
                        <div className="text-sm font-medium">
                            Score: <span className="text-emerald-400">{score}</span> / {currentQuestion}
                        </div>
                    )}
                </div>

                {!quizStarted ? (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">🎯</div>
                        <p className="text-[rgb(var(--text-secondary))] mb-6">
                            Test your waste sorting knowledge with culturally relevant questions!
                        </p>
                        <button onClick={startQuiz} className="btn-primary">
                            Start Quiz
                        </button>
                    </div>
                ) : isQuizComplete ? (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">
                            {score === 6 ? '🏆' : score >= 4 ? '🎉' : '📚'}
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
                        <p className="text-xl mb-4">
                            You scored <span className="text-emerald-400 font-bold">{score}</span> out of 6
                        </p>
                        <p className="text-[rgb(var(--text-secondary))] mb-6">
                            {score === 6
                                ? 'Perfect score! You\'re a waste sorting expert! 🌟'
                                : score >= 4
                                    ? 'Great job! You know your waste management!'
                                    : 'Keep learning! Every bit of knowledge helps the planet.'}
                        </p>
                        <button onClick={handleRestart} className="btn-primary">
                            Restart Quiz
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span>Question {currentQuestion + 1} of 6</span>
                                <span>{Math.round(((currentQuestion + 1) / 6) * 100)}%</span>
                            </div>
                            <div className="w-full bg-stone-700 rounded-full h-2">
                                <div
                                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${((currentQuestion + 1) / 6) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Question */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">
                                {currentQuizQuestion.question}
                            </h3>
                            <p className="text-sm text-[rgb(var(--text-secondary))] italic">
                                {currentQuizQuestion.context}
                            </p>
                        </div>

                        {/* Options */}
                        <div className="space-y-3 mb-6">
                            {currentQuizQuestion.options.map((option, idx) => {
                                const isSelected = selectedAnswer === idx
                                const isCorrect = option.correct
                                const showResult = showExplanation

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswerSelect(idx)}
                                        disabled={showExplanation}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${!showResult
                                            ? 'border-stone-700 hover:border-emerald-500 hover:bg-emerald-950'
                                            : isSelected && isCorrect
                                                ? 'border-emerald-500 bg-emerald-950'
                                                : isSelected && !isCorrect
                                                    ? 'border-red-500 bg-red-950'
                                                    : isCorrect
                                                        ? 'border-emerald-500 bg-emerald-950'
                                                        : 'border-stone-700 opacity-50'
                                            }`}
                                    >
                                        <span className="font-semibold mr-2">{option.label}.</span>
                                        {option.text}
                                        {showResult && isCorrect && <span className="ml-2">✓</span>}
                                        {showResult && isSelected && !isCorrect && <span className="ml-2">✗</span>}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Explanation */}
                        {showExplanation && (
                            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mb-6">
                                <div className="font-semibold mb-2 text-blue-300">💡 Explanation:</div>
                                <p className="text-sm text-blue-200">{currentQuizQuestion.explanation}</p>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between">
                            <button onClick={handleRestart} className="btn-secondary">
                                Restart Quiz
                            </button>
                            {showExplanation && (
                                <button onClick={handleNext} className="btn-primary">
                                    {currentQuestion < 5 ? 'Next Question' : 'Finish Quiz'}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
