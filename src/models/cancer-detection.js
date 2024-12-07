const tf = require('@tensorflow/tfjs-node');
const { loadModelFromBucket } = require('../config/storage');

async function predictCancer(imageBuffer) {
  const model = await loadModelFromBucket();
  
  // Preprocessing gambar
  const tensor = tf.node.decodeImage(imageBuffer)
    .resizeBilinear([224, 224])
    .expandDims(0)
    .div(255.0);
  
  const prediction = model.predict(tensor);
  const predictionValue = prediction.dataSync()[0];
  
  return predictionValue > 0.5 ? 'Cancer' : 'Non-cancer';
}

module.exports = { predictCancer };