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
      const expirationTime = 3600000;
      await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token: credentialResponse?.credential,
          expirationTime,
        }),
      });
      login(decoded, expirationTime);
      navigate("/home");
    } catch (error) {
      console.error("Error decoding JWT:", error);
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