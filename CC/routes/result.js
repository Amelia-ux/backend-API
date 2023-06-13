const express = require("express");
const router = express.Router();
const db = require("../db");
const axios = require("axios");

const app = express(); // Create an instance of the express application

// API endpoint to retrieve prediction result for a given audio file
app.get("/prediction/:audioName", (req, res) => {
  const audioName = req.params.audioName;

  // Retrieve prediction result from MySQL
  getPredictionResult(audioName)
    .then((prediction) => {
      if (!prediction) {
        res.status(404).json({ message: "Prediction not found" });
      } else {
        res.status(200).json({ prediction });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    });
});

// Function to call the ML model API for processing audio data
async function callMLModel(audioData) {
  // Make an HTTP request to the ML model API endpoint
  const mlModelEndpoint = "https://getprediction-7rpnuc6dkq-as.a.run.app";
  const response = await axios.post(mlModelEndpoint, audioData);

  // Extract the prediction result from the response
  const predictionResult = response.data.prediction;
  return predictionResult;
}

// Function to save audio name and prediction result to MySQL
function savePredictionResult(audioName, predictionResult) {
  const insertQuery = "INSERT INTO predictions (audio_name, prediction) VALUES (?, ?)";
  const values = [audioName, predictionResult];

  pool.query(insertQuery, values, (error, result) => {
    if (error) {
      console.error(error);
    }
  });
}

// Function to retrieve prediction result for a given audio name from MySQL
function getPredictionResult(audioName) {
  return new Promise((resolve, reject) => {
    const selectQuery = "SELECT prediction FROM predictions WHERE audio_name = ?";
    const values = [audioName];

    db.query(selectQuery, values, (error, rows) => {
      if (error) {
        reject(error);
      } else if (rows.length === 0) {
        resolve(null);
      } else {
        const prediction = rows[0].prediction;
        resolve(prediction);
      }
    });
  });
}

module.exports = router;