const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const schema = require('./lib/schema');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGOOSE_URL || 'mongodb://localhost/redditscheduler');

const app = express();

app.use(bodyParser.urlencoded({'extended':true}));
app.use(session({
  'store': new MongoStore({
    'mongooseConnection': mongoose.connection
  }),
  'secret': process.env.SESSION_SECRET
}));
app.set('view engine','ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(passport.initialize());
app.use(passport.session());

require('./lib/passport').init(app);
require('./lib/views').init(app);
require('./lib/poster').init();

app.listen(8080 || process.env.EXPRESS_PORT,(err) => {
  if (err) {
    console.error(err);
    process.exit(-1);
  } else {
    console.log('Running');
  }
})
