import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: number;
    email: string;
    full_name: string | null;
    is_active: boolean;
    created_at: string;
    country: string | null;
    country_selected: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    selectedCountry: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    selectCountry: (country: string) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token and country on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedCountry = localStorage.getItem('selectedCountry');

        if (savedCountry) {
            setSelectedCountry(savedCountry);
        }

        if (savedToken) {
            setToken(savedToken);
            // Optionally verify token with backend
            fetchUserProfile(savedToken);
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchUserProfile = async (authToken: string) => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/users/me', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);

                // Only auto-set country if user has completed country selection flow
                // Registration country doesn't count - only country selection flow does
                if (userData.country_selected === true && userData.country) {
                    setSelectedCountry(userData.country);
                    localStorage.setItem('selectedCountry', userData.country);
                }
            } else {
                // Token is invalid, remove it
                localStorage.removeItem('token');
                setToken(null);
            }
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            localStorage.removeItem('token');
            setToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                const { access_token } = data;

                setToken(access_token);
                localStorage.setItem('token', access_token);

                // Fetch user profile
                await fetchUserProfile(access_token);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setSelectedCountry(null);
        localStorage.removeItem('token');
        localStorage.removeItem('selectedCountry');

        // Redirect to homepage when logging out
        window.location.href = '/';
    };

    const selectCountry = async (country: string) => {
        setSelectedCountry(country);
        localStorage.setItem('selectedCountry', country);

        // Update user's country and mark country_selected as true in the database
        if (user && token) {
            try {
                const response = await fetch('http://localhost:8000/api/v1/users/me', {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        country: country,
                        country_selected: true
                    }),
                });

                if (response.ok) {
                    const updatedUser = await response.json();
                    setUser(updatedUser);
                }
            } catch (error) {
                console.error('Failed to update user country:', error);
            }
        }
    };

    const value: AuthContextType = {
        user,
        token,
        selectedCountry,
        login,
        logout,
        selectCountry,
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
