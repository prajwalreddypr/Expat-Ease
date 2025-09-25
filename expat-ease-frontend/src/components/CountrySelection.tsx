import React from 'react';

interface CountrySelectionProps {
    onCountrySelect: (country: string) => void;
}

const CountrySelection: React.FC<CountrySelectionProps> = ({ onCountrySelect }) => {
    return (
        <div className="min-h-screen flex items-start justify-center px-4 pt-16 pb-8">
            <div className="w-full max-w-md">
                {/* Main content card */}
                <div className="card bg-white/90 backdrop-blur-sm border border-white/30 shadow-xl p-6 rounded-2xl">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-gradient mb-3 leading-tight py-2">Choose Your Destination</h1>
                        <p className="text-base text-slate-600 mb-2">Welcome to your expat journey!</p>
                        <p className="text-sm text-slate-500">Select the country you're moving to</p>
                    </div>

                    {/* Country Options */}
                    <div className="space-y-4">
                        {/* France Option */}
                        <button
                            onClick={() => onCountrySelect('France')}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-300 group card-hover"
                        >
                            <div className="flex items-center space-x-3">
                                {/* France Flag Icon */}
                                <div className="w-12 h-9 bg-gradient-to-r from-blue-600 via-white to-red-600 rounded-lg flex items-center justify-center shadow-lg border border-slate-200">
                                    <div className="flex">
                                        <div className="w-4 h-6 bg-blue-600 rounded-l-sm"></div>
                                        <div className="w-4 h-6 bg-white"></div>
                                        <div className="w-4 h-6 bg-red-600 rounded-r-sm"></div>
                                    </div>
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 mb-1">
                                        France
                                    </h3>
                                    <p className="text-sm text-slate-600">
                                        Settle in Paris and other French cities
                                    </p>
                                </div>
                                <div className="text-slate-400 group-hover:text-emerald-500 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </button>

                        {/* Germany Option */}
                        <button
                            onClick={() => onCountrySelect('Germany')}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl hover:border-yellow-500 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-300 group card-hover"
                        >
                            <div className="flex items-center space-x-3">
                                {/* Germany Flag Icon */}
                                <div className="w-12 h-9 bg-gradient-to-b from-black via-red-600 to-yellow-400 rounded-lg flex items-center justify-center shadow-lg border border-slate-200">
                                    <div className="flex flex-col w-full h-full">
                                        <div className="w-full h-3 bg-black rounded-t-lg"></div>
                                        <div className="w-full h-3 bg-red-600"></div>
                                        <div className="w-full h-3 bg-yellow-400 rounded-b-lg"></div>
                                    </div>
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-yellow-700 mb-1">
                                        Germany
                                    </h3>
                                    <p className="text-sm text-slate-600">
                                        Settle in Berlin and other German cities
                                    </p>
                                </div>
                                <div className="text-slate-400 group-hover:text-yellow-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Info */}
                    <div className="mt-6 text-center">
                        <div className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-violet-50 to-purple-50 rounded-full border border-violet-100">
                            <svg className="w-4 h-4 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-violet-700 font-medium">
                                More countries coming soon!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CountrySelection;
