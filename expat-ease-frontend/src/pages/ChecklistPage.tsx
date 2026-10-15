import { useEffect, useState } from 'react';
import type { CSSProperties, FC } from 'react';
import FireworksAnimation from '../components/checklist/FireworksAnimation';
import StepCard from '../components/checklist/StepCard';
import { useToast } from '../components/toast-context';
import { useAuth } from '../contexts/auth-context';
import { useChecklist } from '../hooks/useChecklist';

const ChecklistPage: FC = () => {
  const { user, token, selectedCountry } = useAuth();
  const { addToast } = useToast();
  const country = user?.settlement_country || selectedCountry || 'France';
  const {
    steps,
    loading,
    error,
    uploadingFile,
    isResetting,
    wasCompleteOnLoad,
    fetchSteps,
    updateStepCompletion,
    skipStep,
    unskipStep,
    saveNotes,
    uploadDocument,
    resetSteps,
  } = useChecklist({ token, userReady: Boolean(user), addToast });

  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [hasShownCompletionCelebration, setHasShownCompletionCelebration] = useState(false);
  const [previousCompletionCount, setPreviousCompletionCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => setShowScrollToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (wasCompleteOnLoad) setHasShownCompletionCelebration(true);
  }, [wasCompleteOnLoad]);

  useEffect(() => {
    const completedCount = steps.filter((step) => step.is_completed || step.is_skipped).length;
    const total = steps.length;
    if (
      total > 0
      && completedCount === total
      && !wasCompleteOnLoad
      && !hasShownCompletionCelebration
      && !isResetting
      && completedCount > previousCompletionCount
    ) {
      setHasShownCompletionCelebration(true);
      const timeout = setTimeout(() => {
        setShowFireworks(true);
        setTimeout(() => setShowFireworks(false), 8000);
      }, 500);
      return () => clearTimeout(timeout);
    }
    setPreviousCompletionCount(completedCount);
  }, [
    steps,
    wasCompleteOnLoad,
    hasShownCompletionCelebration,
    isResetting,
    previousCompletionCount,
  ]);

  const handleResetSteps = async () => {
    setShowResetConfirm(false);
    const resetSucceeded = await resetSteps();
    if (resetSucceeded) {
      setHasShownCompletionCelebration(false);
      setPreviousCompletionCount(0);
    }
  };

  const completedSteps = steps.filter((step) => step.is_completed || step.is_skipped).length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0
    ? Math.round((completedSteps / totalSteps) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your settlement checklist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchSteps} className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      {showFireworks && <FireworksAnimation />}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h1 className="text-4xl font-bold text-gradient leading-tight py-2">Settlement Checklist</h1>
            <div className="mt-4 sm:mt-0 flex items-center space-x-2">
              {showResetConfirm ? (
                <>
                  <span className="text-sm text-slate-600">Reset all progress?</span>
                  <button onClick={handleResetSteps} disabled={isResetting}
                    className="px-3 py-1.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50">
                    Yes, reset
                  </button>
                  <button onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200">
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setShowResetConfirm(true)} disabled={isResetting}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  {isResetting ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2" />Resetting...</>
                  ) : (
                    <><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>Reset All Steps</>
                  )}
                </button>
              )}
            </div>
          </div>
          <p className="text-lg text-slate-600 mb-6">
            Complete these steps in order to settle in {country}. Each completed step unlocks the next one.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step) => (
            <StepCard
              key={step.id}
              step={step}
              country={country}
              uploadingFile={uploadingFile}
              onToggleComplete={updateStepCompletion}
              onDocumentUpload={uploadDocument}
              onSaveNotes={saveNotes}
              onSkip={skipStep}
              onUnskip={unskipStep}
            />
          ))}
        </div>

        {completedSteps === totalSteps && totalSteps > 0 && (
          <div className="mt-8 card bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-8 rounded-2xl text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-900 mb-3">Congratulations!</h2>
            <p className="text-green-700 text-lg">
              You've completed all settlement steps! You're now well-prepared to settle in {country}.
            </p>
            <div className="mt-6">
              <span className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-full font-medium">✓ Settlement Complete</span>
            </div>
          </div>
        )}
      </div>

      <div className="fixed top-1/2 right-6 transform -translate-y-1/2 z-50 select-none">
        <div className="card bg-white/95 backdrop-blur-md border border-white/30 shadow-2xl rounded-2xl p-3 sm:p-4 min-w-[250px] sm:min-w-[280px] max-w-[90vw] sm:max-w-none hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800">Progress</h3>
            <div className="text-right">
              <span className="text-lg font-bold text-emerald-600">{progressPercentage}%</span>
              <p className="text-xs text-slate-500">{completedSteps}/{totalSteps}</p>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner mb-3">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercentage}%` } as CSSProperties} />
          </div>
          <div className="flex justify-between mb-3">
            {steps.map((step) => (
              <div key={step.id} className="text-center flex-1">
                <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${step.is_skipped ? 'bg-amber-400' : step.is_completed ? 'bg-green-500' : step.is_unlocked ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className="text-xs text-slate-400">{step.step_number}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600">{completedSteps === totalSteps ? 'Complete!' : `${totalSteps - completedSteps} remaining`}</span>
            <span className={`px-2 py-1 rounded-full font-medium ${completedSteps === totalSteps ? 'bg-green-100 text-green-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {completedSteps === totalSteps ? '🎉 Done' : '📋 In Progress'}
            </span>
          </div>
        </div>
      </div>

      {showScrollToTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center"
          aria-label="Scroll to top">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChecklistPage;
