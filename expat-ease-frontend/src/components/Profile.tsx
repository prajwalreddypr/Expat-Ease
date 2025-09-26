import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../utils/api';

interface ProfileProps {
    onClose?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onClose }) => {
    const { user, token, refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profile_photo || null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        street_address: '',
        city: '',
        postal_code: '',
        phone_number: '',
    });

    // Initialize form data when user data is available
    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                street_address: user.street_address || '',
                city: user.city || '',
                postal_code: user.postal_code || '',
                phone_number: user.phone_number || '',
            });
        }
    }, [user]);

    // Scroll detection for scroll-to-top button
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setShowScrollButton(scrollTop > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setMessage({ type: 'error', text: 'Please select an image file' });
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'File size must be less than 5MB' });
                return;
            }

            setProfilePhoto(file);

            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setMessage(null);
        }
    };

    const uploadProfilePhoto = async () => {
        if (!profilePhoto || !token) return null;

        const formData = new FormData();
        formData.append('file', profilePhoto);

        try {
            const response = await fetch(getApiUrl('/api/v1/users/me/profile-photo'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload profile photo');
            }

            const updatedUser = await response.json();
            return updatedUser.profile_photo;
        } catch (error) {
            console.error('Error uploading profile photo:', error);
            throw error;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            let profilePhotoUrl = user?.profile_photo || null;

            // Upload profile photo if changed
            if (profilePhoto) {
                profilePhotoUrl = await uploadProfilePhoto();
            }

            // Update user profile
            const response = await fetch(getApiUrl('/api/v1/users/me'), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    profile_photo: profilePhotoUrl
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Refresh user data to update navigation avatar
            await refreshUser();

            // Clear photo selection
            setProfilePhoto(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Scroll modal content to top after successful update
            // Target the specific modal container by ID
            const modalContainer = document.getElementById('profile-modal-container');
            if (modalContainer) {
                modalContainer.scrollTo({ top: 0, behavior: 'smooth' });
            }

        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemovePhoto = () => {
        setProfilePhoto(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={onClose ? "py-6" : "min-h-screen py-6"}>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Close Button */}
                {onClose && (
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={onClose}
                            className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all duration-200"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Close
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md mb-4">
                        <span className="text-white text-2xl">👤</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-emerald-800 to-teal-800 bg-clip-text text-transparent mb-3">
                        Profile Settings
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Manage your personal information and profile photo
                    </p>
                </div>

                {/* Profile Form */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Photo Section */}
                        <div className="text-center">
                            <div className="mb-4">
                                <div
                                    className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 overflow-hidden"
                                    onClick={handlePhotoClick}
                                >
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-white text-2xl font-bold">
                                            {(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                    aria-label="Upload profile photo"
                                />
                            </div>
                            <div className="flex justify-center space-x-3">
                                <button
                                    type="button"
                                    onClick={handlePhotoClick}
                                    className="px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-800 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors"
                                >
                                    {previewUrl ? 'Change Photo' : 'Upload Photo'}
                                </button>
                                {previewUrl && (
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Message */}
                        {message && (
                            <div className={`p-4 rounded-lg ${message.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            {/* Full Name */}
                            <div className="sm:col-span-2">
                                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="full_name"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 text-sm sm:text-base"
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="sm:col-span-2">
                                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone_number"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="+33 1 23 45 67 89"
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 text-sm sm:text-base"
                                />
                            </div>

                            {/* Street Address */}
                            <div className="sm:col-span-2">
                                <label htmlFor="street_address" className="block text-sm font-medium text-gray-700 mb-2">
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    id="street_address"
                                    name="street_address"
                                    value={formData.street_address}
                                    onChange={handleChange}
                                    placeholder="123 Main Street"
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 text-sm sm:text-base"
                                />
                            </div>

                            {/* City */}
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                    City
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Paris"
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 text-sm sm:text-base"
                                />
                            </div>

                            {/* Postal Code */}
                            <div>
                                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">
                                    Postal Code
                                </label>
                                <input
                                    type="text"
                                    id="postal_code"
                                    name="postal_code"
                                    value={formData.postal_code}
                                    onChange={handleChange}
                                    placeholder="75001"
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 text-sm sm:text-base"
                                />
                            </div>
                        </div>

                        {/* Read-only Information */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                                        {user?.email || 'Not specified'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Country of Origin
                                    </label>
                                    <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                                        {user?.country || 'Not specified'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Settlement Country
                                    </label>
                                    <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                                        {user?.settlement_country || 'Not selected'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </div>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Scroll to Top Button */}
            {showScrollButton && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
                    aria-label="Scroll to top"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default Profile;
