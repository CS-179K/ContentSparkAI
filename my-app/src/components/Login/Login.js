import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext'; // Ensure this path is correct
// import jwtDecode from 'jwt-decode'; // Adjusted import
import { jwtDecode } from 'jwt-decode';


import './style.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, logout } = useAuth(); // Use login and logout functions from AuthContext

    const handleGoogleSuccess = async(credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse?.credential);
            console.log('Google Login Success:', decoded);
            localStorage.setItem('isAuthenticated', 'true');
            login(decoded);  // Log the user in
            // Set expiration time (e.g., 1 hour)
            const expirationTime = 3600000; // 1 hour in milliseconds
            // Send the token to your server to set the HTTP-only cookie
            await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies in the request
                body: JSON.stringify({ token: credentialResponse?.credential, expirationTime }),
            });
            // Log the user in with expiration time
            login(decoded, expirationTime);
            navigate('/home', { replace: true });
            // navigate('/home');
        } catch (error) {
            console.error('Error decoding JWT:', error);
            handleGoogleFailure();
        }
    };

    const handleGoogleFailure = (error) => {
        console.error('Google Login Failed:', error);
        logout();  // Ensure the user is logged out on failure
    };

    return (
        <div className="container">
            <div className="signin-box">
                <h2>Sign in</h2>
                <div className="social-signin">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleFailure}
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;
