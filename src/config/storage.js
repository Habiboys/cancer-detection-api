const { Storage } = require('@google-cloud/storage');

const storage = new Storage();
const bucketName = 'your-model-bucket';

async function loadModelFromBucket() {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file('cancer-detection-model/model.json');
  
  // Download model ke direktori lokal
  await file.download({ destination: './model/model.json' });
  
  // Load model menggunakan tfjs
  const model = await tf.loadLayersModel('file://./model/model.json');
  return model;
}

module.exports = { loadModelFromBucket };