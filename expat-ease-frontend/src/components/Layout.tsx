import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Container from './Container';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout, selectedCountry, token } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [progressData, setProgressData] = useState<{ completed: number; total: number; percentage: number } | null>(null);

    // Fetch progress data when user is logged in
    useEffect(() => {
        if (user && token && selectedCountry) {
            fetchProgressData();
        } else {
            setProgressData(null);
        }
    }, [user, token, selectedCountry]);

    const fetchProgressData = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/tasks/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const tasks = await response.json();
                const completed = tasks.filter((task: any) => task.status === 'completed').length;
                const total = tasks.length;
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

                setProgressData({ completed, total, percentage });
            }
        } catch (error) {
            console.error('Failed to fetch progress data:', error);
        }
    };

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
    };

    const handleLogoClick = () => {
        // Smart navigation based on user state
        if (!user) {
            // Not logged in - stay on landing page (no action needed)
            return;
        } else if (user && (!selectedCountry || user.country_selected === false)) {
            // Logged in but hasn't completed country selection - stay on country selection
            return;
        } else {
            // Logged in with country selected - reset dashboard to main view
            // Dispatch custom event to reset dashboard states
            window.dispatchEvent(new CustomEvent('dashboard-reset'));
            // Also scroll to top when returning to dashboard
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Close any open modals
        setShowLoginForm(false);
        setShowRegisterForm(false);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen">
            {/* Navigation Bar */}
            <nav className="glass border-b border-white/20 backdrop-blur-md sticky top-0 z-50">
                <Container>
                    {/* Main Navigation Row */}
                    <div className="flex justify-between items-center h-16 px-4">

                        {/* Left Section - Logo */}
                        <div className="flex items-center">
                            <button
                                onClick={handleLogoClick}
                                className="text-2xl font-bold text-gradient hover:scale-105 transition-transform duration-200"
                                title={
                                    !user
                                        ? "Home"
                                        : user && (!selectedCountry || user.country_selected === false)
                                            ? "Complete country selection"
                                            : "Dashboard"
                                }
                            >
                                Expat Ease
                            </button>
                        </div>

                        {/* Center Section - Progress Bar (Desktop Only) */}
                        {user && progressData && (
                            <div className="hidden lg:flex items-center flex-1 max-w-xl mx-8">
                                <div className="w-full">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-600">
                                            Progress
                                        </span>
                                        <span className="text-sm font-medium text-slate-600">
                                            {progressData.completed}/{progressData.total}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                                                style={{ width: `${progressData.percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="absolute top-4 left-0 right-0 text-center">
                                            <span className="text-xs font-semibold text-slate-700 bg-white px-2 py-1 rounded-full shadow-sm">
                                                {progressData.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Right Section - User Actions */}
                        <div className="flex items-center space-x-3">
                            {user ? (
                                <div className="flex items-center space-x-3">
                                    {/* User Info */}
                                    <div className="hidden sm:flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-semibold">
                                                {(user.full_name || user.email).charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-700 leading-tight">
                                                {user.full_name || user.email.split('@')[0]}
                                            </span>
                                            <span className="text-xs text-slate-500 leading-tight">
                                                {user.country || 'No country selected'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Logout Button - Properly sized */}
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all duration-200"
                                    >
                                        <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => setShowLoginForm(true)}
                                        className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                    >
                                        Log in
                                    </button>
                                </div>
                            )}

                            {/* Mobile menu button */}
                            <button
                                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Toggle mobile menu"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden border-t border-white/20 py-4 bg-white/50 backdrop-blur-sm">
                            <div className="space-y-4">
                                {user ? (
                                    <div className="px-4 py-3">
                                        {/* Mobile User Info */}
                                        <div className="flex items-center space-x-4 mb-6">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                                <span className="text-white text-lg font-semibold">
                                                    {(user.full_name || user.email).charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-medium text-slate-700 leading-tight">
                                                    {user.full_name || user.email.split('@')[0]}
                                                </span>
                                                <span className="text-sm text-slate-500 leading-tight">
                                                    {user.country || 'No country selected'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Mobile Progress Bar */}
                                        {progressData && (
                                            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        Settlement Progress
                                                    </span>
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {progressData.percentage}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs text-slate-600">
                                                        {progressData.completed}/{progressData.total} tasks completed
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
                                                    <div
                                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                                                        style={{ width: `${progressData.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all duration-200"
                                        >
                                            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <div className="px-4 py-4">
                                        <button
                                            onClick={() => {
                                                setShowLoginForm(true);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-3 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                        >
                                            Log in
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Container>
            </nav>

            {/* Main Content */}
            <main className="flex-grow pt-6">
                {children}
            </main>

            {/* Footer - Only show when user is logged in */}
            {user && (
                <footer className="bg-white border-t border-gray-200 mt-auto">
                    <Container>
                        <div className="py-8 text-center text-gray-600">
                            <p>&copy; 2025 Expat Ease. Helping immigrants and expats settle in a new country.</p>
                        </div>
                    </Container>
                </footer>
            )}

            {/* Authentication Modals */}
            {showLoginForm && (
                <LoginForm
                    onClose={() => setShowLoginForm(false)}
                    onOpenRegister={() => {
                        setShowLoginForm(false);
                        setShowRegisterForm(true);
                    }}
                />
            )}

            {showRegisterForm && (
                <RegisterForm
                    onClose={() => setShowRegisterForm(false)}
                    onOpenLogin={() => {
                        setShowRegisterForm(false);
                        setShowLoginForm(true);
                    }}
                />
            )}
        </div>
    );
};

export default Layout;
