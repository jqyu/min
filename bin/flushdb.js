// flush database
const model = require('../server/models/User')

model._redis.flushdb()
  .then(() => (console.log('database flushed'), process.exit()))
