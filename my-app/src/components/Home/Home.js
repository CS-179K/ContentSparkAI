import { useState } from "react";
import { Row, Col } from "antd";
import FilterForm from "../Filter/FilterForm";
import PromptPanel from "../PromptPanel/PromptPanel";

const Home = () => {
  const [savedFilters, setSavedFilters] = useState(null);

  const handleSaveFilters = (filters, shouldSave) => {
    if (shouldSave) {
      // save to backend
    }
    setSavedFilters(filters);
  };

  const handleSubmit = (data) => {
    console.log("Submitted data:", data);
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