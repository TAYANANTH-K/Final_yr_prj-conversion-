import React, { useState } from "react";
import axios from "axios";
import "./Translator.css";

export default function Translator() {
  const [text, setText] = useState("");
  const [translated, setTranslated] = useState("");
  const [lang, setLang] = useState("en"); // default English
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const translateText = async () => {
    if (!text.trim()) {
      setError("Please enter some text to translate");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      const res = await axios.post("http://localhost:5000/translate", {
        q: text,
        source: "auto",
        target: lang,
      });
      setTranslated(res.data.translatedText);
    } catch (err) {
      console.error("Translation error:", err);
      let errorMessage = "❌ Translation failed. ";
      
      if (err.response) {
        // Server responded with error
        if (err.response.data && err.response.data.error) {
          errorMessage += err.response.data.error;
        } else {
          errorMessage += `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage += "No response from server. Please make sure the backend is running on port 5000.";
      } else {
        // Something else happened
        errorMessage += err.message || "Unknown error occurred.";
      }
      
      setError(errorMessage);
      setTranslated("");
    } finally {
      setIsLoading(false);
    }
  };

  const clearText = () => {
    setText("");
    setTranslated("");
    setError("");
  };

  return (
    <div className="translator-container">
      <div className="translator-card">
        <h2 className="translator-title">🌐 Text Translator</h2>
        
        <div className="input-section">
          <label htmlFor="text-input">Enter text to translate:</label>
          <textarea
            id="text-input"
            rows="4"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text here..."
            className="text-input"
          />
        </div>

        <div className="controls-section">
          <div className="language-selector">
            <label htmlFor="lang-select">Target language:</label>
            <select 
              id="lang-select"
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="lang-select"
            >
              <option value="en">English</option>
              <option value="ta">Tamil</option>
              <option value="hi">Hindi</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
            </select>
          </div>

          <div className="button-group">
            <button 
              onClick={translateText} 
              disabled={isLoading || !text.trim()}
              className="translate-btn"
            >
              {isLoading ? "Translating..." : "Translate"}
            </button>
            <button onClick={clearText} className="clear-btn">
              Clear
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {translated && (
          <div className="output-section">
            <h3>Translation:</h3>
            <div className="translated-text">
              {translated}
            </div>
          </div>
        )}

        <div className="instructions">
          <p><strong>Instructions:</strong></p>
          <ol>
            <li>Enter text in the textarea above</li>
            <li>Select your target language</li>
            <li>Click "Translate" to get the translation</li>
            <li>Make sure the backend server is running on port 5000</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
