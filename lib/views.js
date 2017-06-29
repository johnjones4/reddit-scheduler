const mongoose = require('mongoose');
const _ = require('lodash');
const Post = mongoose.model('Post');

exports.init = (app) => {

  app.param('post',(req,res,next,id) => {
    Post.findOne({'_id':id})
      .then((post) => {
        req.post = post;
        next();
      })
      .catch((err) => {
        next(err);
      })
  })

  app.use((req,res,next) => {
    res.locals = {
      'user': req.user
    };
    if (!req.user) {
      res.render('login');
    } else {
      next();
    }
  })

  app.get('/',(req,res,next) => {
    Post.findScheduled()
      .then((posts) => {
        res.render('index',{
          'posts': posts,
          'title': 'Scheduled'
        });
      })
      .catch((err) => {
        next(err);
      })
  });

  app.get('/post',(req,res,next) => {
    renderPost(res,blankPost(req));
  });

  app.post('/post',(req,res,next) => {
    const post = blankPost(req);
    savePost(req,req,next,post)
      .then(() => {
        res.redirect('/');
      })
      .catch((err) => {
        next(err);
      })
  });

  app.get('/post/:post/duplicate',(req,res,next) => {
    const newPost = new Post({
      'url': req.post.url,
      'text': req.post.text,
      'title': req.post.title,
      'dateToPost': req.post.dateToPost,
      'subreddit': req.post.subreddit,
      'posted': false,
      'user': req.user._id
    });
    renderPost(res,newPost);
  });

  app.get('/post/:post',(req,res,next) => {
    renderPost(res,req.post);
  });

  app.post('/post/:post',(req,res,next) => {
    savePost(req,req,next,req.post)
      .then(() => {
        res.redirect('/');
      })
      .catch((err) => {
        next(err);
      })
  });

  app.get('/post/:post/delete',(req,res,next) => {
    req.post.remove()
      .then(() => {
        res.redirect('/');
      })
      .catch((err) => {
        next(err);
      });
  });
}

function blankPost(req) {
  return new Post({
    'url': '',
    'text': '',
    'title': '',
    'dateToPost': new Date(),
    'subreddit': '',
    'posted': false,
    'user': req.user._id
  });
}

function renderPost(res,post) {
  res.render('edit',{
    'post': post,
    'years': _.range(post.dateToPost.getFullYear(),post.dateToPost.getFullYear()+5),
    'months': _.range(0,12),
    'days': _.range(1,32),
    'hours': _.range(0,24),
    'minutes': _.range(0,60),
    'action': post._id ? '/post/' + post._id : '/post'
  })
}

function savePost(req,req,next,post) {
  ['url','text','title','subreddit'].forEach((field) => {
    post[field] = req.body[field];
  });
  const date = new Date();
  date.setFullYear(parseInt(req.body.dateToPostYear));
  date.setMonth(parseInt(req.body.dateToPostMonth));
  date.setDate(parseInt(req.body.dateToPostDay));
  date.setHours(parseInt(req.body.dateToPostHour));
  date.setMinutes(parseInt(req.body.dateToPostMinute));
  date.setSeconds(0);
  date.setMilliseconds(0);
  post.dateToPost = date;
  return post.save();
}
