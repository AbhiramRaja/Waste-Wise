import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hi! 👋 I\'m WasteBot, your AI assistant for waste management. Ask me anything about recycling, disposal, or waste reduction!'
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const sendMessage = async () => {
        if (!input.trim() || loading) return

        const userMessage = { role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const res = await axios.post('/api/chat', {
                message: input,
                history: messages
            })

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: res.data.response
            }])
        } catch (error) {
            console.error('Chat error:', error)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ Sorry, I encountered an error. Please try again!'
            }])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <>
            {/* Floating chat button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full shadow-2xl hover:shadow-emerald-500/50 hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center text-3xl"
                    aria-label="Open chat"
                >
                    💬
                </button>
            )}

            {/* Chat window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[550px] bg-white dark:bg-stone-900 rounded-2xl shadow-2xl z-50 flex flex-col border border-stone-200 dark:border-stone-700 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                                🤖
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">WasteBot</h3>
                                <p className="text-xs text-emerald-100">AI Waste Assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 hover:bg-white/20 rounded-full transition-colors flex items-center justify-center"
                            aria-label="Close chat"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 dark:bg-stone-950">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${msg.role === 'user'
                                        ? 'bg-emerald-600 text-white rounded-br-sm'
                                        : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-bl-sm border border-stone-200 dark:border-stone-700'
                                    }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-stone-800 p-3 rounded-2xl rounded-bl-sm shadow-sm border border-stone-200 dark:border-stone-700">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about waste management..."
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 border border-stone-300 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 disabled:opacity-50"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={loading || !input.trim()}
                                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                            >
                                Send
                            </button>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 text-center">
                            Powered by Gemini AI
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}
