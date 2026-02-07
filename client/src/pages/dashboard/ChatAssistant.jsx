import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ChatAssistant = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hi ${user?.name || 'there'}! I'm your AI Campus Assistant. How can I help you regarding your academics or career today?`,
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat`, {
                message: input,
            }, config);

            const aiMessage = { role: 'assistant', content: data.reply };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = {
                role: 'assistant',
                content: error.response?.data?.message || 'Sorry, I encountered an error. Please check your connection or API key.',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
            {/* Header */}
            <div className="p-4 bg-indigo-600 dark:bg-indigo-900 text-white flex items-center gap-3 shadow-md z-10">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Sparkles className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="font-bold text-lg">AI Assistant</h2>
                    <p className="text-indigo-200 dark:text-indigo-300 text-xs flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Online
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-gray-900/50 scroll-smooth">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''
                            }`}
                    >
                        <div
                            className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user'
                                ? 'bg-indigo-600 dark:bg-indigo-500'
                                : 'bg-emerald-500 dark:bg-emerald-600'
                                }`}
                        >
                            {msg.role === 'user' ? (
                                <User className="h-5 w-5 text-white" />
                            ) : (
                                <Bot className="h-5 w-5 text-white" />
                            )}
                        </div>
                        <div
                            className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-start gap-3 animate-pulse">
                        <div className="h-9 w-9 rounded-full bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSend} className="flex gap-3">
                    <input
                        type="text"
                        className="flex-1 bg-gray-100 dark:bg-gray-700/50 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl px-5 py-3 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white text-sm"
                        placeholder="Ask about your schedule, assignments, or campus info..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatAssistant;
