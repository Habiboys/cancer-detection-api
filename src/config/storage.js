const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

// Gunakan path ke key.json
const storage = new Storage({
  keyFilename: process.env.KEY
});

const bucketName = process.env.BUCKET_NAME;

async function loadModelFromBucket() {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file('model.json');
  
  await file.download({ destination: './model/model.json' });
  
  const model = await tf.loadLayersModel('file://./model/model.json');
  return model;
}

module.exports = { loadModelFromBucket };