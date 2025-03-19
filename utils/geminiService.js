const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini 2.0 model using the API Key
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0" });

// Translate text using Gemini 2.0
const translateTextUsingGemini = async (text, targetLanguage) => {
  try {
    // Predefined Style Guide and Terminologies
    const styleGuide = `
      Retain international terms and brand names (e.g., Google, Smartphone, Internet) without translation, as they are globally recognized. 
      Avoid localized jargon and maintain cultural references such as “Olympics” or “Christmas” in their original form. 
      Use consistent translations for widely accepted phrases (e.g., “Thank you”) and develop a glossary for key terms. 
      Ensure clarity and user-friendliness, preserving formatting and context for accurate interpretation while keeping the language simple and accessible.
    `;
    
    // Construct the prompt with the provided text and style guide
    const prompt = `Translate the following text from any language to ${targetLanguage}. 
      ${styleGuide}
      The text to translate: "${text}"`;

    // Request translation from the Gemini 2.0 model
    const response = await model.generateText({
      inputText: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error in Gemini 2.0 Translation:", error);
    throw new Error("Translation failed using Gemini 2.0");
  }
};

module.exports = { translateTextUsingGemini };
