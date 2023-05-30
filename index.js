const express = require('express');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());

// Inisialisasi Firebase Admin SDK
const serviceAccount = require('./path/to/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Middleware untuk mengizinkan CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Endpoint untuk menyimpan rekaman suara
app.post('/rekaman-suara', async (req, res) => {
  try {
    const { namaFile, data } = req.body;

    // Simpan metadata rekaman suara ke Firestore
    const docRef = await db.collection('rekaman').add({
      namaFile,
      data
    });

    res.status(201).json({ id: docRef.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menyimpan rekaman suara' });
  }
});

// Endpoint untuk memproses rekaman suara
app.get('/proses-rekaman/:id', (req, res) => {
  const { id } = req.params;

  // Mengambil data rekaman suara dari Firestore berdasarkan ID
  db.collection('rekaman')
    .doc(id)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const data = doc.data();

        // Panggil fungsi prosesRekamanSuara dari script.js untuk memproses rekaman suara
        const hasilProses = prosesRekamanSuara(data);

        res.status(200).json({ hasilProses });
      } else {
        res.status(404).json({ error: 'Rekaman suara tidak ditemukan' });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Gagal memproses rekaman suara' });
    });
});

// Fungsi untuk memproses rekaman suara menggunakan model machine learning
function prosesRekamanSuara(data) {
  // Logika pemrosesan rekaman suara menggunakan model machine learning
  // ...

  return 'Hasil pemrosesan';
}

// Menjalankan server pada port tertentu
const port = 3000;
app.listen(port, () => {
  console.log(`Server berjalan pada port ${port}`);
});