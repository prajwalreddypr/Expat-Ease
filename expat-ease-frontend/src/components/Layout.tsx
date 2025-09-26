import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Container from './Container';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Profile from './Profile';

interface LayoutProps {
    children: React.ReactNode;
    showProfile?: boolean;
    onCloseProfile?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, showProfile, onCloseProfile }) => {
    const { user, logout, selectedCountry } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [showRegisterForm, setShowRegisterForm] = useState(false);

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


                        {/* Right Section - User Actions */}
                        <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
                            {user ? (
                                <div className="hidden lg:flex items-center space-x-4 lg:space-x-6">
                                    {/* User Info - Hidden on smaller screens */}
                                    <div className="hidden xl:flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                                            {user.profile_photo ? (
                                                <img
                                                    src={user.profile_photo}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-white text-sm font-semibold">
                                                    {(user.full_name || user.email).charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <span className="text-sm font-semibold text-slate-700 leading-tight">
                                                {user.full_name || user.email.split('@')[0]}
                                            </span>
                                            <span className="text-xs text-slate-500 leading-tight mt-0.5">
                                                {user.country || 'Not specified'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Profile Button - Responsive sizing */}
                                    <button
                                        onClick={() => {
                                            console.log('Profile button clicked');
                                            window.dispatchEvent(new CustomEvent('navigate-to-profile'));
                                        }}
                                        className="hidden sm:flex items-center px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="hidden lg:inline">Profile</span>
                                    </button>

                                    {/* Logout Button - Responsive sizing */}
                                    <button
                                        onClick={handleLogout}
                                        className="hidden sm:flex items-center px-3 lg:px-6 py-2 lg:py-2.5 text-xs lg:text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span className="hidden lg:inline">Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="hidden lg:flex items-center space-x-3">
                                    <button
                                        onClick={() => setShowLoginForm(true)}
                                        className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                                    >
                                        Log in
                                    </button>
                                </div>
                            )}

                            {/* Mobile menu button - Always visible on mobile */}
                            <button
                                className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
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
                        <div className="lg:hidden border-t border-white/20 py-4 bg-white/50 backdrop-blur-sm">
                            <div className="space-y-4">
                                {user ? (
                                    <div className="px-4 py-3">
                                        {/* Mobile User Info */}
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                                                {user.profile_photo ? (
                                                    <img
                                                        src={user.profile_photo}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-white text-sm font-semibold">
                                                        {(user.full_name || user.email).charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col justify-center min-w-0 flex-1">
                                                <span className="text-sm font-semibold text-slate-700 leading-tight truncate">
                                                    {user.full_name || user.email.split('@')[0]}
                                                </span>
                                                <span className="text-xs text-slate-500 leading-tight mt-0.5 truncate">
                                                    {user.country || 'Not specified'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Mobile Profile Button */}
                                        <button
                                            onClick={() => {
                                                console.log('Mobile profile button clicked');
                                                window.dispatchEvent(new CustomEvent('navigate-to-profile'));
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md mb-3"
                                        >
                                            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Profile
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md"
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
                                            className="w-full px-4 py-3 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
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

            {/* Profile Modal */}
            {showProfile && onCloseProfile && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                    onClick={(e) => {
                        // Close modal when clicking on the overlay (outside the modal content)
                        if (e.target === e.currentTarget) {
                            onCloseProfile();
                        }
                    }}
                >
                    <div id="profile-modal-container" className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <Profile onClose={onCloseProfile} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout;
