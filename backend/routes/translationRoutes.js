const express = require("express");
const { translateFile } = require("../controllers/translationController");

const router = express.Router();

// Endpoint for translating files
router.post("/", translateFile);

module.exports = router;
