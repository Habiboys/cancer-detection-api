const express = require('express'); 
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { predictCancer } = require('../models/cancer-detection');
const { savePrediction, getPredictionHistories } = require('../config/firestore');

const router = express.Router();

// Aturan ukuran file maksimal 1 MB
const upload = multer({ 
  limits: { fileSize: 1000000 }, // Maksimum 1MB
  fileFilter: (req, file, cb) => {
    // Membatasi hanya gambar JPEG dan PNG yang diperbolehkan
    const mimeTypes = ['image/jpeg', 'image/png'];
    if (mimeTypes.includes(file.mimetype)) {
      return cb(null, true); // File valid, lanjutkan
    }
    cb(new Error('File tidak sesuai, hanya file gambar JPEG atau PNG yang diperbolehkan'), false); // Menolak file jika tidak sesuai
  }
}).single('image');

// Handler untuk menangani kesalahan file yang terlalu besar
function fileSizeErrorHandler(err, req, res, next) {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      status: 'fail',
      message: 'Payload content length greater than maximum allowed: 1000000',
    });
  }
  next(err); // Jika bukan error ukuran file, teruskan ke handler lainnya
}

// Handler untuk menangani kesalahan file yang tidak sesuai format
function fileFormatErrorHandler(err, req, res, next) {
  if (err && err.message === 'File tidak sesuai, hanya file gambar JPEG atau PNG yang diperbolehkan') {
    return res.status(400).json({
      status: 'fail',
      message: 'Format file tidak sesuai, hanya file gambar JPEG atau PNG yang diperbolehkan',
    });
  }
  next(err); // Jika bukan error format file, teruskan ke handler lainnya
}

router.post('/predict', upload, fileSizeErrorHandler, fileFormatErrorHandler, async (req, res) => {
  try {
      if (!req.file) {
          return res.status(400).json({
              status: 'fail',
              message: 'Gambar tidak ditemukan',
          });
      }

      console.log('Gambar berhasil diterima, memulai prediksi...');
      const predictionResult = await predictCancer(req.file.buffer);

      const predictionData = {
          id: uuidv4(),
          result: predictionResult.label, // Label diambil langsung dari fungsi prediksi
          suggestion: predictionResult.suggestion, // Saran sudah disediakan oleh fungsi prediksi
          confidenceScore: predictionResult.confidenceScore, // Skor kepercayaan
          createdAt: new Date().toISOString(),
      };

      await savePrediction(predictionData);

      res.status(201).json({
        status: 'success',
        message: 'Model is predicted successfully', // Sesuaikan dengan pengujian
        data: predictionData,
    });
    
  } catch (error) {
      console.error('Error dalam melakukan prediksi:', error);
      res.status(400).json({
          status: 'fail',
          message: `Terjadi kesalahan dalam melakukan prediksi`,
      });
  }
});

router.get('/predict/histories', async (req, res) => {
  try {
    const histories = await getPredictionHistories();
    res.json({
      status: 'success',
      data: histories
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: 'Gagal mengambil riwayat prediksi'
    });
  }
});

module.exports = router;
