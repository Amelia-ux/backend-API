const express = require("express");
const multer = require("multer");
const admin = require("firebase-admin");
const fs = require("fs");

// Inisialisasi aplikasi Express
const app = express();

// Konfigurasi Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://halodek-project-a7a7d-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

// Konfigurasi multer untuk mengunggah file suara
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint API untuk mengunggah rekaman suara
app.post("/upload", upload.single("audio"), async (req, res) => {
  try {
    // Mengambil data suara yang diunggah
    const audioData = req.file.buffer;

    // Menyimpan data suara ke Firebase Firestore
    const documentRef = await saveAudioData(audioData);

    // Memproses data suara menggunakan model machine learning
    const result = await processAudioData(audioData);

    // Memperbarui dokumen Firestore dengan hasil pemrosesan
    await updateFirestoreDocument(documentRef, result);

    // Mengirimkan hasil pemrosesan sebagai respons
    res.json({ result });
  } catch (error) {
    console.error("Error processing audio:", error);
    res.status(500).json({ error: "Failed to process audio" });
  }
});

// Fungsi untuk menyimpan data suara ke Firebase Firestore
async function saveAudioData(audioData) {
  const db = admin.firestore();
  const collectionRef = db.collection("audio");

  // Membuat dokumen baru dengan data suara
  const documentRef = await collectionRef.add({ audio: audioData });

  return documentRef;
}

// Fungsi untuk memproses data suara menggunakan model machine learning
async function processAudioData(audioData) {
  // Baca model machine learning dari file JSON
  const modelPath = "ML/model.json";
  const modelJson = fs.readFileSync(modelPath, "utf8");
  const model = JSON.parse(modelJson);

  // Implementasikan kode untuk memproses data suara menggunakan model machine learning di sini.
  // Gunakan model yang telah dibaca dari file JSON.

  // Contoh sederhana - Mengalikan semua nilai audio dengan 2
  const result = audioData.map((value) => value * 2);

  return result;
}

// Fungsi untuk memperbarui dokumen Firestore dengan hasil pemrosesan
async function updateFirestoreDocument(documentRef, result) {
  await documentRef.update({ processedAudio: result });
}

// Menjalankan server pada port tertentu
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server berjalan pada http://localhost:${port}`);
});
