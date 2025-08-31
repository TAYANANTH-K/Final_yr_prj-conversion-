import { useMemo, useRef, useState } from "react";
import { FaPlay, FaStop, FaLanguage, FaExchangeAlt } from "react-icons/fa";

// Basic English “gloss” words we pretend to have signs for
const knownSigns = new Set([
  "hello", "thank", "you", "thankyou", "good", "morning", "evening",
  "yes", "no", "please", "sorry"
]);

// --- API call to our backend translation service ---
async function fetchTranslation(text, src) {
  const lang = src === "ta" ? "ta" : src === "hi" ? "hi" : "en";
  try {
    const resp = await fetch("http://localhost:5000/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: lang,
        target: "en", // always convert to English for sign animation
        format: "text"
      }),
    });
    const data = await resp.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data?.translatedText ?? text;
  } catch (e) {
    console.error("Translation API error", e);
    return text;
  }
}

// Convert English text to animation frames
function toSignFrames(english) {
  const tokens = english
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean);

  const frames = [];
  for (const word of tokens) {
    if (knownSigns.has(word) || knownSigns.has(word.replace(/\s+/g, ""))) {
      frames.push({ kind: "word", label: word.toUpperCase() });
    } else {
      for (const ch of word.split("")) {
        frames.push({ kind: "letter", label: ch.toUpperCase() });
      }
      frames.push({ kind: "spacer", label: "•" });
    }
  }
  return frames.length ? frames : [{ kind: "spacer", label: "…" }];
}

export default function TextToSign() {
  const [sourceLang, setSourceLang] = useState("en");
  const [userText, setUserText] = useState("");
  const [englishText, setEnglishText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [speedMs, setSpeedMs] = useState(700);
  const [frameIndex, setFrameIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [translationError, setTranslationError] = useState("");

  const frames = useMemo(() => toSignFrames(englishText), [englishText]);
  const timerRef = useRef(null);

  // Main Translate Handler
  async function handleTranslate() {
    if (!userText.trim()) return;
    setLoading(true);
    setTranslationError("");
    
    try {
      const eng = await fetchTranslation(userText, sourceLang);
      setEnglishText(eng);
      stopAnim();
      setFrameIndex(0);
    } catch (error) {
      setTranslationError("Translation failed. Please try again.");
      console.error("Translation error:", error);
    } finally {
      setLoading(false);
    }
  }

  function startAnim() {
    if (!englishText) return;
    stopAnim();
    setIsAnimating(true);
    timerRef.current = setInterval(() => {
      setFrameIndex((i) => (i + 1) % frames.length);
    }, speedMs);
  }

  function stopAnim() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setIsAnimating(false);
  }

  return (
    <div className="page">
      {/* LEFT: Input + translate + animate controls */}
      <div className="leftPane">
        <div className="panelHeader">
          <FaLanguage /> <span>User Text</span>
        </div>

        <div className="row">
          <label htmlFor="lang">Language</label>
          <select
            id="lang"
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
          >
            <option value="en">English</option>
            <option value="ta">Tamil</option>
            <option value="hi">Hindi</option>
          </select>
        </div>

        <textarea
          className="textArea"
          placeholder={
            sourceLang === "en"
              ? "Type your message in English..."
              : sourceLang === "ta"
              ? "தமிழில் எழுதவும்…"
              : "हिंदी में लिखें…"
          }
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          rows={6}
        />

        <div className="buttons">
          <button className="btn primary" onClick={handleTranslate} disabled={loading}>
            <FaExchangeAlt /> {loading ? "Translating..." : "Translate to English"}
          </button>
        </div>

        {translationError && (
          <div className="error-message">
            ❌ {translationError}
          </div>
        )}

        <div className="convertedBox">
          <div className="panelHeader small">
            <FaLanguage /> <span>Converted (English)</span>
          </div>
          <div className="convertedText">{englishText || "—"}</div>
        </div>

        <div className="animControls">
          <label>Animation speed (ms per frame)</label>
          <input
            type="range"
            min="300"
            max="1500"
            value={speedMs}
            onChange={(e) => setSpeedMs(Number(e.target.value))}
          />
          <div className="buttons">
            <button className="btn success" onClick={startAnim} disabled={!englishText || isAnimating}>
              <FaPlay /> Animate
            </button>
            <button className="btn danger" onClick={stopAnim} disabled={!isAnimating}>
              <FaStop /> Stop
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Animation viewer */}
      <div className="rightPane">
        <div className="viewer">
          <div className="viewerHeader">Sign Animation</div>
          <div className="viewerStage">
            <div
              className={`frame ${frames[frameIndex]?.kind === "letter" ? "letter" : ""}`}
              key={frameIndex}
            >
              {frames[frameIndex]?.label || "—"}
            </div>
          </div>
          <div className="viewerMeta">
            {englishText
              ? `Frame ${frames.length ? frameIndex + 1 : 0}/${frames.length}`
              : "Translate text to start animation"}
          </div>
        </div>
      </div>
    </div>
  );
}
