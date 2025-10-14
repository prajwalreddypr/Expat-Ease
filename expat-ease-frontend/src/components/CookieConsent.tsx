import React, { useState, useEffect } from 'react';

interface CookiePreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
}

interface CookieConsentProps {
    onAccept: (preferences: CookiePreferences) => void;
    onReject: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept, onReject }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>({
        necessary: true, // Always true, cannot be disabled
        analytics: false,
        marketing: false,
        functional: false
    });

    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const handleAcceptAll = () => {
        const allAccepted = {
            necessary: true,
            analytics: true,
            marketing: true,
            functional: true
        };
        setPreferences(allAccepted);
        onAccept(allAccepted);
        localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
        setShowBanner(false);
    };

    const handleRejectAll = () => {
        const onlyNecessary = {
            necessary: true,
            analytics: false,
            marketing: false,
            functional: false
        };
        setPreferences(onlyNecessary);
        onReject();
        localStorage.setItem('cookie-consent', JSON.stringify(onlyNecessary));
        setShowBanner(false);
    };

    const handleSavePreferences = () => {
        onAccept(preferences);
        localStorage.setItem('cookie-consent', JSON.stringify(preferences));
        setShowBanner(false);
    };

    const handlePreferenceChange = (category: keyof CookiePreferences) => {
        if (category === 'necessary') return; // Cannot change necessary cookies

        setPreferences(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {!showDetails ? (
                    // Simple banner
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                🍪 We use cookies to enhance your experience
                            </h3>
                            <p className="text-gray-600 text-sm">
                                We use cookies to provide essential functionality, analyze site usage,
                                and personalize content. By continuing to use our site, you consent to our use of cookies.
                            </p>
                            <button
                                onClick={() => setShowDetails(true)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                            >
                                Customize your preferences
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button
                                onClick={handleRejectAll}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                                Reject All
                            </button>
                            <button
                                onClick={handleAcceptAll}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                Accept All
                            </button>
                        </div>
                    </div>
                ) : (
                    // Detailed preferences
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Cookie Preferences
                            </h3>
                            <button
                                onClick={() => setShowDetails(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Necessary Cookies */}
                            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold text-gray-900">Necessary Cookies</h4>
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                            Always Active
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Essential for the website to function properly. These cannot be disabled.
                                    </p>
                                    <ul className="text-xs text-gray-500 mt-2 space-y-1">
                                        <li>• Authentication and session management</li>
                                        <li>• Security and fraud prevention</li>
                                        <li>• Basic website functionality</li>
                                    </ul>
                                </div>
                                <div className="ml-4">
                                    <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                                        <div className="w-4 h-4 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Analytics Cookies */}
                            <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            Optional
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Help us understand how visitors interact with our website.
                                    </p>
                                    <ul className="text-xs text-gray-500 mt-2 space-y-1">
                                        <li>• Page views and user behavior</li>
                                        <li>• Performance monitoring</li>
                                        <li>• Error tracking and debugging</li>
                                    </ul>
                                </div>
                                <div className="ml-4">
                                    <button
                                        onClick={() => handlePreferenceChange('analytics')}
                                        className={`w-12 h-6 rounded-full flex items-center transition-colors ${preferences.analytics ? 'bg-blue-500 justify-end' : 'bg-gray-300 justify-start'
                                            }`}
                                    >
                                        <div className="w-4 h-4 bg-white rounded-full mx-1"></div>
                                    </button>
                                </div>
                            </div>

                            {/* Functional Cookies */}
                            <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold text-gray-900">Functional Cookies</h4>
                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                            Optional
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Enable enhanced functionality and personalization.
                                    </p>
                                    <ul className="text-xs text-gray-500 mt-2 space-y-1">
                                        <li>• User preferences and settings</li>
                                        <li>• Language and region selection</li>
                                        <li>• Customized content delivery</li>
                                    </ul>
                                </div>
                                <div className="ml-4">
                                    <button
                                        onClick={() => handlePreferenceChange('functional')}
                                        className={`w-12 h-6 rounded-full flex items-center transition-colors ${preferences.functional ? 'bg-purple-500 justify-end' : 'bg-gray-300 justify-start'
                                            }`}
                                    >
                                        <div className="w-4 h-4 bg-white rounded-full mx-1"></div>
                                    </button>
                                </div>
                            </div>

                            {/* Marketing Cookies */}
                            <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold text-gray-900">Marketing Cookies</h4>
                                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                            Optional
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Used to deliver relevant advertisements and measure campaign effectiveness.
                                    </p>
                                    <ul className="text-xs text-gray-500 mt-2 space-y-1">
                                        <li>• Ad targeting and personalization</li>
                                        <li>• Campaign performance tracking</li>
                                        <li>• Social media integration</li>
                                    </ul>
                                </div>
                                <div className="ml-4">
                                    <button
                                        onClick={() => handlePreferenceChange('marketing')}
                                        className={`w-12 h-6 rounded-full flex items-center transition-colors ${preferences.marketing ? 'bg-orange-500 justify-end' : 'bg-gray-300 justify-start'
                                            }`}
                                    >
                                        <div className="w-4 h-4 bg-white rounded-full mx-1"></div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={handleRejectAll}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                                Reject All
                            </button>
                            <button
                                onClick={handleSavePreferences}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                Save Preferences
                            </button>
                            <button
                                onClick={handleAcceptAll}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                                Accept All
                            </button>
                        </div>

                        <div className="text-xs text-gray-500 text-center">
                            You can change your cookie preferences at any time in your account settings.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CookieConsent;
