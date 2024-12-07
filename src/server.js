const express = require('express');
const predictRoutes = require('./routes/predict');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(predictRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});