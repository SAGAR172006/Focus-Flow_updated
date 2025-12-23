// backend/src/routes/analyze.routes.js

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

router.use(protect);

// POST /api/analyze
router.post("/", async (req, res) => {
  const { text, type = "summary" } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ message: "No text provided" });
  }

  try {
    let systemPrompt = "";
    if (type === "summary") {
      systemPrompt =
        "You are a professional document summarizer. Provide clear, concise summaries that capture the key points and main ideas. Format your response in bullet points for easy reading.";
    } else if (type === "keypoints") {
      systemPrompt =
        "You are an expert at extracting key information. List the most important points, facts, and takeaways from the document in a numbered list.";
    } else if (type === "action") {
      systemPrompt =
        "You are a productivity assistant. Extract and list any action items, tasks, or next steps mentioned in the document.";
    }

    const fullPrompt = `${systemPrompt}\n\nHere is the document:\n\n${text}`;

    console.log("Calling Gemini API for document analysis...");
    
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const summary = response.text();

    if (!summary) {
      throw new Error("No summary generated");
    }

    console.log("Document analysis completed successfully");
    res.status(200).json({ summary });

  } catch (error) {
    console.error("Error in analyze function:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

module.exports = router;