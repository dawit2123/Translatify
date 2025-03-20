// filepath: c:\Users\enqua\Desktop\@project\translatify\server.js
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const dotenv = require("dotenv");
const cors = require('cors'); 
const translationRoutes = require("./routes/translationRoutes");

dotenv.config();
const app = express();

app.use(cors()); 

app.use(express.json()); // For parsing JSON bodies
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded form-data

const upload = multer({ dest: "uploads/" }); // Set the destination for uploaded files

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve static files from the 'downloads' directory
app.use("/downloads", express.static(path.join(__dirname, "downloads")));


// Apply multer middleware only to routes that need file uploads
app.use("/api/translate", upload.single("file"), translationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));