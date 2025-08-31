const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Translation route
app.post("/translate", async (req, res) => {
  try {
    const { q, source = "auto", target = "en" } = req.body;
    console.log("User request:", req.body);
    
    // Avoid sending if q is empty
    if (!q || !q.trim()) return res.status(400).json({ error: "Empty text" });
    
    // Use Google Translate API (more reliable)
    const googleTranslateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(q)}`;
    
    const response = await axios.get(googleTranslateUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log("Google Translate response:", response.data);
    
    // Extract translation from Google Translate response
    let translated = "";
    if (response.data && Array.isArray(response.data) && response.data[0]) {
      // Google Translate returns array format: [[["translated text", "original text", "source lang", "target lang"], ...]]
      translated = response.data[0].map(item => item[0]).join('');
    }
    
    if (!translated) {
      throw new Error("Failed to extract translation from response");
    }
    
    res.json({ translatedText: translated });
  } catch (error) {
    console.error("Translation API error:", error.message);
    
    // Fallback: try LibreTranslate as backup
    try {
      console.log("Trying LibreTranslate as fallback...");
      const response = await axios.post(
        "https://libretranslate.de/translate",
        { q, source, target, format: "text" },
        { 
          headers: { "Content-Type": "application/json" },
          timeout: 10000
        }
      );
      
      let translated = "";
      const data = response.data;
      
      if (typeof data === "string") {
        translated = data;
      } else if (data && typeof data === "object" && "translatedText" in data) {
        translated = data.translatedText;
      }
      
      if (translated) {
        res.json({ translatedText: translated });
        return;
      }
    } catch (fallbackError) {
      console.error("Fallback API also failed:", fallbackError.message);
    }
    
    res.status(500).json({ error: "Translation failed. Please try again later." });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`✅ Backend running on http://localhost:${PORT}`)
);
