import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../utils/api';

interface DataManagementProps {
    onClose: () => void;
}

interface DataExport {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
    download_url?: string;
}

const DataManagement: React.FC<DataManagementProps> = ({ onClose }) => {
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [dataExports, setDataExports] = useState<DataExport[]>([]);

    const tabs = [
        { id: 'overview', title: 'Overview', icon: '📊' },
        { id: 'export', title: 'Export Data', icon: '📤' },
        { id: 'delete', title: 'Delete Account', icon: '🗑️' },
        { id: 'preferences', title: 'Privacy Preferences', icon: '⚙️' }
    ];

    const handleDataExport = async () => {
        if (!token) return;

        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch(getApiUrl('/api/v1/users/data-export'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDataExports(prev => [data, ...prev]);
                setMessage({ type: 'success', text: 'Data export request submitted successfully!' });
            } else {
                throw new Error('Failed to request data export');
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to request data export. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccountDeletion = async () => {
        if (!token || !window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch(getApiUrl('/api/v1/users/delete-account'), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Account deletion request submitted. You will be logged out shortly.' });
                // Redirect to login after a delay
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            } else {
                throw new Error('Failed to delete account');
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete account. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-900">Your Data Overview</h3>

                        <div className="grid gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-blue-900 mb-2">Account Information</h4>
                                <div className="text-sm text-blue-800 space-y-1">
                                    <p><strong>Email:</strong> {user?.email}</p>
                                    <p><strong>Name:</strong> {user?.full_name || 'Not provided'}</p>
                                    <p><strong>Country:</strong> {user?.country || 'Not selected'}</p>
                                    <p><strong>Member since:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</p>
                                </div>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-green-900 mb-2">Data Categories</h4>
                                <div className="text-sm text-green-800 space-y-1">
                                    <p>• Profile information and preferences</p>
                                    <p>• Forum posts and comments</p>
                                    <p>• Uploaded documents</p>
                                    <p>• Settlement progress tracking</p>
                                    <p>• Usage analytics (anonymized)</p>
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-yellow-900 mb-2">Your Rights</h4>
                                <div className="text-sm text-yellow-800 space-y-1">
                                    <p>• Access your personal data</p>
                                    <p>• Correct inaccurate information</p>
                                    <p>• Export your data</p>
                                    <p>• Delete your account</p>
                                    <p>• Withdraw consent</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'export':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-900">Export Your Data</h3>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">What's included in your data export:</h4>
                            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                                <li>Account information and profile data</li>
                                <li>All forum posts and comments</li>
                                <li>Uploaded documents (metadata only)</li>
                                <li>Settlement progress and task completion</li>
                                <li>Privacy preferences and consent history</li>
                                <li>Account activity logs (last 12 months)</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleDataExport}
                                disabled={isLoading}
                                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Requesting Export...' : 'Request Data Export'}
                            </button>

                            {dataExports.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">Recent Export Requests:</h4>
                                    {dataExports.map((dataExport) => (
                                        <div key={dataExport.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    Export #{dataExport.id.slice(-8)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(dataExport.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${dataExport.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    dataExport.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                                        dataExport.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {dataExport.status}
                                                </span>
                                                {dataExport.download_url && (
                                                    <a
                                                        href={dataExport.download_url}
                                                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                    >
                                                        Download
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'delete':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-900">Delete Your Account</h3>

                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-red-900 mb-2">⚠️ Warning: This action cannot be undone</h4>
                            <p className="text-sm text-red-800">
                                Deleting your account will permanently remove all your data, including:
                            </p>
                            <ul className="text-sm text-red-800 mt-2 space-y-1 list-disc list-inside">
                                <li>Your profile and account information</li>
                                <li>All forum posts and comments</li>
                                <li>Uploaded documents</li>
                                <li>Progress tracking data</li>
                                <li>All preferences and settings</li>
                            </ul>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">Before you delete your account:</h4>
                            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                                <li>Consider exporting your data first</li>
                                <li>Download any important documents</li>
                                <li>Save any forum posts you want to keep</li>
                                <li>Note that this action is irreversible</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleAccountDeletion}
                                disabled={isLoading}
                                className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Deleting Account...' : 'Delete My Account'}
                            </button>
                        </div>
                    </div>
                );

            case 'preferences':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-900">Privacy Preferences</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <h4 className="font-semibold text-gray-900">Email Notifications</h4>
                                    <p className="text-sm text-gray-600">Receive updates about your account and our services</p>
                                </div>
                                <button className="w-12 h-6 bg-blue-500 rounded-full flex items-center justify-end px-1">
                                    <div className="w-4 h-4 bg-white rounded-full"></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <h4 className="font-semibold text-gray-900">Analytics Tracking</h4>
                                    <p className="text-sm text-gray-600">Help us improve our services (anonymized data only)</p>
                                </div>
                                <button className="w-12 h-6 bg-blue-500 rounded-full flex items-center justify-end px-1">
                                    <div className="w-4 h-4 bg-white rounded-full"></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <h4 className="font-semibold text-gray-900">Marketing Communications</h4>
                                    <p className="text-sm text-gray-600">Receive promotional content and updates</p>
                                </div>
                                <button className="w-12 h-6 bg-gray-300 rounded-full flex items-center justify-start px-1">
                                    <div className="w-4 h-4 bg-white rounded-full"></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <h4 className="font-semibold text-gray-900">Data Processing Consent</h4>
                                    <p className="text-sm text-gray-600">Consent to process your data for service provision</p>
                                </div>
                                <button className="w-12 h-6 bg-blue-500 rounded-full flex items-center justify-end px-1">
                                    <div className="w-4 h-4 bg-white rounded-full"></div>
                                </button>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">Your Rights</h4>
                            <p className="text-sm text-blue-800">
                                You can withdraw your consent for data processing at any time.
                                Some data processing may be necessary for the service to function properly.
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Data Management</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mx-6 mt-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="flex h-[calc(90vh-120px)]">
                    {/* Sidebar */}
                    <div className="w-64 bg-gray-50 p-4 overflow-y-auto">
                        <nav className="space-y-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-blue-100 text-blue-900 font-semibold'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.title}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {renderContent()}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                    <p className="text-sm text-gray-600">
                        Your data is protected and you have full control over it.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataManagement;
