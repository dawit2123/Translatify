const fs = require("fs");
const path = require("path");
const Translation = require("../models/Translation");
const redisClient = require("../config/redis");
const { translateTextUsingGemini } = require("../utils/geminiService");
const { extractTextFromCSV, extractTextFromPDF, extractTextFromXML } = require("../utils/fileProcessor");

exports.translateFile = async (req, res) => {
  try {
    const { sourceLanguage, targetLanguage } = req.body;
    const file = req.file;
    console.log('source language', sourceLanguage)
    console.log('target language', targetLanguage)
    console.log('file', file)

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    let words = [];
    const filePath = path.join(__dirname, "../uploads", file.filename);
    console.log('file mimetype', file.mimetype)
    if (file.mimetype=="text/csv") {
      words = await extractTextFromCSV(filePath);
    } else if (file.mimetype=="application/pdf") {
      words = await extractTextFromPDF(filePath);
    } else if (file.mimetype=="text/xml") {
      words = await extractTextFromXML(filePath);
    } else {
      return res.status(400).json({ error: "Unsupported file format" });
    }

    let finalText = [];
    for (const word of words) {
      let translatedWord = await redisClient.get(`${sourceLanguage}:${word}:${targetLanguage}`);

      if (!translatedWord) {
        const existingTranslation = await Translation.findOne({ originalText: word, sourceLanguage, targetLanguage });

        if (existingTranslation) {
          translatedWord = existingTranslation.translatedText;
        } else {
            translatedWord = await translateTextUsingGemini(word, targetLanguage);
            console.log('translated word', translatedWord)
            await redisClient.set(`${sourceLanguage}:${word}:${targetLanguage}`, translatedWord, "EX", 86400);
          await Translation.create({ originalText: word, translatedText: translatedWord, sourceLanguage, targetLanguage });
        }
      }

      finalText.push(translatedWord);
    }

    const translatedText = finalText.map(word => word.trim()).join(" ");
    console.log('translated text')
    console.log(translatedText)
    const outputFilePath = path.join(__dirname, `../downloads/translated-${file.filename}`);

    fs.writeFileSync(outputFilePath, translatedText);

    res.json({ message: "Translation complete", downloadUrl: `/downloads/translated-${file.filename}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
