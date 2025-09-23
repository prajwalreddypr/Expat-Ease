import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Welcome back, {user?.full_name || user?.email}!
                </h2>
                <p className="text-gray-600 mb-4">

                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                        <h3 className="font-semibold text-primary-800 mb-2">📋 Settlement Checklist</h3>
                        <p className="text-primary-600 text-sm mb-3">Track your progress with our step-by-step guide</p>
                        <button className="btn btn-primary text-sm">View Checklist</button>
                    </div>

                    <div className="bg-secondary-50 p-4 rounded-lg border border-secondary-200">
                        <h3 className="font-semibold text-secondary-800 mb-2">📄 Documents</h3>
                        <p className="text-secondary-600 text-sm mb-3">Manage required documents and deadlines</p>
                        <button className="btn btn-secondary text-sm">Manage Documents</button>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-2">🏛️ Services</h3>
                        <p className="text-green-600 text-sm mb-3">Find local services and government offices</p>
                        <button className="btn btn-outline text-sm">Explore Services</button>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-800 mb-2">💬 Community</h3>
                        <p className="text-blue-600 text-sm mb-3">Connect with other expats in Paris</p>
                        <button className="btn btn-outline text-sm">Join Community</button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <p className="text-gray-900">{user?.full_name || 'Not provided'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <p className="text-gray-900">{user?.country || 'Not specified'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Member Since</label>
                        <p className="text-gray-900">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                        Update Profile
                    </button>
                    <button className="px-4 py-2 bg-secondary-200 text-secondary-900 rounded-lg hover:bg-secondary-300 transition-colors duration-200">
                        Export Data
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
