require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const md5 = require('md5');
const cors = require('cors')
const expressSession = require('express-session');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true, 
  useUnifiedTopology: true
});
const User = require('./models/user');
const Graph = require('./models/graph');
const app = express();
const path = require('path');
const indexHtml = require('fs').readFileSync(path.join(__dirname, '../dist/index.html')).toString();

app.use(express.static(path.join(__dirname,'./public/')));

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
    saveUninitialized: false 
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cors({origin:'http://localhost:1234', credentials:true}))

  app.post(
    '/login', 
    passport.authenticate('local'),
    (req, res) => {
      res.send({_id: req.user._id, username: req.user.username})
    }
  );
  app.get(
    '/logged-in',
    (req, res) => {
      res.send(req.user ? {_id: req.user._id, username: req.user.username} : false)
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

  app.get(
    '/graphs/:graphId',
    ensureLoggedIn,
    (req, res) => {
      Graph.findOne({_id:req.params.graphId}).then(graph => {
        if(!graph){
          res.status(404).send();
          return;
        }
        res.send({
          _id: graph._id,
          graphData: JSON.parse(graph.graphData),
          userId: graph.userId,
          name: graph.name
        });
      })
    }
  )
  
  app.post(
    '/graphs',
    ensureLoggedIn,
    (req, res) => {
      const {graphData, id, name} = req.body;
      Promise.resolve().then(() => {
        if(!id){
          return Graph.getNewId().then(id => {
            return new Graph({
              _id: id,
              graphData: JSON.stringify(graphData),
              userId: req.user._id,
              name
            })
          })
        }
        return Graph.findById(id).then(graph => {
          graph.graphData = JSON.stringify(graphData)
          graph.name = name
          return graph;
        })
      }).then(graph => {
        graph.save().then(() => {
          res.send({
            _id: id,
            graphData,
            name
          })
        })
      })
    }
  )

  app.get('*', (req, res) => {
    res.send(indexHtml);
  })
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT);
  console.log(`Listening on http://localhost:${PORT}`)
  

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