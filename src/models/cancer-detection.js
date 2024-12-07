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

        // Mengubah preprocessing agar sama dengan kode 1
        const tensor = tf.node
            .decodeImage(imageBuffer)
            .resizeNearestNeighbor([224, 224]) // Menggunakan resizeNearestNeighbor seperti kode 1
            .expandDims()
            .toFloat();  // Menggunakan toFloat() seperti kode 1
        
        console.log('Tensor input siap untuk prediksi');

        // Melakukan prediksi
        const prediction = model.predict(tensor);
        const score = await prediction.data();
        const confidenceScore = score[0];
        
        console.log('Confidence Score:', confidenceScore);

        // Menentukan hasil prediksi berdasarkan ambang batas 0.5
        const label = confidenceScore > 0.5 ? 'Cancer' : 'Non-cancer';
        console.log('Label:', label);

        // Menentukan saran berdasarkan label
        const suggestion = label === 'Cancer' 
            ? 'Segera periksa ke dokter!' 
            : 'Penyakit kanker tidak terdeteksi.';
        console.log('Suggestion:', suggestion);

        return { confidenceScore, label, suggestion };

    } catch (error) {
        console.error('Error dalam prediksi:', error);
        throw new Error('Prediksi gagal');
    }
}

module.exports = { predictCancer };