import React from 'react';

interface CountrySelectionProps {
    onCountrySelect: (country: string) => void;
}

const CountrySelection: React.FC<CountrySelectionProps> = ({ onCountrySelect }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-4" style={{ paddingTop: '80px' }}>
            <div className="w-full max-w-md">
                {/* Main content card */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-10">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold text-primary-600 mb-3">Expat Ease</h1>
                        <p className="text-gray-600 mb-2">Welcome to your expat journey!</p>
                        <p className="text-gray-500 text-sm">Choose the country you're moving to</p>
                    </div>

                    {/* Country Options */}
                    <div className="space-y-4">
                        {/* France Option */}
                        <button
                            onClick={() => onCountrySelect('France')}
                            className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="text-4xl">🇫🇷</div>
                                <div className="text-left">
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700">
                                        France
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Settle in Paris and other French cities
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Germany Option */}
                        <button
                            onClick={() => onCountrySelect('Germany')}
                            className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="text-4xl">🇩🇪</div>
                                <div className="text-left">
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700">
                                        Germany
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Settle in Berlin and other German cities
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Info */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-500">
                            More countries coming soon!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CountrySelection;
