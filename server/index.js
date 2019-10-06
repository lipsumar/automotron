require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const md5 = require('md5');
const expressSession = require('express-session');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/dev', {
  useNewUrlParser: true, 
  useUnifiedTopology: true
});
const User = require('./models/user');
const Graph = require('./models/graph');
const app = express();

const db = mongoose.connection;
db.once('open', () => {

  passport.use(new Strategy((username, password, cb) => {
    console.log({username, password})
    User.findOne({username}).then(user => {
      if(user && user.password === hashPassword(password)){
        console.log('auth OK')
        cb(null, user);
      } else {
        console.log('auth KO')
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
    saveUninitialized: false 
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  app.post(
    '/login', 
    passport.authenticate('local'),
    (req, res) => {
      res.send('youre logged in!')
    }
  );

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
          res.send(user);
        });
      })
    }
  )
  
  app.get(
    '/graphs', 
    ensureLoggedIn,
    (req, res) => {
      Graph.find({userId: req.user._id}).then(graphs => {
        res.send(graphs.map(graph => {
          return {_id: graph.id, name: graph.name}
        }));
      })
      
    }
  );
  
  app.post(
    '/graphs',
    ensureLoggedIn,
    (req, res) => {
      const {graphData, id, name} = req.body;
      if(!id){
        Graph.getNewId().then(newId => {
          const graph = new Graph({
            _id: newId,
            graph: JSON.stringify(graphData),
            userId: req.user._id,
            name
          })
          graph.save().then(() => {
            res.send({
              _id: newId,
              graphData,
              name
            })
          })
        })
      }
    }
  )
  
  app.listen(3000);
  console.log('Listening on http://localhost:3000')
  

})



function ensureLoggedIn(req, res, next){
  if(!req.user){
    res.status(401).send('Must be logged-in');
  }else {
    next();
  }
}

function hashPassword(password){
  return md5(password + process.env.PASSWORD_SALT)
}