// flush database
const redisOpts = require('../config/environment').redis

const redis = require('ioredis')(redisOpts)

redis.flushdb()
  .then(() => (console.log('database flushed'), process.exit()))
