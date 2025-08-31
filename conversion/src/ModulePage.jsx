import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaKeyboard, FaHands, FaHandPaper, FaLanguage } from "react-icons/fa";

export default function ModulePage() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="app-container">
      {loading ? (
        <div className="welcome-screen">
          <h1>Welcome</h1>
          <p>Connecting in ...</p>
        </div>
      ) : (
        <div className="module-screen">
          <h1>Choose a Module</h1>
          <div className="modules">
            <div className="module-card" onClick={() => navigate("/text-to-sign")}>
              <FaKeyboard className="module-icon" />
              <h2>Text → Sign Language</h2>
              <p>Convert typed text into animated sign language</p>
            </div>
            <div className="module-card" onClick={() => navigate("/sign-to-text")}>
              <FaHands className="module-icon" />
              <h2>Sign → Text Language</h2>
              <p>Recognize hand signs and convert them into text</p>
            </div>
         
            <div className="module-card" onClick={() => navigate("/translator")}>
              <FaLanguage className="module-icon" />
              <h2>Language Translator</h2>
              <p>Translate between different languages and sign systems</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
