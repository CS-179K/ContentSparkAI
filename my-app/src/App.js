import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";  // Added useLocation here
import { ConfigProvider, Layout, theme } from "antd";
import AppHeader from "./components/Header/AppHeader";
import Home from "./components/Home/Home";
import Login from './components/Login/Login';
import { GoogleOAuthProvider } from '@react-oauth/google';  
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './components/Context/AuthContext';
// import HandleGitHubCallback from './components/HandleGitHubCallback.js';


import "./App.css";

const { Content } = Layout;
const { darkAlgorithm } = theme;

function LayoutWithHeader({ children }) {
  const location = useLocation();  
  const showHeader = location.pathname !== '/';

  return (
    <Layout className="layout">
      {showHeader && <AppHeader />}
      <Content>{children}</Content>
    </Layout>
  );
}

function App() {
  return (
    <div className="App">
      <GoogleOAuthProvider clientId="338788410824-audobl19geerdblru2856a9p1e33ud0o.apps.googleusercontent.com">
        <AuthProvider>
        <Router>
          <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
            <Routes>
              <Route path="/" element={<Login />} />
              {/* <Route path="/github-callback" element={<HandleGitHubCallback />} /> */}
              
              <Route path="/home" element={
                <LayoutWithHeader>
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute></LayoutWithHeader>
                        } />           
            </Routes>
          </ConfigProvider>
        </Router>
        </AuthProvider>
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;
