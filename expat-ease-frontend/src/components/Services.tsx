import React, { useState, useEffect } from 'react';

interface Bank {
    name: string;
    logo: string;
    link: string;
}

interface ServiceItem {
    name: string;
    description: string;
    link: string;
    icon: string;
    logo?: string;
    isBankSection?: boolean;
    banks?: Bank[];
}

interface ServiceCategory {
    title: string;
    items: ServiceItem[];
}

const Services: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const serviceCategories: ServiceCategory[] = [
        {
            title: "Government Services & Offices",
            items: [
                {
                    name: "Préfecture / Sous-Préfecture",
                    description: "For residence permits, visa validation, and other administrative processes",
                    link: "https://www.service-public.fr",
                    icon: "🏛️"
                },
                {
                    name: "CAF (Caisse d'Allocations Familiales)",
                    description: "For housing benefits, family allowances, and social help",
                    link: "https://www.caf.fr",
                    icon: "🏠"
                },
                {
                    name: "CPAM (Caisse Primaire d'Assurance Maladie)",
                    description: "For health insurance registration (Carte Vitale)",
                    link: "https://www.ameli.fr",
                    icon: "🏥"
                },
                {
                    name: "Pôle Emploi",
                    description: "For job seekers, training, and unemployment benefits",
                    link: "https://www.pole-emploi.fr",
                    icon: "💼"
                },
                {
                    name: "URSSAF",
                    description: "For freelancers or self-employed registration",
                    link: "https://www.urssaf.fr",
                    icon: "📊"
                }
            ]
        },
        {
            title: "Local / Essential Services",
            items: [
                {
                    name: "Public Transport Authority (RATP)",
                    description: "For transport cards (Navigo pass) and public transportation",
                    link: "https://www.ratp.fr",
                    icon: "🚇"
                },
                {
                    name: "Waste Management / Recycling Centers",
                    description: "Local mairie or municipal waste services",
                    link: "https://www.ademe.fr/particuliers-eco-citoyens/dechets",
                    icon: "♻️"
                },
                {
                    name: "City Hall (Mairie)",
                    description: "For official documents like birth certificates, marriage certificates, etc.",
                    link: "https://www.service-public.fr/particuliers/vosdroits/F1574",
                    icon: "🏛️"
                },
                {
                    name: "Electricity, Gas & Water Suppliers",
                    description: "EDF for electricity, Engie for gas, local water companies",
                    link: "https://www.service-public.fr/particuliers/vosdroits/F1407",
                    icon: "⚡"
                },
                {
                    name: "Banks",
                    description: "Major French banks with expat-friendly services",
                    link: "",
                    icon: "🏦",
                    isBankSection: true,
                    banks: [
                        {
                            name: "BNP Paribas",
                            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/BNP_Paribas.svg/1200px-BNP_Paribas.svg.png",
                            link: "https://mabanque.bnpparibas/"
                        },
                        {
                            name: "Société Générale",
                            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Soci%C3%A9t%C3%A9_G%C3%A9n%C3%A9rale_logo.svg/1200px-Soci%C3%A9t%C3%A9_G%C3%A9n%C3%A9rale_logo.svg.png",
                            link: "https://www.societegenerale.fr/"
                        },
                        {
                            name: "La Banque Postale",
                            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Logo_La_Banque_Postale.svg/1200px-Logo_La_Banque_Postale.svg.png",
                            link: "https://www.labanquepostale.fr/"
                        }
                    ]
                }
            ]
        }
    ];

    const toggleCategory = (categoryTitle: string) => {
        setActiveCategory(activeCategory === categoryTitle ? null : categoryTitle);
    };

    const handleServiceClick = (link: string) => {
        if (link) {
            window.open(link, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="min-h-screen py-4">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md mb-3">
                        <span className="text-white text-xl">🏛️</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 via-emerald-800 to-teal-800 bg-clip-text text-transparent mb-2">
                        Local Services & Resources
                    </h1>
                    <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Essential services and government offices to help you navigate life in France
                    </p>
                </div>

                {/* Services Categories */}
                <div className="space-y-4">
                    {serviceCategories.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                            {/* Category Header */}
                            <button
                                onClick={() => toggleCategory(category.title)}
                                className="w-full px-5 py-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 hover:from-emerald-100 hover:via-teal-100 hover:to-cyan-100 transition-all duration-300 flex items-center justify-between group"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                                        <span className="text-white text-base font-bold">
                                            {category.title.includes("Government") ? "🏛️" : "🏢"}
                                        </span>
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors mb-0.5">
                                            {category.title}
                                        </h2>
                                        <p className="text-slate-500 text-xs">
                                            {category.items.length} services available
                                        </p>
                                    </div>
                                </div>

                                {/* Dropdown Arrow */}
                                <div className={`transform transition-transform duration-300 ${activeCategory === category.title ? 'rotate-180' : ''}`}>
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                                        <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </button>

                            {/* Services List */}
                            {activeCategory === category.title && (
                                <div className="border-t border-slate-100 bg-slate-50/30">
                                    <div className="p-4">
                                        <div className="space-y-3">
                                            {category.items.map((service, serviceIndex) => (
                                                service.isBankSection ? (
                                                    // Special rendering for Banks section
                                                    <div
                                                        key={serviceIndex}
                                                        className="group bg-white rounded-lg p-3 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-300 cursor-pointer"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center shadow-sm group-hover:from-emerald-100 group-hover:to-teal-100 transition-all duration-300 overflow-hidden">
                                                                <span className="text-lg">{service.icon}</span>
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between mb-1">
                                                                    <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                                                                        {service.name}
                                                                    </h3>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        {service.banks?.map((bank, bankIndex) => (
                                                                            <button
                                                                                key={bankIndex}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleServiceClick(bank.link);
                                                                                }}
                                                                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium hover:bg-emerald-100 transition-colors border border-emerald-200 hover:border-emerald-300"
                                                                            >
                                                                                {bank.name}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm text-slate-600 leading-relaxed">
                                                                    {service.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Regular service item rendering
                                                    <div
                                                        key={serviceIndex}
                                                        onClick={() => handleServiceClick(service.link)}
                                                        className="group bg-white rounded-lg p-3 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-300 cursor-pointer"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center shadow-sm group-hover:from-emerald-100 group-hover:to-teal-100 transition-all duration-300 overflow-hidden">
                                                                <span className="text-lg">{service.icon}</span>
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                                                                        {service.name}
                                                                    </h3>
                                                                    <div className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium group-hover:bg-emerald-100 transition-colors">
                                                                        <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                        </svg>
                                                                        Link
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm text-slate-600 leading-relaxed">
                                                                    {service.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Services;