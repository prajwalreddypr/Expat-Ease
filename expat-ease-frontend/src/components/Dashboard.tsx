import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import JoinCommunity from './JoinCommunity';
import ChecklistPage from '../pages/ChecklistPage';
import DocumentsSection from './DocumentsSection';
import Services from './Services';
import Profile from './Profile';
import Chatbot from './Chatbot';

// Reusable Back to Dashboard component
const BackToDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="glass border-b border-white/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
                onClick={onBack}
                className="flex items-center text-slate-600 hover:text-slate-900 transition-all duration-200 hover:scale-105 font-semibold"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
            </button>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [showChecklist, setShowChecklist] = React.useState(false);
    const [showCommunity, setShowCommunity] = React.useState(false);
    const [showDocuments, setShowDocuments] = React.useState(false);
    const [showServices, setShowServices] = React.useState(false);
    const [showProfile, setShowProfile] = React.useState(false);

    // Reset all states when going back to dashboard
    const resetAllStates = () => {
        setShowChecklist(false);
        setShowCommunity(false);
        setShowDocuments(false);
        setShowServices(false);
        setShowProfile(false);
    };

    // Listen for logo click events to reset dashboard states
    React.useEffect(() => {
        const handleLogoClick = () => {
            resetAllStates();
        };

        // Listen for custom events from Layout component
        window.addEventListener('dashboard-reset', handleLogoClick);

        return () => {
            window.removeEventListener('dashboard-reset', handleLogoClick);
        };
    }, []);

    // Ensure dashboard starts from top when component mounts
    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Scroll to top when switching to community view
    React.useEffect(() => {
        if (showCommunity) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [showCommunity]);

    if (showChecklist) {
        return (
            <div>
                <BackToDashboard onBack={resetAllStates} />
                <ChecklistPage />
            </div>
        );
    }

    if (showCommunity) {
        return (
            <div>
                <BackToDashboard onBack={resetAllStates} />
                <div className="pt-2">
                    <JoinCommunity />
                </div>
            </div>
        );
    }

    if (showDocuments) {
        return (
            <div>
                <BackToDashboard onBack={resetAllStates} />
                <DocumentsSection />
            </div>
        );
    }

    if (showServices) {
        return (
            <div>
                <BackToDashboard onBack={resetAllStates} />
                <Services />
            </div>
        );
    }

    if (showProfile) {
        return (
            <div>
                <BackToDashboard onBack={resetAllStates} />
                <Profile />
            </div>
        );
    }

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
                                    onClick={() => setShowChecklist(true)}
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
                                    onClick={() => setShowDocuments(true)}
                                    className="btn w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg hover:shadow-xl text-xs sm:text-sm py-2"
                                >
                                    Manage Documents
                                </button>
                            </div>

                            {/* Services */}
                            <div className="card-hover bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 p-4 sm:p-6 rounded-2xl border border-cyan-100 flex flex-col h-full">
                                <div className="text-center mb-3 sm:mb-4">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                                        <span className="text-white text-lg sm:text-xl">🏛️</span>
                                    </div>
                                </div>
                                <div className="text-center mb-3 sm:mb-4 flex-grow">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">Services</h3>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Find local services and government offices</p>
                                </div>
                                <button
                                    onClick={() => setShowServices(true)}
                                    className="btn w-full bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-lg hover:shadow-xl text-xs sm:text-sm py-2"
                                >
                                    Explore Services
                                </button>
                            </div>

                            {/* Community */}
                            <div className="card-hover bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 p-4 sm:p-6 rounded-2xl border border-emerald-100 flex flex-col h-full">
                                <div className="text-center mb-3 sm:mb-4">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                                        <span className="text-white text-lg sm:text-xl">💬</span>
                                    </div>
                                </div>
                                <div className="text-center mb-3 sm:mb-4 flex-grow">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">Community</h3>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Connect with other expats in {user?.country}</p>
                                </div>
                                <button
                                    onClick={() => setShowCommunity(true)}
                                    className="btn w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl text-xs sm:text-sm py-2"
                                >
                                    Join Community
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* AI Chatbot - Floating Widget */}
            <Chatbot />
        </div>
    );
};

export default Dashboard;
