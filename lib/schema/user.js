const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  'id': String,
  'accessToken': String,
  'refreshToken': String,
  'created': {
    'type': Date,
    'default': Date.now
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
