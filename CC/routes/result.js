const axios = require("axios");
const fs = require("fs");
const express = require("express");
const FormData = require("form-data");
const router = express.Router();
const mysql = require("mysql");

// Local directory containing WAV files
const directoryPath = "./audio_history";

// ML model API endpoint
const mlModelEndpoint = "https://getprediction-7rpnuc6dkq-as.a.run.app";

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "34.126.92.65",
  user: "root",
  password: "capstone23",
  database: "halodek-users",
});

router.post("/", async (req, res) => {
  try {
    // Get the list of files in the directory
    const files = fs.readdirSync(directoryPath);

    // Filter for WAV files
    const wavFiles = files.filter((file) => file.endsWith(".wav"));

    if (wavFiles.length === 0) {
      return res.status(404).json({ message: "No WAV files found" });
    }

    // Find the latest WAV file
    const latestFile = getLatestFile(wavFiles);

    // Read the audio file
    const filePath = `${directoryPath}/${latestFile}`;
    const fileStream = fs.createReadStream(filePath);

    // Create form data and append the file
    const formData = new FormData();
    formData.append("file", fileStream);

    // Process the audio file using the ML model
    const response = await axios.post(mlModelEndpoint, formData, {
      headers: formData.getHeaders(),
    });
    console.log(response.data);
    // Extract the prediction result from the response
    const predictionResult = response.data.prediction;
    console.log(predictionResult);

    // Save the filename and prediction in MySQL
    savePredictionToMySQL(latestFile, predictionResult);

    // Send the prediction result as the API response
    res.json({
      filename: latestFile,
      prediction: predictionResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Function to get the latest file from an array of files
function getLatestFile(files) {
  return files.reduce((latest, current) => {
    const latestTimestamp = fs.statSync(`${directoryPath}/${latest}`).mtimeMs;
    const currentTimestamp = fs.statSync(`${directoryPath}/${current}`).mtimeMs;
    return currentTimestamp > latestTimestamp ? current : latest;
  });
}

// Function to save the filename and prediction in MySQL
function savePredictionToMySQL(filename, prediction) {
  const query = "INSERT INTO audio_files (filename, prediction) VALUES (?, ?)";
  const values = [filename, JSON.stringify(prediction)];
  pool.query(query, values, (error, results) => {
    if (error) {
      console.error("Error saving prediction to MySQL:", error);
    } else {
      console.log("Prediction saved to MySQL");
    }
  });
}

module.exports = router;
