const redis = require('redis');

const getClient = (redisOptions) => {
  const client = redis.createClient(redisOptions);

  return {
    get: client.get,
    set: client.set,
  };
};

const getCluster = (redisOptions) => {
  const client = redis.createCluster(redisOptions);

  return {
    get: client.get,
    set: client.set,
  };
};

module.exports = { getClient, getCluster };
