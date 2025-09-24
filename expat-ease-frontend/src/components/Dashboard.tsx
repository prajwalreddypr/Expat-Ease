import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import JoinCommunity from './JoinCommunity';
import ChecklistPage from '../pages/ChecklistPage';

// Placeholder components for other sections
const DocumentsSection: React.FC = () => (
    <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <div className="card bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-12 rounded-3xl border border-emerald-100">
                    <div className="text-8xl mb-8">📄</div>
                    <h1 className="text-4xl font-bold text-gradient mb-6">Document Management</h1>
                    <p className="text-xl text-slate-600 leading-relaxed">Manage your required documents and deadlines</p>
                </div>
            </div>
        </div>
    </div>
);

const ServicesSection: React.FC = () => (
    <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <div className="card bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-12 rounded-3xl border border-violet-100">
                    <div className="text-8xl mb-8">🏛️</div>
                    <h1 className="text-4xl font-bold text-gradient mb-6">Local Services</h1>
                    <p className="text-xl text-slate-600 leading-relaxed">Find local services and government offices</p>
                </div>
            </div>
        </div>
    </div>
);

// Reusable Back to Dashboard component
const BackToDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="glass border-b border-white/20 backdrop-blur-md px-4 py-4">
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
);

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showChecklist, setShowChecklist] = React.useState(false);
    const [showCommunity, setShowCommunity] = React.useState(false);
    const [showDocuments, setShowDocuments] = React.useState(false);
    const [showServices, setShowServices] = React.useState(false);

    // Reset all states when going back to dashboard
    const resetAllStates = () => {
        setShowChecklist(false);
        setShowCommunity(false);
        setShowDocuments(false);
        setShowServices(false);
    };

    // Listen for logo click events to reset dashboard states
    React.useEffect(() => {
        const handleLogoClick = () => {
            resetAllStates();
        };

        // Listen for custom event from Layout component
        window.addEventListener('dashboard-reset', handleLogoClick);

        return () => {
            window.removeEventListener('dashboard-reset', handleLogoClick);
        };
    }, []);

    // Ensure dashboard starts from top when component mounts
    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

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
                <JoinCommunity />
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
                <ServicesSection />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="mb-16 text-center">
                    <h1 className="text-5xl font-bold text-gradient mb-4">
                        Welcome back, {user?.full_name || user?.email}!
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Here's your personalized dashboard to help you settle in {user?.country}.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="space-y-12">
                    {/* Feature Cards */}
                    <div className="card">
                        <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Quick Access</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="card-hover bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-2xl border border-blue-100">
                                <div className="flex items-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <span className="text-white text-2xl">📋</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">Settlement Checklist</h3>
                                <p className="text-slate-600 mb-6 leading-relaxed">Track your progress with our step-by-step guide</p>
                                <button
                                    onClick={() => setShowChecklist(true)}
                                    className="btn btn-primary w-full"
                                >
                                    View Checklist
                                </button>
                            </div>

                            <div className="card-hover bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8 rounded-2xl border border-emerald-100">
                                <div className="flex items-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <span className="text-white text-2xl">📄</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">Documents</h3>
                                <p className="text-slate-600 mb-6 leading-relaxed">Manage required documents and deadlines</p>
                                <button
                                    onClick={() => setShowDocuments(true)}
                                    className="btn w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl"
                                >
                                    Manage Documents
                                </button>
                            </div>

                            <div className="card-hover bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-8 rounded-2xl border border-violet-100">
                                <div className="flex items-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <span className="text-white text-2xl">🏛️</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">Services</h3>
                                <p className="text-slate-600 mb-6 leading-relaxed">Find local services and government offices</p>
                                <button
                                    onClick={() => setShowServices(true)}
                                    className="btn w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg hover:shadow-xl"
                                >
                                    Explore Services
                                </button>
                            </div>

                            <div className="card-hover bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 p-8 rounded-2xl border border-rose-100">
                                <div className="flex items-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <span className="text-white text-2xl">💬</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">Community</h3>
                                <p className="text-slate-600 mb-6 leading-relaxed">Connect with other expats in {user?.country}</p>
                                <button
                                    onClick={() => setShowCommunity(true)}
                                    className="btn w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg hover:shadow-xl"
                                >
                                    Join Community
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="card">
                        <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center">Your Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                                <label className="block text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">Email</label>
                                <p className="text-slate-800 font-semibold">{user?.email}</p>
                            </div>
                            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                                <label className="block text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-3">Full Name</label>
                                <p className="text-slate-800 font-semibold">{user?.full_name || 'Not provided'}</p>
                            </div>
                            <div className="text-center p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100">
                                <label className="block text-sm font-semibold text-violet-600 uppercase tracking-wide mb-3">Country</label>
                                <p className="text-slate-800 font-semibold">{user?.country || 'Not specified'}</p>
                            </div>
                            <div className="text-center p-6 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-100">
                                <label className="block text-sm font-semibold text-rose-600 uppercase tracking-wide mb-3">Member Since</label>
                                <p className="text-slate-800 font-semibold">
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB') : 'Unknown'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="card">
                        <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center">Quick Actions</h3>
                        <div className="flex flex-wrap justify-center gap-6">
                            <button className="btn btn-primary">
                                Update Profile
                            </button>
                            <button className="btn btn-secondary">
                                Export Data
                            </button>
                            <button className="btn btn-outline">
                                Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
