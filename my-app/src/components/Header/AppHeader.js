import React from "react";
import { Layout, Menu, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { HomeOutlined, HistoryOutlined, StarOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAuth } from "../Context/AuthContext";

const { Header } = Layout;

const AppHeader = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["home"]} style={{ flexGrow: 1 }}>
          <Menu.Item key="home" icon={<HomeOutlined />}>
            <Link to="/home">Home</Link>
          </Menu.Item>
          <Menu.Item key="history" icon={<HistoryOutlined />}>
            <Link to="/history">History</Link>
          </Menu.Item>
          <Menu.Item key="favourites" icon={<StarOutlined />}>
            <Link to="/favourites">Favourites</Link>
          </Menu.Item>
        </Menu>
      </div>
      <Button type="primary" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Button>
    </Header>
  );
};

export default AppHeader;