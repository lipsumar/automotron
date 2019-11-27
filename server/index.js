require('dotenv').config()
const express = require('express');
const admin = require('./admin')
const graphs = require('./graphs')
const bodyParser = require('body-parser');
const md5 = require('md5');
const cors = require('cors')
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession)
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true, 
  useUnifiedTopology: true
});
const User = require('./models/user');

const app = express();
const path = require('path');
const PUBLIC_DIR = process.env.PUBLIC_DIR || 'public'
const indexHtml = require('fs').readFileSync(path.join(__dirname, `../${PUBLIC_DIR}/index.html`)).toString();

app.use(function(req, res, next){
  const host = req.header("host");
  if(host.match(/^www/)){
    res.redirect(301, 'http://' + host.replace('www.', '') );
    return;
  }
  next();
});

app.use(express.static(path.join(__dirname,`../${PUBLIC_DIR}`), {
  etag: false,
  setHeaders: (res, path) => {
    if (path.match(/index\.html$/)) {
      res.setHeader("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
      res.setHeader('Expires', new Date(Date.now() - 2592000000).toUTCString())
      res.setHeader('Last-Modified', new Date(Date.now() - 2592000000).toUTCString())
    }
  }
}));

const db = mongoose.connection;
db.once('open', () => {

  passport.use(new Strategy((username, password, cb) => {
    User.findOne({username}).then(user => {
      if(user && user.password === hashPassword(password)){
        cb(null, user);
      } else {
        cb(null, false);
      }
    })
  }));

  passport.serializeUser(function(user, cb) {
    cb(null, user.id);
  });
  
  passport.deserializeUser(function(id, cb) {
    User.findById(id, function (err, user) {
      if (err) { return cb(err); }
      cb(null, user);
    });
  });

  app.use(bodyParser.json());
  app.use(expressSession({ 
    secret: process.env.SESSION_SECRET, 
    resave: false, 
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: db })
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cors({origin:/http(?:s?):\/\/(?:localhost|[a-z-]+\.lipsumar\.io)(?::\d+|)/, credentials:true}))

  app.post(
    '/login', 
    passport.authenticate('local'),
    (req, res) => {
      res.send({
        _id: req.user._id, 
        username: req.user.username,
        role: req.user.role,
      })
    }
  );
  app.get(
    '/logged-in',
    (req, res) => {
      res.send(req.user ? {
        _id: req.user._id, 
        username: req.user.username,
        role: req.user.role,
      } : false)
    }
  )

  app.post(
    '/register',
    (req, res) => {
      const {username, password} = req.body;
      User.findOne({username}).then(existingUser => {
        if(existingUser){
          res.send({error: true, data: 'username already exists'});
          return;
        }

        const user = new User({username, password: hashPassword(password)});
        user.save().then(() => {
          req.login(user, err => {
            if(err){
              res.status(500).send()
              console.log(err)
              return
            }
            res.send(user);
          })
          
        });
      })
    }
  ) 

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/')
  })
  

  app.use(graphs)

  app.use(admin)

  app.get('*', (req, res) => {
    res
      .status(200)
      .set({
        "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
        'Expires': new Date(Date.now() - 2592000000).toUTCString(),
        'Last-Modified': new Date(Date.now() - 2592000000).toUTCString()
      })
      .send(indexHtml);
  })
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT);
  console.log(`Listening on http://localhost:${PORT}`)
  

})




function hashPassword(password){
  return md5(password + process.env.PASSWORD_SALT)
}
