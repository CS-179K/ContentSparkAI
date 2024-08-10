import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ConfigProvider, Layout, theme } from "antd";
import AppHeader from "./components/Header/AppHeader";
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import History from "./components/History/History";
import Favourites from "./components/Favourites/Favourites";
import { AuthProvider, useAuth } from "./components/Context/AuthContext";
import "./App.css";

const { Content } = Layout;
const { darkAlgorithm } = theme;
const googleClientId = process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID;

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <AppHeader />
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <AppHeader />
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favourites"
        element={
          <ProtectedRoute>
            <AppHeader />
            <Favourites />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <Router>
            <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
              <Layout className="layout">
                <Content>
                  <AppRoutes />
                </Content>
              </Layout>
            </ConfigProvider>
          </Router>
        </AuthProvider>
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;