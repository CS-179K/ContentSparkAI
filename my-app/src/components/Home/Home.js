import { useState, useEffect } from "react";
import { Row, Col } from "antd";
import axios from "axios";
import FilterForm from "../Filter/FilterForm";
import PromptPanel from "../PromptPanel/PromptPanel";

const Home = () => {
  const [savedFilters, setSavedFilters] = useState({});
  const [generatedContent, setGeneratedContent] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const filtersResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/get-filters`, {
          withCredentials: true,
        });
        setSavedFilters(filtersResponse.data);

        const contentResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/get-history`, {
          withCredentials: true,
        });
        setGeneratedContent(contentResponse.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveFilters = async (filters, shouldSave) => {
    try {
      setSavedFilters(prevFilters => ({
        ...prevFilters,
        ...filters
      }));
      if (shouldSave) {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/save-filter`,
          filters,
          {
            withCredentials: true, // Include cookies in the request
          }
        );
        console.log("Filter saved successfully:", response.data);
      }
    } catch (error) {
      console.error("There was an error saving the data!", error);
    }
  };

  const handleSubmit = async (data) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/save-content`,
        data,
        {
          withCredentials: true, // Include cookies in the request
        }
      );
      console.log("Data saved successfully:", response.data);
      setGeneratedContent(prevContent => [...prevContent, response.data]); // Add new content to the list
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
          <div>
            <h2>Generated Content History</h2>
            {generatedContent.map((content, index) => (
              <div key={index}>
                <h3>{content.prompt}</h3>
                <p>{content.response}</p>
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </>
  );
};

export default Home;
