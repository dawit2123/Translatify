const mongoose = require("mongoose");

const TranslationSchema = new mongoose.Schema({
  originalText: { type: String, required: true },
  translatedText: { type: String, required: true },
  sourceLanguage: { type: String, required: true },
  targetLanguage: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Translation", TranslationSchema);
