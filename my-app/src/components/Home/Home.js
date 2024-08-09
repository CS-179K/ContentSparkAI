import { useState } from "react";
import { Row, Col,Button } from "antd";
import FilterForm from "../Filter/FilterForm";
import PromptPanel from "../PromptPanel/PromptPanel";
import { useAuth } from '../Context/AuthContext'; 
import { useNavigate } from 'react-router-dom';


const Home = () => {
  const [savedFilters, setSavedFilters] = useState(null);

  const { setIsAuthenticated } = useAuth(); // Use useAuth hook at the top level
  const navigate = useNavigate(); // Use useNavigate hook at the top level

  const handleSaveFilters = (filters, shouldSave) => {
    if(shouldSave) {
      // save to backend
    }
    setSavedFilters(filters);
  };

  const handleSubmit = (data) => {
    console.log("Submitted data:", data);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated'); // Clear authenticated flag from localStorage
    setIsAuthenticated(false); // Update context or local state
    navigate('/'); // Navigate to the login page or landing page
    console.log("User logged out");
  };

  return (
    <>
      <Row justify="space-between" align="middle" style={{ padding: "20px" }}>
        <Col>
          <h2>Welcome to ContentSparkAI</h2>
        </Col>
        <Col>
          <Button type="primary" onClick={handleLogout}>
            Logout
          </Button>
        </Col>
      </Row>
    <Row gutter={16} style={{ padding: "20px" }}>
      <Col span={12}>
        <FilterForm onSave={handleSaveFilters} onChange={handleSaveFilters} />
      </Col>
      <Col span={12}>
        <PromptPanel filters={savedFilters} onSubmit={handleSubmit} />
      </Col>
    </Row>
   </>
  );
};

export default Home;
