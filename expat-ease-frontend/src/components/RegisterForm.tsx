import React, { useState } from 'react';
import { getApiUrl } from '../utils/api';

interface RegisterFormProps {
    onClose: () => void;
    onOpenLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onClose, onOpenLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        country_of_origin: '', // No default value - field starts empty
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch(getApiUrl('/api/v1/users/'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    full_name: formData.fullName,
                    country: formData.country_of_origin, // Send as country for backend compatibility
                }),
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                }, 2000);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Registration failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 text-center">
                    <div className="text-green-600 text-4xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                    <p className="text-gray-600">You can now log in with your credentials.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-sm mx-auto p-8 border border-gray-200 rounded-lg shadow-sm">
                {/* Header */}
                <div className="text-center mb-8">
                    <button
                        onClick={onClose}
                        className="text-3xl font-bold text-primary-600 mb-2 hover:text-primary-700 transition-colors duration-200"
                    >
                        Expat Ease
                    </button>
                    <p className="text-gray-600">Join our community</p>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-gray-50"
                            placeholder="Full name"
                        />
                    </div>

                    <div>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-gray-50"
                            placeholder="Email"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                            className="w-full px-3 py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-gray-50"
                            placeholder="Password (min 8 characters)"
                        />
                    </div>

                    <div>
                        <label htmlFor="country_of_origin" className="block text-sm font-medium text-gray-700 mb-1">
                            Country of Origin
                        </label>
                        <input
                            type="text"
                            id="country_of_origin"
                            name="country_of_origin"
                            value={formData.country_of_origin}
                            onChange={handleChange}
                            className="w-full px-3 py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-gray-50"
                            placeholder="e.g., United States, Spain, India..."
                            aria-label="Country of Origin"
                        />
                        <p className="mt-1 text-xs text-gray-500">This is for display purposes only</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Creating Account...' : 'Sign up'}
                    </button>
                </form>

                {/* Terms */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                        By signing up, you agree to our{' '}
                        <a href="#" className="text-primary-600 hover:text-primary-700">Terms</a>
                        {' '}and{' '}
                        <a href="#" className="text-primary-600 hover:text-primary-700">Privacy Policy</a>
                    </p>
                </div>

                {/* Sign In Section */}
                <div className="border-t border-gray-200 pt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <button
                            onClick={() => {
                                onClose();
                                if (onOpenLogin) {
                                    onOpenLogin();
                                }
                            }}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Sign in
                        </button>
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default RegisterForm;
