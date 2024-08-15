import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";
import logo from "../../assets/logo.jpeg";

const Login = () => {
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse?.credential);
      console.log("Google Login Success:", decoded);
      const expirationTime = 3600000; // 1 hour

      const response = await fetch("http://localhost:5005/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify({
          token: credentialResponse?.credential,
          expirationTime,
        }),
      });

      if (response.ok) {
        login(decoded, expirationTime); // Store user details in context or state
        navigate("/home");
      } else {
        throw new Error("Failed to login");
      }
    } catch (error) {
      console.error("Error during login:", error);
      handleGoogleFailure();
    }
  };

  const handleGoogleFailure = (error) => {
    console.error("Google Login Failed:", error);
    logout();
  };

  return (
    <div className="login-container">
      <div className="signin-box">
        <img src={logo} alt="ContentSparkAI Logo" />
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
