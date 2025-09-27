import React, { useState, useRef, useEffect } from 'react';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

// Rule-based responses for expat assistance
const getExpatResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('document') || input.includes('paperwork') || input.includes('visa')) {
        return "For documents, you'll typically need: passport, visa, work permit, residence permit, health insurance, bank statements, and proof of accommodation. Check your settlement country's embassy website for specific requirements.";
    }

    if (input.includes('settlement') || input.includes('settle') || input.includes('move')) {
        return "Settlement involves several steps: 1) Get proper visas/permits, 2) Find accommodation, 3) Open a bank account, 4) Get health insurance, 5) Register with local authorities, 6) Find work or start business. Use our checklist feature to track your progress!";
    }

    if (input.includes('bank') || input.includes('account') || input.includes('money')) {
        return "To open a bank account, you'll need: passport, visa/residence permit, proof of address, employment contract or business registration, and sometimes a reference from your home bank. Some banks offer expat-friendly accounts.";
    }

    if (input.includes('health') || input.includes('insurance') || input.includes('medical')) {
        return "Health insurance is usually mandatory. Options include: public health insurance (if eligible), private insurance, or international health plans. Check if your home country has reciprocal agreements with your settlement country.";
    }

    if (input.includes('work') || input.includes('job') || input.includes('employment')) {
        return "For work, you'll need: work permit, residence permit, tax number, and sometimes professional qualifications recognition. Check if your profession requires local licensing or certification.";
    }

    if (input.includes('housing') || input.includes('accommodation') || input.includes('rent') || input.includes('apartment')) {
        return "For housing: research neighborhoods, check rental requirements (deposits, references), consider temporary accommodation first, and be aware of local rental laws. Some countries have tenant protection laws.";
    }

    if (input.includes('language') || input.includes('learn') || input.includes('speak')) {
        return "Learning the local language is crucial! Look for: language courses, language exchange programs, online resources, local community centers, and practice with native speakers. Many countries offer free integration courses.";
    }

    if (input.includes('community') || input.includes('friends') || input.includes('social')) {
        return "Building a social network: join expat groups, attend local events, use social media groups, participate in hobbies/activities, volunteer, and don't hesitate to reach out to colleagues or neighbors.";
    }

    if (input.includes('tax') || input.includes('taxes') || input.includes('financial')) {
        return "Tax obligations vary by country. You may need to: register for tax purposes, understand tax treaties between countries, keep detailed financial records, and consider hiring a tax advisor familiar with expat situations.";
    }

    if (input.includes('emergency') || input.includes('help') || input.includes('urgent')) {
        return "For emergencies: know local emergency numbers (112 in EU, 911 in US), keep embassy contact info handy, have important documents backed up, and know where your nearest hospital and police station are located.";
    }

    // Default responses
    const defaultResponses = [
        "I'd be happy to help with that! Could you be more specific about what you need assistance with?",
        "That's a great question! I can help with settlement procedures, documents, housing, work permits, health insurance, and more. What specific area interests you?",
        "I'm here to help with your expat journey! Try asking about documents, settlement steps, local services, or any other concerns you have.",
        "Feel free to ask me about any aspect of settling in your new country - I'm here to provide guidance and support!"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi! I'm your AI assistant. I can help you with settlement questions, document requirements, local services, and general expat advice. What would you like to know?",
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const sendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage: Message = {
            id: generateId(),
            text: inputText.trim(),
            isUser: true,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            // Add a small delay to simulate AI thinking
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

            // Use fallback response system
            const botResponse = getExpatResponse(inputText.trim());

            const botMessage: Message = {
                id: generateId(),
                text: botResponse,
                isUser: false,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error generating response:', error);

            // Simple fallback response
            const errorMessage: Message = {
                id: generateId(),
                text: "I'm here to help with your expat journey! I can assist with settlement procedures, documents, housing, work permits, health insurance, and more. What specific area would you like to know about?",
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={toggleChat}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                    }`}
                aria-label="Open AI Assistant"
            >
                <svg
                    className="w-6 h-6 transition-transform duration-200 group-hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-6 right-6 z-50 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-slate-200 transition-all duration-300 transform ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-4'
                }`}>
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">AI Assistant</h3>
                            <p className="text-xs text-emerald-100">Always here to help</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleChat}
                        className="w-6 h-6 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Close chat"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 h-64">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${message.isUser
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                                    : 'bg-slate-100 text-slate-800'
                                    }`}
                            >
                                {message.text}
                            </div>
                        </div>
                    ))}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-100 text-slate-800 px-3 py-2 rounded-2xl text-sm flex items-center space-x-2">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                </div>
                                <span>Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-200">
                    <div className="flex space-x-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me anything about settling in..."
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!inputText.trim() || isLoading}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                            title="Send message"
                            aria-label="Send message"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Chatbot;
