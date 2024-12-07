const tf = require('@tensorflow/tfjs-node');
require('dotenv').config();
const bucket_name =process.env.BUCKET_NAME;
async function loadModelFromBucket() {
  try {
    console.log('Memulai proses loading model dari Cloud Storage URL');
    
    const modelUrl = `https://storage.googleapis.com/${bucket_name}/model.json`;
    
    const model = await tf.loadLayersModel(modelUrl);
    
    if (model) {
      console.log('Model berhasil dimuat dari Cloud Storage URL');
      return model;
    } else {
      console.error('Gagal memuat model dari URL');
      throw new Error('Model tidak dapat dimuat');
    }
  } catch (error) {
    console.error('Error dalam proses loading model:', error);
    throw error;
  }
}

module.exports = { loadModelFromBucket };