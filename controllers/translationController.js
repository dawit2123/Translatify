const fs = require("fs");
const path = require("path");
const Translation = require("../models/Translation");
const redisClient = require("../config/redis");
const { translateTextUsingGemini } = require("../utils/geminiService");
const { extractTextFromCSV, extractTextFromPDF, extractTextFromXML } = require("../utils/fileProcessor");

exports.translateFile = async (req, res) => {
  try {
    const { targetLanguage } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    let words = [];
    const filePath = path.join(__dirname, "../uploads", file.filename);
    
    if (file.mimetype.includes("csv")) {
      words = await extractTextFromCSV(filePath);
    } else if (file.mimetype.includes("pdf")) {
      words = await extractTextFromPDF(filePath);
    } else if (file.mimetype.includes("xml")) {
      words = await extractTextFromXML(filePath);
    } else {
      return res.status(400).json({ error: "Unsupported file format" });
    }

    let finalText = [];
    console.log('translation process started')
    for (const word of words) {
        console.log(word)
      let translatedWord = await redisClient.get(`${word}:${targetLanguage}`);

      if (!translatedWord) {
        const existingTranslation = await Translation.findOne({ originalText: word, targetLanguage });

        if (existingTranslation) {
          translatedWord = existingTranslation.translatedText;
        } else {
          translatedWord = await translateTextUsingGemini(word, targetLanguage);
          await redisClient.set(`${word}:${targetLanguage}`, translatedWord, "EX", 86400);
          await Translation.create({ originalText: word, translatedText: translatedWord, sourceLanguage: "auto", targetLanguage });
        }
      }

      finalText.push(translatedWord);
    }

    const translatedText = finalText.join(" ");
    const outputFilePath = path.join(__dirname, `../downloads/translated-${file.filename}`);

    fs.writeFileSync(outputFilePath, translatedText);

    res.json({ message: "Translation complete", downloadUrl: `/downloads/translated-${file.filename}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
