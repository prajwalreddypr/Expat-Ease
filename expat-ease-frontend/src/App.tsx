import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CountrySelection from './components/CountrySelection';
import ChecklistPage from './pages/ChecklistPage';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { user, isLoading, selectedCountry, selectCountry } = useAuth();
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      // Close any open modals when user clicks browser back button
      setShowLoginForm(false);
      setShowRegisterForm(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Redirect logged-out users from protected routes to homepage
  useEffect(() => {
    if (!isLoading && !user && location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, [user, isLoading, location.pathname, navigate]);

  // Add history entry when opening modals
  const openLoginForm = () => {
    setShowLoginForm(true);
    window.history.pushState({ modal: 'login' }, '', window.location.pathname);
  };

  const openRegisterForm = () => {
    setShowRegisterForm(true);
    window.history.pushState({ modal: 'register' }, '', window.location.pathname);
  };

  const closeModals = () => {
    setShowLoginForm(false);
    setShowRegisterForm(false);
    // Go back in history to remove the modal state
    window.history.back();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (user) {
    // Show country selection if user is logged in but hasn't completed country selection flow
    // Registration country doesn't count - only country selection flow does
    if (!selectedCountry || user.country_selected === false) {
      return (
        <Layout>
          <CountrySelection onCountrySelect={selectCountry} />
        </Layout>
      );
    }

    // Handle routing for logged-in users
    if (location.pathname === '/checklist') {
      return (
        <Layout>
          <ChecklistPage />
        </Layout>
      );
    }

    // Show dashboard if user is logged in and has completed country selection flow
    return (
      <Layout>
        <Dashboard />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Instagram-style landing page */}
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Main content card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-primary-600 mb-3">Expat Ease</h1>
              <p className="text-gray-600">Your guide to settling in a new city</p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-5 mb-10">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 text-lg">📄</span>
                </div>
                <p className="text-gray-600">Track required documents</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 text-lg">📋</span>
                </div>
                <p className="text-gray-600">Complete settlement tasks</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 text-lg">🏛️</span>
                </div>
                <p className="text-gray-600">Find local services</p>
              </div>
            </div>

            {/* Call to action */}
            <div className="space-y-4">
              <button
                onClick={openLoginForm}
                className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors duration-200 text-base"
              >
                Log in
              </button>
              <button
                onClick={openRegisterForm}
                className="w-full py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors duration-200 text-base"
              >
                Sign up
              </button>
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Bulit by Prajwal with ❤️
            </p>
          </div>
        </div>
      </div>

      {/* Register Form Modal */}
      {showRegisterForm && (
        <RegisterForm
          onClose={closeModals}
          onOpenLogin={() => {
            setShowRegisterForm(false);
            openLoginForm();
          }}
        />
      )}

      {/* Login Form Modal */}
      {showLoginForm && (
        <LoginForm
          onClose={closeModals}
          onOpenRegister={() => {
            setShowLoginForm(false);
            openRegisterForm();
          }}
        />
      )}
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
