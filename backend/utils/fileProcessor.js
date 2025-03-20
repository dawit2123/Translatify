const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const csvParser = require("csv-parser");
const xml2js = require("xml2js");

// Function to extract text from CSV file
const extractTextFromCSV = (filePath) => {
  console.log("Starting CSV extraction for file:", filePath);
  return new Promise((resolve, reject) => {
    const words = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        Object.values(row).forEach((value) => {
          words.push(value);
        });
      })
      .on("end", () => {
        console.log('words that are read', words)
        resolve(words);
      })
      .on("error", (err) => {
        console.error("Error during CSV extraction:", err);
        reject(err);
      });
  });
};

// Function to extract text from PDF file
const extractTextFromPDF = (filePath) => {
  return new Promise((resolve, reject) => {
    const buffer = fs.readFileSync(filePath);
    pdfParse(buffer)
      .then((data) => {
        // Extract text from PDF and split by whitespace or punctuation
        const words = data.text.split(/\s+/);
        resolve(words);
      })
      .catch(reject);
  });
};

// Function to extract text from XML file
const extractTextFromXML = (filePath) => {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser();
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) return reject(err);

      parser.parseString(data, (err, result) => {
        if (err) return reject(err);

        // Flatten XML structure and extract text from all fields
        const words = [];
        const traverseObject = (obj) => {
          for (let key in obj) {
            if (typeof obj[key] === "object") {
              traverseObject(obj[key]);
            } else {
              words.push(obj[key]);
            }
          }
        };
        traverseObject(result);
        resolve(words);
      });
    });
  });
};

module.exports = { extractTextFromCSV, extractTextFromPDF, extractTextFromXML };
