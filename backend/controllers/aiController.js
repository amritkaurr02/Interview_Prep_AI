// controllers/aiController.js
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const { questionAnswerPrompt, conceptExplainPrompt } = require("../utils/prompts");

// Initialize the GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Robustly parse the GenAI response:
 * 1. If structured JSON is available (response.parsed), return it.
 * 2. Else, fall back to response.text(), strip fences, and JSON.parse.
 */
// async function parseGenAIResponse(response) {
//   if (response.parsed) {
//     return response.parsed;
//   }
//   // Fallback to text
//   const raw = await response.text();
//   if (!raw) {
//     throw new Error("No content returned from AI");
//   }
//   // Strip triple-backtick fences if present
//   const fenced = raw.match(/^```(?:json)?\s*([\s\S]*?)```$/);
//   const jsonString = fenced ? fenced[1].trim() : raw.trim();
//   try {
//     return JSON.parse(jsonString);
//   } catch (err) {
//     throw new Error("Failed to parse AI output as JSON: " + err.message);
//   }
// }

// @desc Generate interview questions & answers
// @route POST /api/ai/generate-questions
// @access Private
const generateInterviewQuestions = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;
    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = questionAnswerPrompt(role, experience, topicsToFocus, numberOfQuestions);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",        // ✅ valid model name
      contents: prompt,                 // pass the single-prompt string
      
    });

    // const data = await parseGenAIResponse(response);
    // console.log("Response text: ", response.json)

    // const data = await parseGenAIResponse(response);
    return res.status(200).json({"res": response.text});

  } catch (error) {
    console.error("Interview Q&A error:", error);
    return res
      .status(500)
      .json({ message: "Failed to generate questions", error: error.message });
  }
};

// @desc Generate a concept explanation
// @route POST /api/ai/generate-explanation
// @access Private
const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: "Missing 'question' field" });
    }

    const prompt = conceptExplainPrompt(question);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",        // same model can be reused
      contents: prompt,
      
    });

    // console.log("Response text: ", response.text)

    // const data = await parseGenAIResponse(response);
    return res.status(200).json({"res": res.text});
  } catch (error) {
    console.error("Concept explanation error:", error);
    return res
      .status(500)
      .json({ message: "Failed to generate explanation", error: error.message });
  }
};

module.exports = {
  generateInterviewQuestions,
  generateConceptExplanation,
};
