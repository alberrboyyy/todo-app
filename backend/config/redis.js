const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://:admin_pwd@127.0.0.1:6379'
});

redisClient.on('error', (err) => console.error('Erreur Redis:', err));

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Connexion à Redis réussie.');
  } catch (error) {
    console.error('Erreur de connexion à Redis:', error.message);
  }
};

module.exports = { redisClient, connectRedis };
