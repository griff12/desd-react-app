import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import "./Welcome.css";
import reading from "../../assets/images/reading-silhouette.png";
import dyslexia from "../../assets/images/dyslexia-silhouette.jpg";
import path from "../../assets/images/path-silhouette.png";

export default function Welcome() {
  const navigate = useNavigate();

  const beginTest = () => {
    navigate("/test-selection");
  };

  return (
    <div>
      <div className="welcome-container">
        <div className="text-container">
          <div className="text-content">
            <h1 className="banner-h1">Online Dyslexia Test</h1>
            <p className="banner-p">
              Assess your specific reading difficulties, detect dyslexia risk,
              and identify areas for improvement.
            </p>
            <button onClick={beginTest}>Begin Test</button>
          </div>
        </div>
        <div className="banner-section"></div>
      </div>
      <div className="test-info">
        <div className="test-info-header">What You Will Get</div>
        <Card imageSrc={reading} title="Reading Level" />
        <Card imageSrc={dyslexia} title="Dyslexia Subtype" />
        <Card imageSrc={path} title="Pathway Forward" />
      </div>
    </div>
  );
}
