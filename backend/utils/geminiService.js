const axios = require("axios");  

// Hardcoded URL for the Gemini 2.0 Flash model  
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.API_KEY}`;  


// Translate text using Gemini 2.0
const translateTextUsingGemini = async (text, targetLanguage) => {
  try {
    // Predefined Style Guide and Terminologies
    const styleGuide = `
      Retain international terms and brand names (e.g., Google, Smartphone, Internet) without translation, as they are globally recognized. 
      Avoid localized jargon and maintain cultural references such as “Olympics” or “Christmas” in their original form. 
      Use consistent translations for widely accepted phrases (e.g., “Thank you”) and develop a glossary for key terms. 
      Ensure clarity and user-friendliness, preserving formatting and context for accurate interpretation while keeping the language simple and accessible.
      Note: Give me only the traslated text. I don't want you give me another other words.
    `;
    
    // Construct the prompt with the provided text and style guide
    const prompt = `Translate the following text from any language to ${targetLanguage}. 
      ${styleGuide}
      The text to translate: "${text}"`;

    // Request translation from the Gemini 2.0 model
    const requestBody = {  
      contents: [  
        {  
          parts: [{ text: prompt }]  
        }  
      ]  
    };  

    const response = await axios.post(GEMINI_URL, requestBody, {  
      headers: {  
        "Content-Type": "application/json"  
      }  
    });  

    console.log('Response:', response.data.candidates[0].content.parts[0].text);
    return response.data.candidates[0].content.parts[0].text;  

  } catch (error) {
    console.error("Error in Gemini 2.0 Translation:", error);
    throw new Error("Translation failed using Gemini 2.0");
  }
};

module.exports = { translateTextUsingGemini };
