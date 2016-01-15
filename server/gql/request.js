'use strict';

const _ = require('lodash')
const Promise = require('bluebird')

const models = require('../models/')

module.exports = function(redis) {

  const cache = _.mapValues(models, () => new Map())

  // create a queue of fetch jobs:
  //   [ { MODEL, id, resolve, reject }
  //   , { MODEL, id, >, resolve, reject }
  //   , { MODEL, id, <, resolve, reject }
  //   , { MODEL, ids, params, resolve, reject } // not cached
  //   , ...
  //   ]
  let queue = []

  let curJob = null
  let nextJob = null

  // dispatchQueue :: Promise<undefined>
  //   side effect: flushes queue and evaluates in single round trip
  //   this promise is only used for synchronicity, no return value
  function dispatchQueue() {
    console.log('dispatching')

    // copy queue to function stack
    const q = queue
    queue = []

    // build transaction
    const transaction = redis.multi()
    _.forEach(q, j =>
      transaction.hgetall(`${models[j.model]._keyspace}:${j.id}:attributes`))

    // execute transaction
    nextJob = null
    return transaction.exec()
      // deserialize
      .map((r, i) => models[q[i].model]._parseResponse(r[1]))
      .map((r, i) => (console.log(r, i),q[i].resolve(r)))
      .then(() => { curJob = null })
  }

  const enqueue = (model, id) =>
    cache[model]
      .set(id , new Promise((resolve, reject) => {
        // push job to queue
        queue.push({model, id, resolve, reject})
        // tell the dispatcher to do its job
        if (!curJob)
          curJob = dispatchQueue()
        else if (!nextJob)
          nextJob = curJob.then(dispatchQueue)
        }))
      .get(id)

  function get(model, id) {
    console.log('get called on', model, id)
    if (!model || !id)
      throw new Error("Invalid get query")
    return cache[model].get(id) || enqueue(model, id)
  }

  return {

    all: (model, params) => {
      // request list of ids, then resolve them with custom get function
    }

  , find: (model, ids) =>
    Promise.all(_.map(ids, id => get(model, id)))

  , getSuccessors: (p, name, s, id) => {
      // check if successor relationship should be cached
    }

  , getPredecessors: (p, name, s, id) => {
      // check if predecessor relationship should be cached
    }

  , cache:
    { node: {
      }
    // TODO: the rest of this shit
    , successors: {
      }
    , predecessors: {
      }
    }

  }

}
