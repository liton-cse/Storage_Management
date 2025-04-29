import React from "react";
import data from "../../assets/aboutData.json";
import "../../styles/ButtomNavigationStyle/TermsAndCondition.css";

function About() {
  // Function to format the text with paragraphs and lists
  const formatPolicyText = (text) => {
    return text.split("\n\n").map((paragraph, index) => {
      // Check if paragraph starts with a number (for numbered lists)
      if (/^\d+\./.test(paragraph)) {
        return (
          <div key={index} className="numbered-item">
            {paragraph}
          </div>
        );
      }
      // Regular paragraph
      return (
        <p key={index} className="policy-paragraph">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="privacy-area">
      <div className="privacy-container">
        <div className="privacy-header">
          <h1>About Us</h1>
        </div>
        <div className="privacy-content">{formatPolicyText(data.about)}</div>
      </div>
    </div>
  );
}

export default About;
