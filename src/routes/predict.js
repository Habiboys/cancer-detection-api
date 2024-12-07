const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { predictCancer } = require('../models/cancer-detection');
const { savePrediction, getPredictionHistories } = require('../config/firestore');

const router = express.Router();
const upload = multer({ 
  limits: { fileSize: 1000000 } 
});

router.post('/predict', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Gambar tidak ditemukan'
      });
    }

    console.log('Gambar berhasil diterima, memulai prediksi...');
    const predictionResult = await predictCancer(req.file.buffer);
    
    const predictionData = {
      id: uuidv4(),
      result: predictionResult,
      suggestion: predictionResult === 'Cancer' 
        ? 'Segera periksa ke dokter!' 
        : 'Penyakit kanker tidak terdeteksi.',
      createdAt: new Date().toISOString()
    };

    await savePrediction(predictionData);

    res.json({
      status: 'success',
      message: 'Model telah berhasil memprediksi',
      data: predictionData
    });
  } catch (error) {
    console.error('Error dalam melakukan prediksi:', error);
    res.status(500).json({
      status: 'fail',
      message: `Terjadi kesalahan dalam melakukan prediksi: ${error.message}`
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