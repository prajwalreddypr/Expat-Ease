import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../utils/api';

interface SettlementStep {
  id: number;
  user_id: number;
  step_number: number;
  title: string;
  description: string;
  is_completed: boolean;
  is_unlocked: boolean;
  created_at: string;
  updated_at: string;
  has_document: boolean;
  document_url?: string;
}

const ChecklistPage: React.FC = () => {
  const { user, token, selectedCountry } = useAuth();
  const [steps, setSteps] = useState<SettlementStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState<number | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (token && user) {
      initializeOrFetchSteps();
    }
  }, [token, user]);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Trigger fireworks when all steps are completed
  useEffect(() => {
    const completedSteps = steps.filter(step => step.is_completed).length;
    const totalSteps = steps.length;

    if (totalSteps > 0 && completedSteps === totalSteps) {
      // Trigger fireworks after a short delay
      const timer = setTimeout(() => {
        setShowFireworks(true);
        // Hide fireworks after animation completes (8 seconds)
        setTimeout(() => {
          setShowFireworks(false);
        }, 8000);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [steps]);

  const initializeOrFetchSteps = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching settlement steps with token:', token ? 'present' : 'missing');

      // First try to get existing steps
      const response = await fetch(getApiUrl('/api/v1/settlement-steps/'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to fetch settlement steps: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);

      // If no steps exist (empty array), initialize them
      if (data.length === 0) {
        console.log('No steps found, initializing...');
        const initResponse = await fetch(getApiUrl('/api/v1/settlement-steps/initialize'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!initResponse.ok) {
          const initErrorText = await initResponse.text();
          console.error('Init API Error:', initErrorText);
          throw new Error(`Failed to initialize settlement steps: ${initResponse.status} ${initErrorText}`);
        }

        const initData = await initResponse.json();
        console.log('Initialized steps:', initData);
        setSteps(initData);
      } else {
        console.log('Found existing steps:', data);
        setSteps(data);
      }
    } catch (err) {
      console.error('Error fetching steps:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateStepCompletion = async (stepId: number, isCompleted: boolean) => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/settlement-steps/${stepId}`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_completed: isCompleted }),
      });

      if (!response.ok) {
        throw new Error('Failed to update step');
      }

      const updatedStep = await response.json();

      // Update the steps state
      setSteps(prevSteps =>
        prevSteps.map(step => {
          if (step.id === stepId) {
            return updatedStep;
          }
          // Also update the next step if it should be unlocked
          if (step.step_number === updatedStep.step_number + 1 && isCompleted) {
            return { ...step, is_unlocked: true };
          }
          return step;
        })
      );
    } catch (err) {
      console.error('Error updating step:', err);
      setError(err instanceof Error ? err.message : 'Failed to update step');
    }
  };

  const handleDocumentUpload = async (stepId: number, file: File) => {
    setUploadingFile(stepId);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(getApiUrl(`/api/v1/documents/upload?settlement_step_id=${stepId}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const documentData = await response.json();

      // Update the step to show it has a document
      setSteps(prevSteps =>
        prevSteps.map(step =>
          step.id === stepId
            ? {
              ...step,
              has_document: true,
              document_url: documentData.download_url
            }
            : step
        )
      );
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploadingFile(null);
    }
  };

  const handleResetSteps = async () => {
    if (!token) return;

    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to reset all settlement steps? This will:\n\n' +
      '• Delete all your progress\n' +
      '• Remove all uploaded documents\n' +
      '• Start over with step 1\n\n' +
      'This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setIsResetting(true);
      setError(null);

      const response = await fetch(getApiUrl('/api/v1/settlement-steps/reset'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        throw new Error(errorData.detail || `Failed to reset steps: ${response.status}`);
      }

      const resetSteps = await response.json();
      setSteps(resetSteps);

      // Show success message
      alert('Settlement steps have been reset successfully! You can now start over.');

    } catch (err) {
      console.error('Reset failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset steps');
    } finally {
      setIsResetting(false);
    }
  };

  const StepCard: React.FC<{ step: SettlementStep }> = ({ step }) => {
    const [showUpload, setShowUpload] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setUploadedFile(file);
      }
    };

    const handleUpload = () => {
      if (uploadedFile) {
        handleDocumentUpload(step.id, uploadedFile);
        setShowUpload(false);
        setUploadedFile(null);
      }
    };

    return (
      <div className={`relative transition-all duration-300 ${!step.is_unlocked ? 'opacity-50 blur-sm' : 'opacity-100'
        }`}>
        <div className="card bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg p-6 rounded-2xl">
          <div className="flex items-start space-x-4">
            {/* Step Number */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${step.is_completed
              ? 'bg-green-500 text-white'
              : step.is_unlocked
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-300 text-gray-600'
              }`}>
              {step.step_number}
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-2">{step.title}</h3>
              <p className="text-slate-600 mb-4">{step.description}</p>

              {/* Completion Question */}
              {step.is_unlocked && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-700 mb-3">
                    Have you completed this step?
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => updateStepCompletion(step.id, true)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${step.is_completed
                        ? 'bg-green-500 text-white'
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                        }`}
                    >
                      ✓ Yes
                    </button>
                    <button
                      onClick={() => updateStepCompletion(step.id, false)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${!step.is_completed
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      ✗ No
                    </button>
                  </div>
                </div>
              )}

              {/* Document Upload Section */}
              {step.is_completed && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-emerald-900 mb-1">Upload Document</h4>
                      <p className="text-sm text-emerald-700">
                        {step.has_document ? 'Document uploaded successfully' : 'Upload a related document (optional)'}
                      </p>
                    </div>

                    {!step.has_document && !showUpload && (
                      <button
                        onClick={() => setShowUpload(true)}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200 text-sm"
                      >
                        Upload
                      </button>
                    )}

                    {step.has_document && (
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 text-sm">✓ Document uploaded</span>
                        <button
                          onClick={() => window.open(step.document_url, '_blank')}
                          className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors duration-200"
                        >
                          View
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Upload Form */}
                  {showUpload && (
                    <div className="mt-4 space-y-3">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        aria-label="Upload document file"
                      />

                      {uploadedFile && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">
                            Selected: {uploadedFile.name}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleUpload}
                              disabled={uploadingFile === step.id}
                              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200 text-sm disabled:opacity-50"
                            >
                              {uploadingFile === step.id ? 'Uploading...' : 'Upload'}
                            </button>
                            <button
                              onClick={() => {
                                setShowUpload(false);
                                setUploadedFile(null);
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lock Overlay */}
        {!step.is_unlocked && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🔒</div>
              <p className="text-sm font-medium text-gray-600">Complete previous step to unlock</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Calculate progress
  const completedSteps = steps.filter(step => step.is_completed).length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fireworks Component
  const FireworksAnimation: React.FC = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#a8e6cf', '#ffd3a5'];

    const fireworks = Array.from({ length: 20 }, (_, i) => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 8 + Math.random() * 12; // Random size between 8px and 20px
      const animationDuration = 2 + Math.random() * 3; // 2-5 seconds
      const delay = Math.random() * 4; // 0-4 second delay

      return (
        <div
          key={i}
          className="absolute rounded-full opacity-0"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${size}px`,
            height: `${size}px`,
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            animation: `firework ${animationDuration}s ease-out forwards`,
            animationDelay: `${delay}s`,
            filter: 'blur(1px)',
            boxShadow: `0 0 ${size}px ${color}`
          }}
        />
      );
    });

    // Add some sparkle effects
    const sparkles = Array.from({ length: 30 }, (_, i) => (
      <div
        key={`sparkle-${i}`}
        className="absolute w-1 h-1 bg-white rounded-full opacity-0"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `firework-burst ${1 + Math.random() * 2}s ease-out forwards`,
          animationDelay: `${Math.random() * 5}s`
        }}
      />
    ));

    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {fireworks}
        {sparkles}

        {/* Celebration overlay with pulsing glow */}
        <div
          className="absolute inset-0 opacity-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(255, 107, 107, 0.1) 0%, transparent 70%)',
            animation: 'celebration-glow 2s ease-in-out infinite, fadeInOut 8s ease-in-out'
          }}
        />

        {/* Congratulatory Message */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center opacity-0"
          style={{
            animation: 'fadeInOut 8s ease-in-out'
          }}
        >
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/30">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold text-gradient mb-2">Congratulations!</h2>
            <p className="text-xl text-slate-600">You've completed all settlement steps!</p>
            <p className="text-lg text-slate-500 mt-2">Welcome to your new life abroad! 🌟</p>
          </div>
        </div>
      </div>
    );
  };


  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your settlement checklist...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={initializeOrFetchSteps}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      {/* Fireworks Animation */}
      {showFireworks && <FireworksAnimation />}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h1 className="text-4xl font-bold text-gradient leading-tight py-2">
              Settlement Checklist
            </h1>
            <button
              onClick={handleResetSteps}
              disabled={isResetting}
              className="mt-4 sm:mt-0 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResetting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                  Resetting...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset All Steps
                </div>
              )}
            </button>
          </div>
          <p className="text-lg text-slate-600 mb-6">
            Complete these steps in order to settle in {user?.settlement_country || selectedCountry}. Each completed step unlocks the next one.
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-6">
          {steps.map((step) => (
            <StepCard key={step.id} step={step} />
          ))}
        </div>

        {/* Completion Message */}
        {completedSteps === totalSteps && totalSteps > 0 && (
          <div className="mt-8 card bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-8 rounded-2xl text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-900 mb-3">Congratulations!</h2>
            <p className="text-green-700 text-lg">
              You've completed all settlement steps! You're now well-prepared to settle in {user?.settlement_country || selectedCountry}.
            </p>
            <div className="mt-6">
              <span className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-full font-medium">
                ✓ Settlement Complete
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Progress Bar */}
      <div
        className="fixed top-1/2 right-6 transform -translate-y-1/2 z-50 select-none"
      >
        <div className="card bg-white/95 backdrop-blur-md border border-white/30 shadow-2xl rounded-2xl transition-all duration-300 p-3 sm:p-4 min-w-[250px] sm:min-w-[280px] max-w-[90vw] sm:max-w-none hover:shadow-xl">

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              </div>
              <h3 className="text-sm font-bold text-slate-800">Progress</h3>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-emerald-600">{progressPercentage}%</span>
              <p className="text-xs text-slate-500">{completedSteps}/{totalSteps}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-3">
            <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercentage}%` } as React.CSSProperties}
              ></div>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between">
            {steps.map((step) => (
              <div key={step.id} className="text-center flex-1">
                <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${step.is_completed ? 'bg-green-500' :
                  step.is_unlocked ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}></div>
                <span className="text-xs text-slate-400">{step.step_number}</span>
              </div>
            ))}
          </div>

          {/* Quick Status */}
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">
                {completedSteps === totalSteps ? 'Complete!' : `${totalSteps - completedSteps} remaining`}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${completedSteps === totalSteps
                ? 'bg-green-100 text-green-700'
                : 'bg-emerald-100 text-emerald-700'
                }`}>
                {completedSteps === totalSteps ? '🎉 Done' : '📋 In Progress'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChecklistPage;