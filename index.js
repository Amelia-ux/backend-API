const express = require('express');
const multer = require('multer');
const admin = require('firebase-admin');
const fs = require('fs');

// Inisialisasi aplikasi Express
const app = express();

// Konfigurasi Firebase Admin SDK
const serviceAccount = require('serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-firebase-database-url.firebaseio.com'
});

// Konfigurasi multer untuk mengunggah file suara
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint API untuk mengunggah rekaman suara
app.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    // Mengambil data suara yang diunggah
    const audioData = req.file.buffer;

    // Menyimpan data suara ke Firebase Firestore
    const documentRef = await saveAudioData(audioData);

    // Memproses data suara menggunakan model machine learning
    const result = await processAudioData(audioData);

    // Mengirimkan hasil pemrosesan sebagai respons
    res.json({ result });
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ error: 'Failed to process audio' });
  }
});

// Fungsi untuk menyimpan data suara ke Firebase Firestore
async function saveAudioData(audioData) {
  const db = admin.firestore();
  const collectionRef = db.collection('audio');

  // Membuat dokumen baru dengan data suara
  const documentRef = await collectionRef.add({ audio: audioData });

  return documentRef;
}

// Fungsi untuk memproses data suara menggunakan model machine learning
async function processAudioData(audioData) {
  // Memanggil file script.js
  const script = require('halodek-project/ML/js/script.js');

  // Memanggil fungsi di dalam script.js untuk memproses data suara
  const result = script.processAudio(audioData);

  return result;
}

// Menjalankan server pada port tertentu
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server berjalan pada http://localhost:${port}`);
});