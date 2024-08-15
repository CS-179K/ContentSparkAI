import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button, Input, Card, Space, message } from "antd";
import axios from "axios";
import DynamicResponse from "../DynamicResponse/DynamicResponse";

const { TextArea } = Input;

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const PromptPanel = ({
  filters,
  onStepComplete,
  tutorialStep,
  isTutorialActive,
}) => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const constructPrompt = (userPrompt, selectedFilters) => {
    const ageRangeString = selectedFilters.ageRange
      ? `${selectedFilters.ageRange} years old`
      : "all age groups";
    return `
      You are an expert content creator specializing in ${
        selectedFilters.contentType || "various types of content"
      }.
      Task: Create content based on the following prompt: "${
        userPrompt || "check below description"
      }"
      Context: The content is for the ${
        selectedFilters.industry || "general"
      } industry, 
               targeting  ${ageRangeString}
               with interests in ${
                 selectedFilters.interests
                   ? selectedFilters.interests.join(", ")
                   : "various topics"
               }.
      Additional details: We are targeting ${
        selectedFilters.contentType || "content"
      } for ${selectedFilters.gender || "all"} gender, ${
      selectedFilters.income || "all"
    } income levels. Tone of the post should be ${
      selectedFilters.tone || "relevant to our requirement"
    }. Theme of our post should resemble ${
      selectedFilters.themes || selectedFilters.industry
    }. Goal of this ${selectedFilters.contentType || ""} content will be ${
      selectedFilters.contentGoal || "as per our requirement"
    }. You response should be of ${
      selectedFilters.maxContentLength || "any"
    } length and of ${selectedFilters.language || "English"} language.
      Format: Provide the content in a clear, structured manner suitable for ${
        selectedFilters.contentType || "general use"
      }.
      
      Please focus solely on generating the requested content without any additional explanations or meta-commentary.
    `;
  };

  const handleSubmit = async (isFavourite = false) => {
    if (isFavourite) {
      setIsSaving(true);
    } else {
      setIsGenerating(true);
    }
    try {
      let generatedText, selectedFilters;
      if (!isFavourite) {
        selectedFilters = Object.fromEntries(
          Object.entries(filters).filter(
            ([_, value]) => value !== undefined && value !== ""
          )
        );

        const fullPrompt = constructPrompt(prompt, selectedFilters);

        const result = await model.generateContent(fullPrompt);
        generatedText = result.response.text();
        setResponse(generatedText);
      }
      const url = isFavourite ? "save-favourite-content" : "save-content";
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/${url}`,
        { filters: selectedFilters, prompt, response: generatedText },
        {
          withCredentials: true,
        }
      );
      if (isFavourite) {
        message.success(response.data);
      }
      if (isTutorialActive) {
        onStepComplete();
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setIsGenerating(false);
      setIsSaving(false);
    }
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handlePromptBlur = () => {
    if (isTutorialActive && tutorialStep === 2 && prompt.trim() !== "") {
      onStepComplete();
    }
  };

  return (
    <Card title="Content Generator">
      <TextArea
        rows={4}
        value={prompt}
        onChange={handlePromptChange}
        onBlur={handlePromptBlur}
        placeholder="Additional details you would like to add..."
        style={{
          resize: "none",
          border: "1px solid #424242",
          background: "#141414",
          color: "rgba(255, 255, 255, 0.85)",
          borderRadius: "6px",
        }}
        data-tutorial="prompt"
        disabled={isTutorialActive && tutorialStep !== 2}
      />
      <Space style={{ marginTop: "16px" }}>
        <Button
          type="primary"
          onClick={() => handleSubmit(false)}
          loading={isGenerating}
          data-tutorial="generate"
          disabled={(isTutorialActive && tutorialStep !== 3) || !prompt}
        >
          Generate Content
        </Button>
        <Button
          type="primary"
          onClick={() => handleSubmit(true)}
          loading={isSaving}
          disabled={!(response && !isGenerating) || !prompt}
          data-tutorial="mark-favourite"
        >
          Save Content to Favourites
        </Button>
      </Space>
      {response && (
        <div
          style={{
            maxHeight: "calc(100vh - 104px - 270px)",
            overflow: "auto",
            marginTop: "16px",
          }}
          data-tutorial="generated-content"
        >
          <h3>Generated Content:</h3>
          <DynamicResponse content={response} />
        </div>
      )}
    </Card>
  );
};

export default PromptPanel;
