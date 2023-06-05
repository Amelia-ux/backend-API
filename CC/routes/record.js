const express = require("express");
const mysql = require("mysql");
const router = express.Router();
const Multer = require("multer");
const audioUpload = require("../modules/gcsUpload");
const { PredictionServiceClient } = require("@google-cloud/automl").v1;

// upload audio
module.exports = (storage, dbConfig) => {
  const upload = Multer({
    storage: Multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== "audio/wav") {
        cb(new Error("File must be in WAV format"));
      } else {
        cb(null, true);
      }
    },
  });

  // save audio file to Google Cloud Storage
  router.post("/upload", upload.single("audio"), async (req, res) => {
    try {
      const audioFile = req.file;

      await file.save(audioFile.buffer);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  return router;
};

// ML predict
router.post("/predict", async (req, res) => {
  const { audio } = req.body;

  // call a model from GCP
  const predictionClient = new PredictionServiceClient();
  const modelId = "your-model-id";
  const projectId = "halodek-project";
  const location = "asia-southeast1";

  const modelPath = predictionClient.modelPath(projectId, location, modelId);
  // send request to ML
  const [response] = await predictionClient.predict({
    name: modelPath,
    payload: {
      audio: {
        content: audio,
      },
    },
  });
  const predictionResult = response.payload[0];
  const predictionLabel = predictionResult.displayName;
  const predictionScore = predictionResult.classification.score;

  res.json({ label: predictionLabel, score: predictionScore });
});

// register
router.post("/register", (req, res) => {
  const { username, password } = req.body;

  // check user on database
  const query = "INSERT INTO users (username, password) VALUES (?, ?)";
  connection.query(query, [username, password], (err, result) => {
    if (err) {
      console.error("Error registering user:", err);
      res.status(500).json({ error: "An error occurred while registering user" });
      return;
    }

    res.json({ message: "User registered successfully" });
  });
});

// connnect to Cloud SQL
const dbConfig = {
  host: "your-host",
  user: "your-username",
  password: "your-password",
  database: "your-database",
};
const connection = mysql.createConnection(dbConfig);

// login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // check user on database
  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  connection.query(query, [username, password], (err, result) => {
    if (err) {
      console.error("Error logging in:", err);
      res.status(500).json({ error: "An error occurred while logging in" });
      return;
    }

    if (result.length === 0) {
      res.status(401).json({ error: "Invalid username or password" });
    } else {
      res.json({ message: "Login successful" });
    }
  });
});

module.exports = router;
