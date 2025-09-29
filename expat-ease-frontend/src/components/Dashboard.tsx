import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Chatbot from './Chatbot';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    return (
        <div className="min-h-screen pt-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                {/* Welcome Section */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-gradient mb-3 leading-tight py-2">
                        Welcome back, {user?.full_name || user?.email}!
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Here's your personalized dashboard to help you settle in {user?.settlement_country}.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="space-y-8">
                    {/* Feature Cards */}
                    <div className="card">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Quick Access</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {/* Settlement Checklist */}
                            <div className="card-hover bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6 rounded-2xl border border-emerald-100 flex flex-col h-full">
                                <div className="text-center mb-3 sm:mb-4">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                                        <span className="text-white text-lg sm:text-xl">📋</span>
                                    </div>
                                </div>
                                <div className="text-center mb-3 sm:mb-4 flex-grow">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">Settlement Checklist</h3>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Track your progress with our step-by-step guide</p>
                                </div>
                                <button
                                    onClick={() => handleNavigation('/checklist')}
                                    className="btn bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl w-full text-xs sm:text-sm py-2"
                                >
                                    View Checklist
                                </button>
                            </div>

                            {/* Documents */}
                            <div className="card-hover bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 p-4 sm:p-6 rounded-2xl border border-teal-100 flex flex-col h-full">
                                <div className="text-center mb-3 sm:mb-4">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                                        <span className="text-white text-lg sm:text-xl">📄</span>
                                    </div>
                                </div>
                                <div className="text-center mb-3 sm:mb-4 flex-grow">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">Documents</h3>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Manage required documents and deadlines</p>
                                </div>
                                <button
                                    onClick={() => handleNavigation('/documents')}
                                    className="btn w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg hover:shadow-xl text-xs sm:text-sm py-2"
                                >
                                    Manage Documents
                                </button>
                            </div>

                            {/* Services */}
                            <div className="card-hover bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 rounded-2xl border border-blue-100 flex flex-col h-full">
                                <div className="text-center mb-3 sm:mb-4">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                                        <span className="text-white text-lg sm:text-xl">🔧</span>
                                    </div>
                                </div>
                                <div className="text-center mb-3 sm:mb-4 flex-grow">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">Services</h3>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Essential services for your new life</p>
                                </div>
                                <button
                                    onClick={() => handleNavigation('/services')}
                                    className="btn w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl text-xs sm:text-sm py-2"
                                >
                                    View Services
                                </button>
                            </div>

                            {/* Community */}
                            <div className="card-hover bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4 sm:p-6 rounded-2xl border border-purple-100 flex flex-col h-full">
                                <div className="text-center mb-3 sm:mb-4">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                                        <span className="text-white text-lg sm:text-xl">👥</span>
                                    </div>
                                </div>
                                <div className="text-center mb-3 sm:mb-4 flex-grow">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">Community</h3>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Connect with fellow expats</p>
                                </div>
                                <button
                                    onClick={() => handleNavigation('/community')}
                                    className="btn w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg hover:shadow-xl text-xs sm:text-sm py-2"
                                >
                                    Join Community
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chatbot */}
            <Chatbot />
        </div>
    );
};

export default Dashboard;