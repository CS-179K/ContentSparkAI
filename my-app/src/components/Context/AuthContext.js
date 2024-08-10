import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const auth = localStorage.getItem('isAuthenticated');
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const tokenExpiration = localStorage.getItem('tokenExpiration');
            
            if (auth === 'true' && tokenExpiration && new Date(parseInt(tokenExpiration)) > new Date()) {
                setIsAuthenticated(true);
                setUser(storedUser);
            } else {
                logout();
            }
            setIsLoading(false);
        };

        checkAuth();
        const intervalId = setInterval(checkAuth, 60000); // Check every minute

        return () => clearInterval(intervalId);
    }, []);

    const login = (userData, expirationTime) => {
        const tokenExpiration = new Date().getTime() + expirationTime;
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('tokenExpiration', tokenExpiration.toString());
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiration');
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext) || {};