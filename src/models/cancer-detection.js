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
    console.log('Model berhasil dimuat');

    // Mengonversi buffer gambar menjadi tensor
    const imageTensor = tf.node.decodeImage(imageBuffer);
    console.log('Gambar berhasil diubah menjadi tensor');

    // Mengubah ukuran gambar agar sesuai dengan input model
    const resizedImage = tf.image.resizeBilinear(imageTensor, [224, 224]);
    console.log('Gambar berhasil diresize');

    // Normalisasi gambar
    const normalizedImage = resizedImage.div(tf.scalar(255));
    console.log('Gambar berhasil dinormalisasi');

    // Menambahkan batch dimension
    const inputTensor = normalizedImage.expandDims(0);
    console.log('Tensor input siap untuk prediksi');

    // Melakukan prediksi
    const prediction = model.predict(inputTensor);
    const predictedClass = prediction.argMax(-1).dataSync()[0];  // Ambil kelas dengan probabilitas tertinggi
    console.log('Prediksi selesai:', predictedClass);

    return predictedClass === 1 ? 'Cancer' : 'No Cancer'; // Sesuaikan output model Anda

  } catch (error) {
    console.error('Error dalam prediksi:', error);
    throw new Error('Prediksi gagal');
  }
}


module.exports = { predictCancer };
