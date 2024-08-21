import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";
import { useAuth } from "../Context/AuthContext";

const RedditOAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { api } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (code) {
      exchangeCodeForToken(code);
    } else if (error) {
      message.error("Reddit authorization failed: " + error);
      navigate("/cms");
    }
  }, [location]);

  const exchangeCodeForToken = async (code) => {
    try {
      const response = await api.post("/reddit-callback", { code });
      if (response.data.success) {
        message.success("Reddit account linked successfully");
      } else {
        message.error("Failed to link Reddit account");
      }
    } catch (error) {
      console.error("Error linking Reddit account:", error);
      message.error("An error occurred while linking Reddit account");
    } finally {
      navigate("/cms");
    }
  };

  return <div>Linking your Reddit account...</div>;
};

export default RedditOAuth;
