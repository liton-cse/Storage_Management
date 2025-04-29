import React from "react";
import data from "../../assets/privacyData.json";
import "../../styles/ButtomNavigationStyle/TermsAndCondition.css";

function PrivacyPolicy() {
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
          <h1>Privacy policy</h1>
        </div>
        <div className="privacy-content">{formatPolicyText(data.privacy)}</div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
