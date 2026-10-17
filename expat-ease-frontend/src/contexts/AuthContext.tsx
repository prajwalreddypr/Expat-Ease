import React, { type ReactNode } from 'react';
import { useAuthSession } from '../hooks/useAuthSession';
import { AuthContext } from './auth-context';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const value = useAuthSession();

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
