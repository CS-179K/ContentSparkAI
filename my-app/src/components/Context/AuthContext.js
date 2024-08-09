import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    

    useEffect(() => {
        const auth = localStorage.getItem('isAuthenticated');
        const storedUser = JSON.parse(localStorage.getItem('user'));
        // const tokenExpiration = localStorage.getItem('tokenExpiration');
        if (auth === 'true') {//&& new Date(tokenExpiration) > new Date()
            setIsAuthenticated(true); // Set isAuthenticated based on localStorage
            // Optionally, you can retrieve and set user data from localStorage as well
            setUser(storedUser);
        }else {
            logout();
        }
    }, []);

    const login = (userData) => {
        // const tokenExpiration = new Date().getTime() + expirationTime;
        setIsAuthenticated(true);
        setUser(userData); // Set user data upon successful login
        localStorage.setItem('isAuthenticated', 'true'); // Persist authentication state
        localStorage.setItem('user', JSON.stringify(userData)); // Optionally store user data
        // localStorage.setItem('tokenExpiration', tokenExpiration);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null); // Clear user data on logout
        localStorage.removeItem('isAuthenticated'); // Clear authentication state
        localStorage.removeItem('user'); // Optionally clear user data
        // localStorage.removeItem('tokenExpiration');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout ,setIsAuthenticated}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);