'use strict';
const G = require('graphql')
const _ = require('lodash')
const faker = require('faker')

const schema = require('../server/gql/schema/')
const req = require('../server/models/').request()

const NUM_USERS = 200
const NUM_PUBLICATIONS = 3
const NUM_CHANNELS = 100
const NUM_ITEMS = 10000

// generate graphql documents

function generateUsers() {

  function generateUser(n) {
    var name = faker.name.findName()
    var avatar = faker.internet.avatar()
    return `genUser${n}: createUser(name: "${name}", thumbnail: "${avatar}") { id } `;
  }
  let queries = _.range(0, NUM_USERS).map(generateUser)
  let query = `mutation { ${_.join(queries, '')} }`;
  return G.graphql(schema, query, { req })

}

function generatePublications() {

  function generatePublication(n) {
    var name = faker.company.companyName()
    var avatar = faker.internet.avatar()
    return `genPublication${n}: createPublication(name: "${name}", thumbnail: "${avatar}") { id } `
  }

  function attachUser(n) {
    return _.range(0, NUM_PUBLICATIONS)
            .map(m =>
              ((faker.random.number() % NUM_PUBLICATIONS) < 2)
              ? `allowEdit${n}_${m}: allowEdit(user_id: ${n+1}, publication_id: ${m+1}) `
              : '')
            .join('')
  }

  let pQueries = _.range(0, NUM_PUBLICATIONS).map(generatePublication)
  let uQueries = _.range(0, NUM_USERS).map(attachUser)

  let query = `mutation { ${_.concat(pQueries, uQueries).join('')} }`

  return G.graphql(schema, query, { req })
}

function generateChannels() {

  function generateChannel(n) {
    var name = faker.company.bsNoun()
    var description = faker.company.bs()
    var avatar = faker.internet.avatar()
    return `genChannel${n}: createChannel(name: "${name}", description: "${description}", thumbnail: "${avatar}") { id }`
  }

  function attachChannel(n) {
    return _.chain(_.range(0, NUM_PUBLICATIONS))
            .shuffle()
            .take(Math.floor(Math.random()*3) + 1)
            .map(m => `attachChanne${n}_${m}: attachChannel(channel_id: ${n+1}, publication_id: ${m+1})`)
            .join('')
            .value()
  }

  let cQueries = _.range(0, NUM_CHANNELS).map(generateChannel)
  let pQueries = _.range(0, NUM_CHANNELS).map(attachChannel)

  let query = `mutation { ${_.concat(cQueries, pQueries).join('')} }`

  return G.graphql(schema, query, { req })
}

function generateItems() {

  function generateItem(n) {
    var title = faker.company.catchPhrase();
    var url = faker.internet.url();
    var avatar = faker.internet.avatar();
    var userId = Math.floor(Math.random() * NUM_USERS + 1)

    return `genItem${n}: createItem(title: "${title}", url: "${url}", thumbnail: "${avatar}") { id }`
      + `attachPoster${n}: attributeUser(user_id: ${userId}, item_id: ${n+1}) `
  }

  function attachItem(n) {
    return _.chain(_.range(0, NUM_CHANNELS))
            .shuffle()
            .take(Math.floor(Math.random() * 7) + 1)
            .map(m => `attachItem${n}_${m}: attachItem(item_id: ${n+1}, channel_id: ${m+1})`)
            .join('')
            .value()

  }

  let iQueries = _.range(0, NUM_ITEMS).map(generateItem)
  let cQueries = _.range(0, NUM_ITEMS).map(attachItem)

  let query = `mutation { ${_.concat(iQueries, cQueries).join('')} }`

  return G.graphql(schema, query, { req })
}

console.log("this takes a while, hold on...")
console.time("took")
Promise.resolve(require('./flushdb'))
  .then(generateUsers)
  .then(generatePublications)
  .then(generateChannels)
  .then(generateItems)
  .then(() => (console.log("generated fixtures", console.timeEnd("took"), process.exit())))
  .catch(e => (console.log("something fucked up", e), process.exit(1)))
