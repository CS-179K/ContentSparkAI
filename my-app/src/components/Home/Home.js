import React, { useState, useEffect } from "react";
import { Row, Col } from "antd";
import FilterForm from "../Filter/FilterForm";
import PromptPanel from "../PromptPanel/PromptPanel";
import Tutorial from "../Tutorial/Tutorial";
import AppHeader from "../Header/AppHeader";

const Home = () => {
  const [savedFilters, setSavedFilters] = useState({});
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isTutorialActive, setIsTutorialActive] = useState(false);

  useEffect(() => {
    const tutorialCompleted = localStorage.getItem("tutorialCompleted");
    setIsFirstTimeUser(!tutorialCompleted);
    setIsTutorialActive(!tutorialCompleted);
  }, []);

  const handleSaveFilters = async (filters) => {
    setSavedFilters((prevFilters) => ({
      ...prevFilters,
      ...filters,
    }));
  };

  const handleTutorialComplete = () => {
    setIsFirstTimeUser(false);
    setIsTutorialActive(false);
    localStorage.setItem("tutorialCompleted", "true");
  };

  const handleTutorialNext = () => {
    setTutorialStep((prevStep) => prevStep + 1);
  };

  const handleTutorialPrevious = () => {
    setTutorialStep((prevStep) => Math.max(0, prevStep - 1));
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
          onPrevious={handleTutorialPrevious}
          currentStep={tutorialStep}
        />
      )}
    </>
  );
};

export default Home;
