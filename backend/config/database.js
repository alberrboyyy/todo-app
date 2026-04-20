const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.DB_URL) {
      throw new Error('Missing DB_URL environment variable');
    }
    await mongoose.connect(process.env.DB_URL);
    console.log('Connexion à MongoDB réussie.');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = {
  connectDB
};
