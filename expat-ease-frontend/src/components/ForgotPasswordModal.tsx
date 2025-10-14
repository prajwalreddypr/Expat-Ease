import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { getApiUrl } from '../utils/api';
import { useToast } from './Toast';
import { useAuth } from '../contexts/AuthContext';

interface Props {
    onClose: () => void;
}

const ForgotPasswordModal: React.FC<Props> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
    const [token, setToken] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { addToast } = useToast();

    const auth = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // If user is authenticated, start verify-current-password flow
            if (auth.token && auth.user) {
                setStep('verify');
                setLoading(false);
                return;
            }

            // Unauthenticated combined flow: we ask for email + current + new in the same modal
            // If we're currently at 'request' step, switch to 'verify' to collect current password
            if (step === 'request') {
                setStep('verify');
                setLoading(false);
                return;
            }

            // If we're at verify step and have email + current + new, call change-password-by-email
            if (step === 'verify') {
                // use newPassword as current-password input in this UI arrangement until the user moves forward
                // For clarity we will use a separate local state 'currentPassword' — but to minimize edits re-use 'token' to track mode
            }
        } catch (err) {
            addToast({ type: 'error', message: 'Network error while requesting reset' });
        } finally {
            setLoading(false);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md mx-auto p-6 rounded shadow">
                <h3 className="text-lg font-medium mb-4">Reset your password</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* For unauthenticated users ask for email; for authenticated start with a Proceed button that asks for current password */}
                    {!auth.token && (
                        <input
                            type="email"
                            placeholder="Email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        />
                    )}
                    {step === 'request' && (
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded">
                                {loading ? (auth.token ? 'Proceeding...' : 'Sending...') : 'Proceed'}
                            </button>
                        </div>
                    )}
                </form>
                {step === 'reset' && token && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Enter a new password for the account.</p>
                        <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border rounded mb-2" />
                        <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border rounded mb-2" />
                        <div className="flex justify-end">
                            <button
                                type="button"
                                disabled={loading}
                                onClick={async () => {
                                    if (newPassword.length < 8) {
                                        addToast({ type: 'error', message: 'Password must be at least 8 characters' });
                                        return;
                                    }
                                    if (newPassword !== confirmPassword) {
                                        addToast({ type: 'error', message: 'Passwords do not match' });
                                        return;
                                    }
                                    setLoading(true);
                                    try {
                                        const r = await fetch(getApiUrl('/api/v1/auth/reset-password'), {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ token, new_password: newPassword }),
                                        });
                                        if (r.ok) {
                                            addToast({ type: 'success', message: 'Password reset successful' });
                                            onClose();
                                        } else {
                                            const d = await r.json().catch(() => null);
                                            addToast({ type: 'error', message: d?.detail || 'Reset failed' });
                                        }
                                    } catch (err) {
                                        addToast({ type: 'error', message: 'Network error' });
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="px-4 py-2 bg-primary-600 text-white rounded"
                            >
                                {loading ? 'Resetting...' : 'Reset password'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Authenticated flow: verify current password then change */}
                {step === 'verify' && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Enter your current password and your new password below.</p>
                        <input type="password" placeholder="Current password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border rounded mb-2" />
                        <input type="password" placeholder="New password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border rounded mb-2" />
                        <input type="password" placeholder="Confirm new password" value={token || ''} onChange={(e) => setToken(e.target.value)} className="w-full px-3 py-2 border rounded mb-2" />
                        <div className="flex justify-end">
                            <button
                                type="button"
                                disabled={loading}
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        if (auth.token && auth.user) {
                                            // Authenticated flow: verify current then show change UI (existing behavior)
                                            const res = await fetch(getApiUrl('/api/v1/auth/verify-password'), {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${auth.token}`,
                                                },
                                                body: JSON.stringify({ current_password: newPassword }),
                                            });
                                            if (res.ok) {
                                                addToast({ type: 'success', message: 'Password verified — enter a new password below' });
                                                setStep('reset');
                                                setToken(null);
                                                setNewPassword('');
                                                setConfirmPassword('');
                                                return;
                                            } else {
                                                const d = await res.json().catch(() => null);
                                                addToast({ type: 'error', message: d?.detail || 'Incorrect password' });
                                                return;
                                            }
                                        }

                                        // Unauthenticated combined flow: call change-password-by-email
                                        if (!email) {
                                            addToast({ type: 'error', message: 'Email required' });
                                            return;
                                        }
                                        if (!newPassword || !confirmPassword || !token) {
                                            addToast({ type: 'error', message: 'Please fill current, new and confirm password fields' });
                                            return;
                                        }
                                        if (confirmPassword.length < 8) {
                                            addToast({ type: 'error', message: 'Password must be at least 8 characters' });
                                            return;
                                        }
                                        if (confirmPassword !== token) {
                                            addToast({ type: 'error', message: 'Passwords do not match' });
                                            return;
                                        }

                                        const r = await fetch(getApiUrl('/api/v1/auth/change-password-by-email'), {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ email, current_password: newPassword, new_password: confirmPassword }),
                                        });
                                        if (r.ok) {
                                            addToast({ type: 'success', message: 'Password changed successfully' });
                                            onClose();
                                        } else {
                                            const d = await r.json().catch(() => null);
                                            addToast({ type: 'error', message: d?.detail || 'Change failed' });
                                        }
                                    } catch (err) {
                                        addToast({ type: 'error', message: 'Network error' });
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="px-4 py-2 bg-primary-600 text-white rounded"
                            >
                                {loading ? (auth.token ? 'Verifying...' : 'Processing...') : (auth.token ? 'Proceed' : 'Proceed')}
                            </button>
                        </div>
                    </div>
                )}

                {/* When in reset step for authenticated users (no token), call change-password endpoint */}
                {step === 'reset' && !token && auth.token && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Enter your new password.</p>
                        <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border rounded mb-2" />
                        <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border rounded mb-2" />
                        <div className="flex justify-end">
                            <button
                                type="button"
                                disabled={loading}
                                onClick={async () => {
                                    if (newPassword.length < 8) {
                                        addToast({ type: 'error', message: 'Password must be at least 8 characters' });
                                        return;
                                    }
                                    if (newPassword !== confirmPassword) {
                                        addToast({ type: 'error', message: 'Passwords do not match' });
                                        return;
                                    }
                                    setLoading(true);
                                    try {
                                        const r = await fetch(getApiUrl('/api/v1/auth/change-password'), {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
                                            body: JSON.stringify({ new_password: newPassword }),
                                        });
                                        if (r.ok) {
                                            addToast({ type: 'success', message: 'Password changed successfully' });
                                            onClose();
                                        } else {
                                            const d = await r.json().catch(() => null);
                                            addToast({ type: 'error', message: d?.detail || 'Change failed' });
                                        }
                                    } catch (err) {
                                        addToast({ type: 'error', message: 'Network error' });
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="px-4 py-2 bg-primary-600 text-white rounded"
                            >
                                {loading ? 'Changing...' : 'Change password'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    if (typeof document === 'undefined') return null;
    return createPortal(modalContent, document.body);
};

export default ForgotPasswordModal;
