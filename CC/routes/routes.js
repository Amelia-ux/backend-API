const express = require("express");
const mysql = require("mysql");
const router = express.Router();
const Multer = require("multer");
const imgUpload = require("./handler");
const { PredictionServiceClient } = require("@google-cloud/automl").v1;

const multer = Multer({
  storage: Multer.MemoryStorage,
});

// connect to cloud sql
const connection = mysql.createConnection({
  host: "public_ip_sql_instance_Anda",
  user: "root",
  database: "nama_database_Anda",
  password: "password_sql_Anda",
});

router.get("/dashboard", (req, res) => {
  const query = "select (select count(*) from records where month(records.date) = month(now()) AND year(records.date) = year(now())) as month_records, (select sum(amount) from records) as total_amount;";
  connection.query(query, (err, rows, field) => {
    if (err) {
      res.status(500).send({ message: err.sqlMessage });
    } else {
      res.json(rows);
    }
  });
});

// ML predict
router.post("/predict", async (req, res) => {
  const { audio } = req.body;

  // call a model from GCP
  const predictionClient = new PredictionServiceClient();
  const modelId = "your-model-id"; // Ganti dengan ID model ML yang sudah dideploy
  const projectId = "halodek-project"; // Ganti dengan ID proyek GCP Anda
  const location = "asia-southeast1"; // Ganti dengan lokasi model ML yang sudah dideploy

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

router.get("/getrecords", (req, res) => {
  const query = "SELECT * FROM records";
  connection.query(query, (err, rows, field) => {
    if (err) {
      res.status(500).send({ message: err.sqlMessage });
    } else {
      res.json(rows);
    }
  });
});

router.get("/getrecord/:id", (req, res) => {
  const id = req.params.id;

  const query = "SELECT * FROM records WHERE id = ?";
  connection.query(query, [id], (err, rows, field) => {
    if (err) {
      res.status(500).send({ message: err.sqlMessage });
    } else {
      res.json(rows);
    }
  });
});

router.get("/searchrecords", (req, res) => {
  const s = req.query.s;

  console.log(s);
  const query = "SELECT * FROM records WHERE name LIKE '%" + s + "%' or notes LIKE '%" + s + "%'";
  connection.query(query, (err, rows, field) => {
    if (err) {
      res.status(500).send({ message: err.sqlMessage });
    } else {
      res.json(rows);
    }
  });
});

// insert user data
router.post("/insertrecord", multer.single("attachment"), imgUpload.uploadToGcs, (req, res) => {
  const name = req.body.name;
  const amount = req.body.amount;
  const date = req.body.date;
  const notes = req.body.notes;
  var imageUrl = "";

  if (req.file && req.file.cloudStoragePublicUrl) {
    imageUrl = req.file.cloudStoragePublicUrl;
  }

  const query = "INSERT INTO records (name, amount, date, notes, attachment) values (?, ?, ?, ?, ?)";

  connection.query(query, [name, amount, date, notes, imageUrl], (err, rows, fields) => {
    if (err) {
      res.status(500).send({ message: err.sqlMessage });
    } else {
      res.send({ message: "Insert Successful" });
    }
  });
});

router.put("/editrecord/:id", multer.single("attachment"), imgUpload.uploadToGcs, (req, res) => {
  const id = req.params.id;
  const name = req.body.name;
  const amount = req.body.amount;
  const date = req.body.date;
  const notes = req.body.notes;
  var imageUrl = "";

  if (req.file && req.file.cloudStoragePublicUrl) {
    imageUrl = req.file.cloudStoragePublicUrl;
  }

  const query = "UPDATE records SET name = ?, amount = ?, date = ?, notes = ?, attachment = ? WHERE id = ?";

  connection.query(query, [name, amount, date, notes, imageUrl, id], (err, rows, fields) => {
    if (err) {
      res.status(500).send({ message: err.sqlMessage });
    } else {
      res.send({ message: "Update Successful" });
    }
  });
});

router.delete("/deleterecord/:id", (req, res) => {
  const id = req.params.id;

  const query = "DELETE FROM records WHERE id = ?";
  connection.query(query, [id], (err, rows, fields) => {
    if (err) {
      res.status(500).send({ message: err.sqlMessage });
    } else {
      res.send({ message: "Delete successful" });
    }
  });
});

router.post("/uploadImage", multer.single("image"), imgUpload.uploadToGcs, (req, res, next) => {
  const data = req.body;
  if (req.file && req.file.cloudStoragePublicUrl) {
    data.imageUrl = req.file.cloudStoragePublicUrl;
  }

  res.send(data);
});

module.exports = router;
