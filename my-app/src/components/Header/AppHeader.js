import React from "react";
import { Layout, Menu, Button } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  HistoryOutlined,
  StarOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAuth } from "../Context/AuthContext";

const { Header } = Layout;

const AppHeader = ({ isTutorialActive = false }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItemStyle = {
    cursor: isTutorialActive ? "not-allowed" : "pointer",
    opacity: isTutorialActive ? 0.5 : 1,
  };

  return (
    <Header
      className="header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          style={{ flexGrow: 1 }}
        >
          <Menu.Item key="/home" icon={<HomeOutlined />}>
            <Link to="/home">Home</Link>
          </Menu.Item>
          <Menu.Item
            key="/history"
            icon={<HistoryOutlined />}
            style={menuItemStyle}
            data-tutorial="history-tab"
          >
            {isTutorialActive ? (
              <span>History</span>
            ) : (
              <Link to="/history">History</Link>
            )}
          </Menu.Item>
          <Menu.Item
            key="/favourites"
            icon={<StarOutlined />}
            style={menuItemStyle}
            data-tutorial="favourites-tab"
          >
            {isTutorialActive ? (
              <span>Favourites</span>
            ) : (
              <Link to="/favourites">Favourites</Link>
            )}
          </Menu.Item>
        </Menu>
      </div>
      <Button
        type="primary"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        disabled={isTutorialActive}
      >
        Logout
      </Button>
    </Header>
  );
};

export default AppHeader;
