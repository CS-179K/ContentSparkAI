import { useState, useEffect } from "react";
import { Row, Col } from "antd";
import axios from "axios";
import FilterForm from "../Filter/FilterForm";
import PromptPanel from "../PromptPanel/PromptPanel";
import Tutorial from "../Tutorial/Tutorial";

const Home = () => {
  const [savedFilters, setSavedFilters] = useState({});
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isTutorialActive, setIsTutorialActive] = useState(true);

  useEffect(() => {
    const tutorialCompleted = localStorage.getItem("tutorialCompleted");
    setIsFirstTimeUser(!tutorialCompleted);
    setIsTutorialActive(!tutorialCompleted);
  }, []);

  const handleSaveFilters = async (filters, shouldSave) => {
    if (isTutorialActive) return;
    try {
      setSavedFilters((prevFilters) => ({
        ...prevFilters,
        ...filters,
      }));
      if (shouldSave) {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/saveFilter`,
          filters
        );
        console.log("Filter saved successfully:", response.data);
      }
    } catch (error) {
      console.error("There was an error saving the data!", error);
    }
  };

  const handleSubmit = async (data) => {
    if (isTutorialActive) return;
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/save-content`,
        data
      );
      console.log("Data saved successfully:", response.data);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleTutorialComplete = () => {
    setIsFirstTimeUser(false);
    setIsTutorialActive(false);
    localStorage.setItem("tutorialCompleted", "true");
  };

  const handleTutorialSkip = () => {
    setIsFirstTimeUser(false);
    setIsTutorialActive(false);
    localStorage.setItem("tutorialCompleted", "true");
  };

  const handleTutorialStepComplete = () => {
    setTutorialStep((prevStep) => prevStep + 1);
  };

  return (
    <>
      <Row
        gutter={16}
        style={{
          padding: "20px",
          placeItems: "flex-start",
          pointerEvents: isTutorialActive ? "none" : "auto",
        }}
      >
        <Col span={12}>
          <FilterForm
            onSave={handleSaveFilters}
            onChange={handleSaveFilters}
            onStepComplete={handleTutorialStepComplete}
            tutorialStep={tutorialStep}
            isTutorialActive={isTutorialActive}
          />
        </Col>
        <Col span={12}>
          <PromptPanel
            filters={savedFilters}
            onSubmit={handleSubmit}
            onStepComplete={handleTutorialStepComplete}
            tutorialStep={tutorialStep}
            isTutorialActive={isTutorialActive}
          />
        </Col>
      </Row>
      {isTutorialActive && (
        <Tutorial
          isFirstTimeUser={isFirstTimeUser}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
          currentStep={tutorialStep}
        />
      )}
    </>
  );
};

export default Home;
