switch (process.env.NODE_ENV) {
  case 'production':
    module.exports = require('./store.prod')
    break
  case 'test':
    module.exports = require('./store.dummy')
    break
  default:
    module.exports = require('./store.dev')
}
