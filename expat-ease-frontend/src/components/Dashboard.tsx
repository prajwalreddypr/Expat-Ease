import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import JoinCommunity from './JoinCommunity';
import ChecklistPage from '../pages/ChecklistPage';

// Placeholder components for other sections
const DocumentsSection: React.FC = () => (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <div className="text-6xl mb-6">📄</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Document Management</h1>
                <p className="text-xl text-gray-600">Manage your required documents and deadlines</p>
            </div>
        </div>
    </div>
);

const ServicesSection: React.FC = () => (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <div className="text-6xl mb-6">🏛️</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Local Services</h1>
                <p className="text-xl text-gray-600">Find local services and government offices</p>
            </div>
        </div>
    </div>
);

// Reusable Back to Dashboard component
const BackToDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
        <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.full_name || user?.email}!
                    </h1>
                    <p className="text-gray-600">
                        Here's your personalized dashboard to help you settle in {user?.country}.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="space-y-8">
                    {/* Feature Cards */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Access</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-lg">📋</span>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-blue-900 mb-2">Settlement Checklist</h3>
                                <p className="text-blue-700 text-sm mb-4">Track your progress with our step-by-step guide</p>
                                <button
                                    onClick={() => setShowChecklist(true)}
                                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
                                >
                                    View Checklist
                                </button>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-lg">📄</span>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-green-900 mb-2">Documents</h3>
                                <p className="text-green-700 text-sm mb-4">Manage required documents and deadlines</p>
                                <button
                                    onClick={() => setShowDocuments(true)}
                                    className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors duration-200"
                                >
                                    Manage Documents
                                </button>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-lg">🏛️</span>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-purple-900 mb-2">Services</h3>
                                <p className="text-purple-700 text-sm mb-4">Find local services and government offices</p>
                                <button
                                    onClick={() => setShowServices(true)}
                                    className="w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors duration-200"
                                >
                                    Explore Services
                                </button>
                            </div>

                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200 hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-lg">💬</span>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-orange-900 mb-2">Community</h3>
                                <p className="text-orange-700 text-sm mb-4">Connect with other expats in {user?.country}</p>
                                <button
                                    onClick={() => setShowCommunity(true)}
                                    className="w-full px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors duration-200"
                                >
                                    Join Community
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">Email</label>
                                <p className="text-gray-900 font-medium">{user?.email}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
                                <p className="text-gray-900 font-medium">{user?.full_name || 'Not provided'}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">Country</label>
                                <p className="text-gray-900 font-medium">{user?.country || 'Not specified'}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">Member Since</label>
                                <p className="text-gray-900 font-medium">
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB') : 'Unknown'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
                        <div className="flex flex-wrap gap-4">
                            <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm">
                                Update Profile
                            </button>
                            <button className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 border border-gray-300">
                                Export Data
                            </button>
                            <button className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200">
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
