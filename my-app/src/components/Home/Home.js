import React, { useState, useEffect } from "react";
import { Row, Col, message } from "antd";
import axios from "axios";
import FilterForm from "../Filter/FilterForm";
import PromptPanel from "../PromptPanel/PromptPanel";
import Tutorial from "../Tutorial/Tutorial";
import AppHeader from "../Header/AppHeader";

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
    try {
      setSavedFilters((prevFilters) => ({
        ...prevFilters,
        ...filters,
      }));
      if (shouldSave) {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/saveFilter1`,
          filters
        );
        message.success(response.data);
        if (isTutorialActive) {
          handleTutorialNext();
        }
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleContentSubmit = async (data, isFavourite) => {
    try {
      const url = isFavourite ? "save-favourite-content" : "save-content";
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/${url}`,
        data
      );
      if (isFavourite) {
        message.success(response.data);
      }
      if (isTutorialActive) {
        handleTutorialNext();
      }
    } catch (error) {
      message.error("Failed to save content. Please try again.");
    }
  };

  const handleTutorialComplete = () => {
    setIsFirstTimeUser(false);
    setIsTutorialActive(false);
    localStorage.setItem("tutorialCompleted", "true");
  };

  const handleTutorialNext = () => {
    setTutorialStep((prevStep) => prevStep + 1);
  };

  return (
    <>
      <AppHeader isTutorialActive={isTutorialActive} />
      <Row
        gutter={16}
        style={{
          padding: "20px",
          placeItems: "flex-start",
        }}
      >
        <Col span={12}>
          <FilterForm
            onSave={handleSaveFilters}
            onChange={handleSaveFilters}
            onStepComplete={handleTutorialNext}
            tutorialStep={tutorialStep}
            isTutorialActive={isTutorialActive}
          />
        </Col>
        <Col span={12}>
          <PromptPanel
            filters={savedFilters}
            onSubmit={handleContentSubmit}
            onStepComplete={handleTutorialNext}
            tutorialStep={tutorialStep}
            isTutorialActive={isTutorialActive}
          />
        </Col>
      </Row>
      {isTutorialActive && (
        <Tutorial
          isFirstTimeUser={isFirstTimeUser}
          onComplete={handleTutorialComplete}
          onNext={handleTutorialNext}
          currentStep={tutorialStep}
        />
      )}
    </>
  );
};

export default Home;
