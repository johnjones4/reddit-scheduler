const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  'url': String,
  'text': String,
  'title': String,
  'dateToPost': Date,
  'subreddit': String,
  'posted': Boolean,
  'created': {
    'type': Date,
    'default': Date.now
  },
  'user': {
    'type': mongoose.Schema.Types.ObjectId,
    'ref': 'User'
  },
  'submissionId': String
});

postSchema.statics.findUnposted = () => {
  return Post.find({
    'dateToPost': {
      '$lte': new Date()
    },
    'posted': false
  }).sort('dateToPost').populate('user');
};

postSchema.statics.findPosted = () => {
  return Post.find({
    'dateToPost': {
      '$lte': new Date()
    },
    'posted': true
  }).sort('dateToPost').populate('user');
};

postSchema.statics.findScheduled = () => {
  return Post.find({
    'dateToPost': {
      '$gt': new Date()
    },
    'posted': false
  }).sort('dateToPost').populate('user');
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
