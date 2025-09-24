import React from 'react';

interface Community {
    name: string;
    description: string;
    image: string;
    link: string;
    category: string;
}

const communities: Community[] = [
    {
        name: "Restos du Cœur",
        description: "Free food distribution and support services for those in need.",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center",
        link: "https://www.restosducoeur.org/",
        category: "Food Support"
    },
    {
        name: "AMAP Ile-de-France",
        description: "Local farmers' co-ops providing fresh, organic groceries.",
        image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop&crop=center",
        link: "https://amap-idf.org/",
        category: "Food Co-op"
    },
    {
        name: "Secours Populaire",
        description: "Social solidarity organization offering emergency aid and support.",
        image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop&crop=center",
        link: "https://www.secourspopulaire.fr/",
        category: "Social Support"
    },
    {
        name: "Croix-Rouge Française",
        description: "Reduced rates for hotel food and emergency assistance services.",
        image: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?w=400&h=300&fit=crop&crop=center",
        link: "https://www.croix-rouge.fr/",
        category: "Food Support"
    },
    {
        name: "Cop1.fr",
        description: "Groceries distribution and community support services.",
        image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=300&fit=crop&crop=center",
        link: "https://cop1.fr/",
        category: "Food Support"
    }
];

const JoinCommunity: React.FC = () => {
    const handleVisitWebsite = (link: string) => {
        window.open(link, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Join the Community
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Connect with local organizations and initiatives that support expats in France.
                        Discover resources for food, housing, energy, and community support.
                    </p>
                </div>

                {/* Community Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {communities.map((community, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary-300 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            {/* Community Image */}
                            <div className="h-48 relative overflow-hidden">
                                <img
                                    src={community.image}
                                    alt={community.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback to emoji if image fails to load
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const fallback = target.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.style.display = 'flex';
                                    }}
                                />
                                {/* Fallback emoji display */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-primary-600/10"></div>
                                    <div className="text-6xl opacity-20">
                                        {community.category === 'Food Support' && '🍽️'}
                                        {community.category === 'Food Co-op' && '🥬'}
                                        {community.category === 'Social Support' && '🤝'}
                                        {community.category === 'Humanitarian' && '❤️'}
                                        {community.category === 'Digital Services' && '💻'}
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                                        {community.category}
                                    </span>
                                </div>
                                {/* Overlay for better text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    {community.name}
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {community.description}
                                </p>

                                {/* Visit Website Button */}
                                <button
                                    onClick={() => handleVisitWebsite(community.link)}
                                    className="w-full bg-primary-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                                >
                                    <span>Visit Website</span>
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Resources Section */}
                <div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Need More Resources?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-gray-50 rounded-lg">
                            <div className="text-3xl mb-3">📞</div>
                            <h3 className="font-semibold text-gray-900 mb-2">Emergency Numbers</h3>
                            <p className="text-gray-600 text-sm">
                                Police: 17, Medical: 15, Fire: 18
                            </p>
                        </div>
                        <div className="text-center p-6 bg-gray-50 rounded-lg">
                            <div className="text-3xl mb-3">🏛️</div>
                            <h3 className="font-semibold text-gray-900 mb-2">Government Services</h3>
                            <p className="text-gray-600 text-sm">
                                Visit service-public.fr for official information
                            </p>
                        </div>
                        <div className="text-center p-6 bg-gray-50 rounded-lg">
                            <div className="text-3xl mb-3">🌐</div>
                            <h3 className="font-semibold text-gray-900 mb-2">Expats Communities</h3>
                            <p className="text-gray-600 text-sm">
                                Find local expat groups and events
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinCommunity;
