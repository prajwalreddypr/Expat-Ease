import React, { useState } from 'react';

interface PrivacyPolicyProps {
    onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
    const [activeSection, setActiveSection] = useState('overview');

    const sections = [
        { id: 'overview', title: 'Overview', icon: '📋' },
        { id: 'data-collection', title: 'Data Collection', icon: '📊' },
        { id: 'data-usage', title: 'Data Usage', icon: '🔍' },
        { id: 'data-sharing', title: 'Data Sharing', icon: '🤝' },
        { id: 'data-security', title: 'Data Security', icon: '🔒' },
        { id: 'your-rights', title: 'Your Rights', icon: '⚖️' },
        { id: 'contact', title: 'Contact Us', icon: '📞' }
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900">Privacy Policy Overview</h3>
                        <p className="text-gray-700">
                            This Privacy Policy explains how Expat Ease ("we", "our", or "us") collects,
                            uses, and protects your personal information when you use our platform.
                        </p>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">Key Principles</h4>
                            <ul className="list-disc list-inside text-blue-800 space-y-1">
                                <li>We only collect data necessary for our services</li>
                                <li>Your data is protected with industry-standard security</li>
                                <li>You have full control over your personal information</li>
                                <li>We comply with GDPR and other privacy regulations</li>
                            </ul>
                        </div>
                        <p className="text-sm text-gray-600">
                            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                        </p>
                    </div>
                );

            case 'data-collection':
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900">Data We Collect</h3>
                        <div className="space-y-4">
                            <div className="border-l-4 border-blue-500 pl-4">
                                <h4 className="font-semibold text-gray-900">Account Information</h4>
                                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                                    <li>Email address (required for account creation)</li>
                                    <li>Full name (optional)</li>
                                    <li>Country selection (for personalized content)</li>
                                    <li>Password (encrypted and never stored in plain text)</li>
                                </ul>
                            </div>

                            <div className="border-l-4 border-green-500 pl-4">
                                <h4 className="font-semibold text-gray-900">Usage Data</h4>
                                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                                    <li>Forum posts and comments</li>
                                    <li>Document uploads (stored securely)</li>
                                    <li>Progress tracking on settlement tasks</li>
                                    <li>Service preferences and settings</li>
                                </ul>
                            </div>

                            <div className="border-l-4 border-yellow-500 pl-4">
                                <h4 className="font-semibold text-gray-900">Technical Data</h4>
                                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                                    <li>IP address (for security purposes)</li>
                                    <li>Browser type and version</li>
                                    <li>Device information</li>
                                    <li>Usage patterns and analytics</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );

            case 'data-usage':
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900">How We Use Your Data</h3>
                        <div className="grid gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-2">Service Provision</h4>
                                <p className="text-gray-700 text-sm">
                                    To provide personalized settlement guidance, forum access, and document management.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-2">Communication</h4>
                                <p className="text-gray-700 text-sm">
                                    To send important updates about your account and our services.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-2">Security</h4>
                                <p className="text-gray-700 text-sm">
                                    To protect against fraud, abuse, and unauthorized access.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-2">Improvement</h4>
                                <p className="text-gray-700 text-sm">
                                    To analyze usage patterns and improve our platform (anonymized data only).
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'data-sharing':
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900">Data Sharing</h3>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-red-900 mb-2">We Do NOT Sell Your Data</h4>
                            <p className="text-red-800 text-sm">
                                We never sell, rent, or trade your personal information to third parties.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900">Limited Sharing Only When:</h4>
                            <ul className="list-disc list-inside text-gray-700 space-y-2">
                                <li><strong>Legal Requirements:</strong> When required by law or court order</li>
                                <li><strong>Service Providers:</strong> Trusted partners who help us operate (under strict contracts)</li>
                                <li><strong>Safety:</strong> To protect users from harm or illegal activities</li>
                                <li><strong>Consent:</strong> When you explicitly give us permission</li>
                            </ul>
                        </div>
                    </div>
                );

            case 'data-security':
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900">Data Security</h3>
                        <div className="grid gap-4">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-green-900 mb-2">Encryption</h4>
                                <p className="text-green-800 text-sm">
                                    All data is encrypted in transit (HTTPS) and at rest using industry-standard encryption.
                                </p>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-green-900 mb-2">Access Controls</h4>
                                <p className="text-green-800 text-sm">
                                    Strict access controls ensure only authorized personnel can access your data.
                                </p>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-green-900 mb-2">Regular Audits</h4>
                                <p className="text-green-800 text-sm">
                                    We regularly audit our security practices and update them as needed.
                                </p>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-green-900 mb-2">Incident Response</h4>
                                <p className="text-green-800 text-sm">
                                    We have procedures in place to respond quickly to any security incidents.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'your-rights':
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900">Your Rights (GDPR)</h3>
                        <div className="space-y-3">
                            <div className="border-l-4 border-purple-500 pl-4">
                                <h4 className="font-semibold text-gray-900">Right to Access</h4>
                                <p className="text-gray-700 text-sm">Request a copy of all your personal data we hold.</p>
                            </div>

                            <div className="border-l-4 border-purple-500 pl-4">
                                <h4 className="font-semibold text-gray-900">Right to Rectification</h4>
                                <p className="text-gray-700 text-sm">Correct any inaccurate or incomplete data.</p>
                            </div>

                            <div className="border-l-4 border-purple-500 pl-4">
                                <h4 className="font-semibold text-gray-900">Right to Erasure</h4>
                                <p className="text-gray-700 text-sm">Request deletion of your personal data ("right to be forgotten").</p>
                            </div>

                            <div className="border-l-4 border-purple-500 pl-4">
                                <h4 className="font-semibold text-gray-900">Right to Portability</h4>
                                <p className="text-gray-700 text-sm">Export your data in a machine-readable format.</p>
                            </div>

                            <div className="border-l-4 border-purple-500 pl-4">
                                <h4 className="font-semibold text-gray-900">Right to Object</h4>
                                <p className="text-gray-700 text-sm">Object to processing of your data for certain purposes.</p>
                            </div>

                            <div className="border-l-4 border-purple-500 pl-4">
                                <h4 className="font-semibold text-gray-900">Right to Withdraw Consent</h4>
                                <p className="text-gray-700 text-sm">Withdraw consent for data processing at any time.</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">How to Exercise Your Rights</h4>
                            <p className="text-blue-800 text-sm">
                                Contact us at privacy@expatease.com or use the data management tools in your account settings.
                            </p>
                        </div>
                    </div>
                );

            case 'contact':
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900">Contact Us</h3>
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-2">Data Protection Officer</h4>
                                <p className="text-gray-700">Email: dpo@expatease.com</p>
                                <p className="text-gray-700">Response time: Within 72 hours</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-2">General Privacy Inquiries</h4>
                                <p className="text-gray-700">Email: privacy@expatease.com</p>
                                <p className="text-gray-700">Response time: Within 48 hours</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-2">Data Breach Reports</h4>
                                <p className="text-gray-700">Email: security@expatease.com</p>
                                <p className="text-gray-700">Response time: Within 24 hours</p>
                            </div>
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
                    <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex h-[calc(90vh-120px)]">
                    {/* Sidebar */}
                    <div className="w-64 bg-gray-50 p-4 overflow-y-auto">
                        <nav className="space-y-2">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${activeSection === section.id
                                            ? 'bg-blue-100 text-blue-900 font-semibold'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="mr-2">{section.icon}</span>
                                    {section.title}
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
                        This privacy policy is compliant with GDPR, CCPA, and other applicable privacy laws.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
