// flush database
const redisOpts = require('../config/environment.js').redis

const redis = require('ioredis')(redisOpts)

module.exports = redis.flushdb()
  .then(() => (console.log('database flushed')))
