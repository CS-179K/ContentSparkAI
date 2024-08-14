import React, { useState, useEffect, useRef } from "react";
import { Button } from "antd";

const Tutorial = ({ isFirstTimeUser, onComplete, currentStep, onSkip }) => {
  const [visible, setVisible] = useState(isFirstTimeUser);
  const popupRef = useRef(null);

  const steps = [
    {
      target: '[data-tutorial="content-type"]',
      content:
        "Let's get started! First, click on the <b>'Type of Content'</b> dropdown and select the kind of content you want to create. This could be a blog post, ad campaign, social media post, or others.",
      position: "right",
    },
    {
      target: '[data-tutorial="industry"]',
      content:
        "Great! Now, let's specify your target industry. Click on the 'Industry/Category' dropdown and choose the most relevant option for your content. This helps tailor the output to your specific field.",
      position: "right",
    },
    {
      target: '[data-tutorial="prompt"]',
      content:
        "Perfect! Now it's time to add some details. In the text box, type any specific instructions or information you want to include in your content. Be as detailed as you like - the more information you provide, the better the results! Click on <b>'Generate Content'</b> after typing.",
      position: "left",
    },
    {
      target: '[data-tutorial="generate"]',
      content:
        "You're all set! Click the <b>'Generate Content'</b> button to create your AI-powered content based on your selections and input. Get ready to see the magic happen!",
      position: "left",
    },
  ];

  useEffect(() => {
    if (visible && currentStep < steps.length) {
      const targetElement = document.querySelector(steps[currentStep].target);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        highlightElement(targetElement);
        positionPopup(targetElement, steps[currentStep].position);
      }
    }
    return () => {
      steps.forEach((step) => {
        const el = document.querySelector(step.target);
        if (el) el.style.boxShadow = "none";
      });
    };
  }, [visible, currentStep]);

  useEffect(() => {
    if (currentStep >= steps.length) {
      setVisible(false);
      onComplete();
    }
  }, [currentStep, onComplete]);

  const highlightElement = (element) => {
    element.style.boxShadow = "0 0 0 5px rgba(24, 144, 255, 0.7)";
    element.style.zIndex = "1001";
    element.style.position = "relative";
    element.style.pointerEvents = "auto";
  };

  const positionPopup = (targetElement, position) => {
    if (popupRef.current && targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();

      if (position === "right") {
        popupRef.current.style.left = `${rect.right + 20}px`;
        popupRef.current.style.top = `${
          rect.top + rect.height / 2 - popupRect.height / 2
        }px`;
      } else {
        popupRef.current.style.left = `${rect.left - popupRect.width - 20}px`;
        popupRef.current.style.top = `${
          rect.top + rect.height / 2 - popupRect.height / 2
        }px`;
      }
    }
  };

  const handleSkip = () => {
    setVisible(false);
    onSkip();
  };

  if (!visible) return null;

  return (
    <div className="tutorial-overlay">
      <div className="main-overlay"></div>
      <div
        ref={popupRef}
        className={`tutorial-content ${steps[currentStep].position}`}
      >
        <h3>
          Step {currentStep + 1} of {steps.length}
        </h3>
        <p
          dangerouslySetInnerHTML={{ __html: steps[currentStep]?.content }}
        ></p>
        <Button type="primary" onClick={handleSkip}>
          Skip Tutorial
        </Button>
      </div>
      <style jsx>{`
        .tutorial-overlay .main-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          background-color: rgba(0, 0, 0, 0.9);
          pointer-events: auto;
        }
        .tutorial-content {
          background-color: white;
          color: black;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 300px;
          pointer-events: auto;
          z-index: 9999;
          position: fixed;
        }
        .tutorial-content::before {
          content: "";
          position: absolute;
          top: 50%;
          border: solid transparent;
          height: 0;
          width: 0;
          border-width: 10px;
          margin-top: -10px;
        }
        .tutorial-content.right::before {
          right: 100%;
          border-right-color: white;
        }
        .tutorial-content.left::before {
          left: 100%;
          border-left-color: white;
        }
      `}</style>
    </div>
  );
};

export default Tutorial;
