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
import ResetPasswordPage from './pages/ResetPasswordPage';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/auth-context';

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
    // Allow unauthenticated access to public routes like /reset-password
    const publicPaths = ['/', '/reset-password'];
    if (!isLoading && !user && !publicPaths.includes(location.pathname)) {
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
    // Also check localStorage in case API update failed but country was selected
    const hasSelectedCountry = selectedCountry || localStorage.getItem('selectedCountry');
    if (!hasSelectedCountry || user.country_selected === false) {
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
      <div className="px-4 pb-4 lg:h-[calc(100vh-5.5rem)] lg:overflow-hidden">
        <div className="mx-auto h-full w-full max-w-7xl">

          {/* Split hero and authentication actions */}
          <section className="grid h-full grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="flex w-full items-center justify-center">
              <img
                src="/images/expat-ease-hero.png"
                alt="World map showing international journeys with airplanes, a passport, and a boarding pass"
                className="h-auto w-full object-contain"
              />
            </div>

            <div className="relative flex items-center justify-center py-4 lg:justify-end lg:py-0 lg:pr-8">
              <div
                aria-hidden="true"
                className="absolute right-8 top-1/4 h-40 w-40 rounded-full bg-cyan-200/40 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="absolute bottom-1/4 left-8 h-32 w-32 rounded-full bg-emerald-200/50 blur-3xl"
              />

              <div className="relative z-10 w-full max-w-md text-left">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Welcome to Expat Ease
                </p>

                <h1 className="mb-8 text-4xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
                  Settle in with{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                    confidence.
                  </span>
                </h1>

                <div className="w-full sm:max-w-sm">
                    <button
                      onClick={openRegisterForm}
                      className="group flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3.5 text-lg font-semibold text-white shadow-lg shadow-emerald-800/15 transition-all duration-200 hover:-translate-y-0.5 hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                      <span>Create free account</span>
                      <svg className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    <p className="mt-5 text-sm text-slate-600">
                      Already have an account?{' '}
                      <button
                        onClick={openLoginForm}
                        className="font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-4 transition-colors hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                      >
                        Log in
                      </button>
                    </p>
                </div>
              </div>
            </div>
          </section>

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

      {/* Public route: reset password */}
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>

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
