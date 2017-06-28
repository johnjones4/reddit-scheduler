const passport = require('passport');
const RedditStrategy = require('passport-reddit').Strategy;
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = mongoose.model('User');

exports.init = (app) => {
  passport.use(new RedditStrategy({
    'clientID': process.env.REDDIT_CONSUMER_KEY,
    'clientSecret': process.env.REDDIT_CONSUMER_SECRET,
    'callbackURL': process.env.REDDIT_CALLBACK_BASE + '/auth/reddit/callback',
    'scope': [
      'identity',
      'submit'
    ].join(' ')
  },(accessToken, refreshToken, profile, done) => {
    User.findOne({
      'id': profile.id
    }).then((user) => {
      if (!user) {
        user = new User({
          'id': profile.id
        });
      }
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      return user.save()
        .then(() => {
          return user;
        });
    })
    .then((user) => {
      done(null,user);
    })
    .catch((err) => {
      done(err);
    });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findOne({
      'id': id
    }).then((user) => {
      done(null,user);
    }).catch((err) => {
      done(err);
    });
  });

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  app.get('/auth/reddit', function(req, res, next){
    req.session.state = crypto.randomBytes(32).toString('hex');
    passport.authenticate('reddit', {
      'state': req.session.state,
      'duration': 'permanent',
    })(req, res, next);
  });

  app.get('/auth/reddit/callback', function(req, res, next){
    if (req.query.state == req.session.state){
      passport.authenticate('reddit', {
        'successRedirect': '/',
        'failureRedirect': '/'
      })(req, res, next);
    } else {
      next(new Error(403));
    }
  });
}
