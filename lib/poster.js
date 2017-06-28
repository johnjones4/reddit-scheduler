const snoowrap = require('snoowrap');
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  'host': process.env.MAIL_HOST,
  'port': parseInt(process.env.MAIL_PORT),
  'secure': process.env.MAIL_SECURE === 'true',
  'auth': {
    'user': process.env.MAIL_USERNAME,
    'pass': process.env.MAIL_PASSWORD
  }
});

exports.init = () => {
  setInterval(() => {
    console.log('Looking for things to post.');
    Post.findUnposted()
      .then((posts) => {
        console.log('Found ' + posts.length + ' to post.');
        posts.forEach((post) => {
          savePost(post)
            .then((submission) => {
              console.log('Posted ' + post.title);
              post.submissionId = submission.name;
              post.posted = true;
              return post.save();
            })
            .then(() => {
              return sendEmail('Content Submitted','Posted ' + post.title + ' to https://reddit.com/r/' + post.subreddit + '/comments/' + post.submissionId.substring(3));
            })
            .catch((err) => {
              console.error(err);
              sendEmail('Content Submit Failed',err.message).catch((err) => console.error(err));
            });
        })
      })
      .catch((err) => {
        console.error(err);
      });
  },60000);
}

const sendEmail = (subject,message) => {
  const mailOptions = {
    'from': process.env.MAIL_FROM,
    'to': process.env.MAIL_TO,
    'subject': subject,
    'text': message
  };
  return transporter.sendMail(mailOptions);
}

const savePost = (post) => {
  const r = new snoowrap({
    'userAgent': 'reddit-scheduler',
    'accessToken': post.user.accessToken,
    'clientId': process.env.REDDIT_CONSUMER_KEY,
    'clientSecret': process.env.REDDIT_CONSUMER_SECRET,
    'refreshToken': post.user.refreshToken
  });
  if (post.url) {
    return r.getSubreddit(post.subreddit)
      .submitLink({
        'title': post.title,
        'url': post.url,
      });
  } else {
    return r.getSubreddit(post.subreddit)
      .submitSelfpost({
        'title': post.title,
        'text': post.text,
      });
  }
}
