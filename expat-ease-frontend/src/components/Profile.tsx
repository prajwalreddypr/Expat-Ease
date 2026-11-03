import { useEffect, useState } from 'react';
import type { FC, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './toast-context';
import { useAuth } from '../contexts/auth-context';
import { useProfileForm } from '../hooks/useProfileForm';
import AccountInformation from './profile/AccountInformation';
import ProfileFormFields from './profile/ProfileFormFields';
import ProfilePhotoSection from './profile/ProfilePhotoSection';

const Profile: FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user, token, refreshUser } = useAuth();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const {
    formData,
    isLoading,
    message,
    previewUrl,
    fileInputRef,
    handleChange,
    handlePhotoChange,
    handlePhotoClick,
    handleRemovePhoto,
    handleSubmit,
  } = useProfileForm({ user, token, refreshUser });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollButton(scrollTop > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProfileSubmit = async (event: FormEvent) => {
    const wasUpdated = await handleSubmit(event);

    if (!wasUpdated) {
      addToast({ type: 'error', message: 'Failed to update profile. Please try again.' });
      return;
    }

    addToast({ type: 'success', message: 'Profile updated successfully!' });
  };

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md mb-4">
            <span className="text-white text-2xl">👤</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-emerald-800 to-teal-800 bg-clip-text text-transparent mb-3">
            Profile Settings
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <ProfilePhotoSection
              user={user}
              previewUrl={previewUrl}
              fileInputRef={fileInputRef}
              onPhotoChange={handlePhotoChange}
              onPhotoClick={handlePhotoClick}
              onRemovePhoto={handleRemovePhoto}
            />

            {message && (
              <div className={`p-4 rounded-lg ${message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <ProfileFormFields formData={formData} onChange={handleChange} />
            <AccountInformation user={user} />

            <div className="flex items-center justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 text-slate-700 font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </div>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showScrollButton && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
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

export default Profile;
