import React, { useEffect, useState } from "react";
import axios from "axios";
import { FixedSizeList as List } from "react-window";
import DynamicResponse from "../DynamicResponse/DynamicResponse";
import AppHeader from "../Header/AppHeader";

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/get-history`, {
      withCredentials: true, // Include cookies in the request
    })
      .then(response => {
        console.log(response.data); // Log the fetched data to ensure it's correct
        setHistory(response.data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Helper function to format the filters as a list with each filter on a new line
  const formatFilters = (filters) => {
    return Object.entries(filters)
      .filter(([key, value]) => value && typeof value === "string")
      .map(([key, value]) => (
        <div
          key={key}
          style={{ whiteSpace: "pre-wrap" }}
        >{`${key}: ${value}`}</div>
      ));
  };

  // Helper function to format the prompt as bullet points with each bullet on a new line
  const formatPrompt = (prompt) => {
    return prompt.split("\n").map((item, index) => (
      <li key={index} style={{ listStyleType: "disc", marginBottom: "5px" }}>
        {item}
      </li>
    ));
  };

  const Row = ({ index, style }) => (
    <div
      style={{
        ...style,
        display: "flex",
        borderBottom: "1px solid white",
        color: "white",
      }}
    >
      <div style={{ width: "15%", padding: "10px" }}>{history[index]._id}</div>
      <div style={{ width: "25%", padding: "10px" }}>
        {formatFilters(history[index].filters)}
      </div>
      <div style={{ width: "30%", padding: "10px" }}>
        <ul style={{ paddingLeft: "20px", margin: 0 }}>
          {formatPrompt(history[index].prompt)}
        </ul>
      </div>
      <div style={{ width: "30%", padding: "10px", overflowX: "auto" }}>
        <DynamicResponse content={history[index].response} />{" "}
        {/* Render the response using DynamicResponse */}
      </div>
    </div>
  );

  return (
    <>
      <AppHeader />
      <div className="hstry-container">
        <div
          style={{
            display: "flex",
            borderBottom: "2px solid white",
            color: "white",
            fontWeight: "bold",
          }}
        >
          <div style={{ width: "15%", padding: "10px" }}>Content ID</div>
          <div style={{ width: "25%", padding: "10px" }}>Filters</div>
          <div style={{ width: "30%", padding: "10px" }}>Prompt</div>
          <div style={{ width: "30%", padding: "10px" }}>Response</div>
        </div>
        <List
          height={400} // Adjust the height as needed
          itemCount={history.length}
          itemSize={120} // Adjusted height of each row to accommodate content
          width={"100%"}
        >
          {Row}
        </List>
      </div>
    </>
  );
};

export default History;
