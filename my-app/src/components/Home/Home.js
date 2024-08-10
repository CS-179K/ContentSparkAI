import { useState } from "react";
import { Row, Col } from "antd";
import axios from "axios";
import FilterForm from "../Filter/FilterForm";
import PromptPanel from "../PromptPanel/PromptPanel";

const Home = () => {
  const [savedFilters, setSavedFilters] = useState(null);

  const handleSaveFilters = async (filters, shouldSave) => {
    try {
      if(shouldSave) {
        const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/saveFilter`, filters);
        console.log("Filter saved successfully:", response.data);
      }
      setSavedFilters(filters);
    } catch (error) {
      console.error("There was an error saving the data!", error);
    }
  };

  const handleSubmit = async (data) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/save-content`, data);
      console.log("Data saved successfully:", response.data);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <>
      <Row gutter={16} style={{ padding: "20px", placeItems: "flex-start" }}>
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