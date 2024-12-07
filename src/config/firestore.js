const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore();
const predictionsCollection = firestore.collection('predictions');

async function savePrediction(predictionData) {
  return await predictionsCollection.doc(predictionData.id).set(predictionData);
}

async function getPredictionHistories() {
  const snapshot = await predictionsCollection.get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    history: doc.data()
  }));
}

module.exports = { savePrediction, getPredictionHistories };