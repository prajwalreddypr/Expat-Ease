import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Container from './Container';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout, selectCountry } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [showRegisterForm, setShowRegisterForm] = useState(false);

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
    };

    const handleLogoClick = () => {
        // Reset country selection to go back to homepage flow
        selectCountry('');
        // Close any open modals
        setShowLoginForm(false);
        setShowRegisterForm(false);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <Container>
                    <div className="flex justify-between items-center h-14">
                        {/* Logo */}
                        <div className="flex items-center">
                            <button
                                onClick={handleLogoClick}
                                className="text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors duration-200"
                            >
                                Expat Ease
                            </button>
                        </div>

                        {/* Desktop Navigation - Hidden for landing page */}
                        {user && (
                            <div className="hidden md:flex items-center space-x-4">
                                <span className="text-gray-600">
                                    
                                </span>
                            </div>
                        )}

                        {/* Right side - Auth */}
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600">
                                        Welcome, {user.full_name || user.email}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="px-3 py-1 text-sm border border-primary-600 text-primary-600 rounded-md hover:bg-primary-600 hover:text-white transition-colors duration-200"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <button
                                        onClick={() => setShowLoginForm(true)}
                                        className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
                                    >
                                        Log in
                                    </button>
                                </div>
                            )}

                            {/* Mobile menu button */}
                            <button
                                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
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
                        <div className="md:hidden border-t border-gray-200 py-4">
                            <div className="space-y-2">
                                {user ? (
                                    <div className="px-4 py-2">
                                        <p className="text-sm text-gray-600 mb-2">
                                            Welcome, {user.full_name || user.email}
                                        </p>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-600 hover:text-white transition-colors duration-200"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <div className="px-4">
                                        <button
                                            onClick={() => {
                                                setShowLoginForm(true);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
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
            <main className="flex-grow">
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
