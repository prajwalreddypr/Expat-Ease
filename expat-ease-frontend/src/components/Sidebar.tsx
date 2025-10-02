import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: '🏠'
        },
        {
            name: 'Settlement Checklist',
            path: '/checklist',
            icon: '📋'
        },
        {
            name: 'Documents',
            path: '/documents',
            icon: '📄'
        },
        {
            name: 'Services',
            path: '/services',
            icon: '🤝'
        },
        {
            name: 'Community Forum',
            path: '/forum',
            icon: '💬'
        },
        {
            name: 'Profile',
            path: '/profile',
            icon: '👤'
        }
    ];

    const handleNavigation = (path: string) => {
        navigate(path);
        onClose();
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-gradient">Expat Ease</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label="Close sidebar"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <button
                                    onClick={() => handleNavigation(item.path)}
                                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${location.pathname === item.path
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                        }`}
                                >
                                    <span className="text-lg mr-3">{item.icon}</span>
                                    <span className="font-medium">{item.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
