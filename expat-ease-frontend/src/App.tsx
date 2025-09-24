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
      {/* Modern Landing Page */}
      <div className="min-h-screen flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gradient mb-4">
              Welcome to Expat Ease
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Your comprehensive guide to settling in a new city. From documents to community,
              we've got everything you need for a smooth transition.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">

            {/* Left Side - Images and Visual Elements */}
            <div className="space-y-6">
              {/* Airplane Image */}
              <div className="relative">
                <div className="card-hover bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
                  <img
                    src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=240&fit=crop&crop=center"
                    alt="Airplane landing"
                    className="w-full h-48 object-cover rounded-xl shadow-lg"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <span className="text-blue-600 font-semibold text-sm">✈️ New Journey</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passport Image */}
              <div className="relative">
                <div className="card-hover bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 rounded-2xl border border-emerald-100">
                  <img
                    src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=240&fit=crop&crop=center"
                    alt="Person holding passport"
                    className="w-full h-48 object-cover rounded-xl shadow-lg"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <span className="text-emerald-600 font-semibold text-sm">📄 Documents Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Features and CTA */}
            <div className="space-y-6">
              {/* Feature Cards */}
              <div className="space-y-4">
                <div className="card-hover bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4 rounded-xl border border-violet-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg">📋</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">Settlement Checklist</h3>
                      <p className="text-slate-600 text-sm">Track your progress with our step-by-step guide</p>
                    </div>
                  </div>
                </div>

                <div className="card-hover bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 p-4 rounded-xl border border-rose-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg">🤝</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">Community Support</h3>
                      <p className="text-slate-600 text-sm">Connect with local organizations and fellow expats</p>
                    </div>
                  </div>
                </div>

                <div className="card-hover bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 rounded-xl border border-emerald-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg">🏛️</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">Local Services</h3>
                      <p className="text-slate-600 text-sm">Find government offices and essential services</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="card bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">Get Started Today</h2>
                <div className="space-y-3">
                  <button
                    onClick={openLoginForm}
                    className="btn btn-primary w-full py-3"
                  >
                    Log in
                  </button>
                  <button
                    onClick={openRegisterForm}
                    className="btn btn-secondary w-full py-3"
                  >
                    Create Account
                  </button>
                </div>
                <p className="text-center text-slate-500 mt-3 text-sm">
                  Join thousands of expats who've made their transition easier
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <div className="card-hover bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 inline-block">
              <p className="text-slate-600 font-medium text-sm">
                Built by <span className="text-gradient font-bold">Prajwal</span> with ❤️ for the expat community
              </p>
            </div>
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
