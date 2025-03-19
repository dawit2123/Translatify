// filepath: c:\Users\enqua\Desktop\@project\translatify\server.js
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const dotenv = require("dotenv");
const translationRoutes = require("./routes/translationRoutes");

dotenv.config();
const app = express();
console.log('dotenv configured', process.env.MONGO_URI)

app.use(express.json()); // For parsing JSON bodies
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded form-data

const upload = multer({ dest: "uploads/" }); // Set the destination for uploaded files

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

// Apply multer middleware only to routes that need file uploads
app.use("/api/translate", upload.single("file"), translationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));