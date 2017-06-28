['post','user'].forEach((type) => {
  module.exports[type] = require('./' + type);
})
