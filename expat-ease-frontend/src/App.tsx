import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CountrySelection from './components/CountrySelection';
import ChecklistPage from './pages/ChecklistPage';
import DocumentsSection from './components/DocumentsSection';
import Services from './components/Services';
import Profile from './components/Profile';
import ForumPage from './pages/ForumPage';
import ForumThreadPage from './pages/ForumThreadPage';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { user, isLoading, selectedCountry, selectCountry } = useAuth();
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
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

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > 300); // Show button after scrolling 300px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // Handle routing for logged-in users with proper React Router
    return (
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checklist" element={<ChecklistPage />} />
          <Route path="/documents" element={<DocumentsSection />} />
          <Route path="/services" element={<Services />} />
          <Route path="/community" element={<ForumPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/forum/question/:questionId" element={<ForumThreadPage />} />
          <Route path="/profile" element={<Profile />} />
          {/* Catch-all route - redirect to dashboard */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Modern Landing Page */}
      <div className="min-h-screen px-4 py-8">
        <div className="w-full max-w-6xl mx-auto">

          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gradient mb-4 leading-tight py-2">
              Welcome to Expat Ease
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Your comprehensive guide to settling in a new city. <br />Documents to community,
              we've got everything you need for a smooth transition.
            </p>
          </div>

          {/* Main CTA Section */}
          <div className="text-center mb-16">
            <div className="max-w-md mx-auto">
              <div className="card bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-white/30 shadow-xl">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Get Started Today</h2>
                <div className="space-y-4">
                  <button
                    onClick={openLoginForm}
                    className="btn btn-primary w-full py-4 text-lg"
                  >
                    Log in
                  </button>
                  <button
                    onClick={openRegisterForm}
                    className="btn btn-secondary w-full py-4 text-lg"
                  >
                    Create Account
                  </button>
                </div>
                <p className="text-center text-slate-500 mt-6 text-sm">
                  Join thousands of expats who've made their transition easier
                </p>
              </div>
            </div>
          </div>

          {/* Feature Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">
              Everything You Need to Settle In
            </h2>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card-hover bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-6 rounded-xl border border-violet-100 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                  <span className="text-white text-2xl">📋</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Settlement Checklist</h3>
                <p className="text-slate-600 leading-relaxed">Track your progress with our comprehensive step-by-step guide</p>
              </div>

              <div className="card-hover bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 p-6 rounded-xl border border-rose-100 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                  <span className="text-white text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Community Support</h3>
                <p className="text-slate-600 leading-relaxed">Connect with local organizations and fellow expats</p>
              </div>

              <div className="card-hover bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 rounded-xl border border-emerald-100 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                  <span className="text-white text-2xl">🏛️</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Local Services</h3>
                <p className="text-slate-600 leading-relaxed">Find government offices and essential services</p>
              </div>
            </div>
          </div>

          {/* Visual Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
            <div className="space-y-6">
              <div className="relative">
                <div className="card-hover bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 rounded-2xl border border-emerald-100">
                  <img
                    src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&h=300&fit=crop&crop=center"
                    alt="Airplane landing"
                    className="w-full h-48 object-cover rounded-xl shadow-lg"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full">
                      <span className="text-emerald-600 font-semibold">✈️ New Journey</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <div className="card-hover bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 rounded-2xl border border-emerald-100">
                  <img
                    src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&h=300&fit=crop&crop=center"
                    alt="Person holding passport"
                    className="w-full h-48 object-cover rounded-xl shadow-lg"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full">
                      <span className="text-emerald-600 font-semibold">📄 Documents Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <div className="card-hover bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-100 inline-block">
              <p className="text-slate-600 font-medium">
                Built by <span className="text-gradient font-bold">Prajwal</span> with ❤️ for the expat community
              </p>
            </div>
          </div>
        </div>

        {/* Scroll to Top Button */}
        {showScrollToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center"
            aria-label="Scroll to top"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}
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
