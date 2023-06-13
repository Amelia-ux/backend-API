const express = require("express");
const router = express.Router();
const { PredictionServiceClient } = require("@google-cloud/automl").v1;
const axios = require("axios");
const db = require("../db");
const fetch = require('node-fetch');
const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

const client = new PredictionServiceClient({
  keyFilename: "./serviceAccountKey.json",
});
const modelUrl = "https://getprediction-7rpnuc6dkq-as.a.run.app";
const bucketName = "halodek-project";

async function loadModel() {
  
  try {
    const response = await fetch(modelUrl);
  
    if (response.ok) {
      const modelData = await response.json();
      const modelPath = modelData.model_path;
      const model = await tf.loadLayersModel(modelPath);
      return model;
    } else {
      console.error('Failed to load model:', response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error loading model:', error);
    return null;
  }
}

async function processAudioFile(modelPath, filePath) {
  const request = {
    name: modelPath,
    payload: {
      audio: {
        gcsUri: filePath,
      },
    },
  };

  try {
    const [response] = await client.predict(request);

    const result = response.payload.map((annotation) => ({
      displayName: annotation.displayName,
      classification: annotation.classification.score,
    }));

    return result;
  } catch (error) {
    console.error("Error predicting with ML model:", error);
    throw new Error("Failed to process audio file with ML model");
  }
}

router.get("/", async (req, res) => {
  try {
    // Get the latest uploaded audio file from the database
    const query = "SELECT * FROM audio_files ORDER BY id DESC LIMIT 1";
    const [audioFile] = await db.query(query);

    if (!audioFile) {
      return res.status(404).json({ message: "No audio file found" });
    }

    const fileName = audioFile.filename;

    // Load the ML model
    const modelPath = await loadModel();

    // Validate the modelPath
    if (!modelPath) {
      return res.status(400).json({ message: "Invalid model path" });
    }

    const filePath = `gs://${bucketName}/${fileName}`;

    // Process the audio file using the loaded ML model
    const result = await processAudioFile(modelPath, filePath);

    // Update prediction result in the database
    const predictQuery = "UPDATE audio_files SET prediction = ? WHERE filename = ?";
    const resultValue = JSON.stringify(result);

    await db.query(predictQuery, [resultValue, fileName]);

    res.json(result);
  } catch (error) {
    console.error("Internal server error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//test
const formData = new FormData();
formData.append('file', fs.createReadStream('./data_babies_cry/tired/1309B82C-F146-46F0-A723-45345AFA6EA8-1430059864-1.0-f-04-ti.wav'));

// try to run the locally
axios.post('http://127.0.0.1:5000/', formData, {
  headers: formData.getHeaders()
})
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error);
  });

// not local
// axios.post('https://getprediction-7rpnuc6dkq-as.a.run.app', formData, {
//   headers: formData.getHeaders()
// })
//   .then((response) => {
//     console.log(response.data);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

module.exports = router;
