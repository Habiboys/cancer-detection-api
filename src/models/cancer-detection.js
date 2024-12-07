const tf = require('@tensorflow/tfjs-node');
const { loadModelFromBucket } = require('../config/storage');


let model;

async function loadModel() {
  if (!model) {
    model = await loadModelFromBucket();
  }
  return model;
}

async function predictCancer(imageBuffer) {
  try {
    const model = await loadModel();

    // Mengonversi buffer gambar menjadi tensor
    const imageTensor = tf.node.decodeImage(imageBuffer);  // Menggunakan fungsi decodeImage untuk mengonversi buffer ke tensor

    // Mengubah ukuran gambar agar sesuai dengan input model
    const resizedImage = tf.image.resizeBilinear(imageTensor, [224, 224]); // Sesuaikan ukuran dengan input yang diharapkan model

    // Normalisasi gambar (jika diperlukan, tergantung cara model dilatih)
    const normalizedImage = resizedImage.div(tf.scalar(255));

    // Menambahkan batch dimension (model biasanya mengharapkan input dengan dimensi [batch_size, height, width, channels])
    const inputTensor = normalizedImage.expandDims(0);

    // Melakukan prediksi
    const prediction = model.predict(inputTensor);

    // Mengambil hasil prediksi (misalnya, probabilitas atau kelas)
    const predictedClass = prediction.argMax(-1).dataSync()[0]; // Mengambil kelas yang diprediksi
    return predictedClass === 1 ? 'Cancer' : 'No Cancer';  // Sesuaikan dengan output model Anda

  } catch (error) {
    console.error('Error dalam melakukan prediksi:', error);
    throw new Error('Prediksi gagal');
  }
}

module.exports = { predictCancer };
