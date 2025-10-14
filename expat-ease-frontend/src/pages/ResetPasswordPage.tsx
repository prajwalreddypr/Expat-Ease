import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getApiUrl } from '../utils/api';
import { useToast } from '../components/Toast';

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            addToast({ type: 'error', message: 'Missing reset token' });
            navigate('/');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            addToast({ type: 'error', message: 'Passwords do not match' });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(getApiUrl('/api/v1/auth/reset-password'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: password }),
            });
            if (res.ok) {
                addToast({ type: 'success', message: 'Password reset successful. Please log in.' });
                navigate('/');
            } else {
                const data = await res.json().catch(() => null);
                addToast({ type: 'error', message: data?.detail || 'Reset failed' });
            }
        } catch (err) {
            addToast({ type: 'error', message: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-lg border border-gray-200 shadow">
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Reset your password</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            placeholder="New password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-3 border rounded bg-gray-50"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Confirm password"
                            required
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="w-full px-3 py-3 border rounded bg-gray-50"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded">
                            {loading ? 'Resetting...' : 'Reset password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
