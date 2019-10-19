const express = require('express');
const router = express.Router();
const User = require('./models/user');
const Graph = require('./models/graph');

router.use((req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).send();
  }
})

router.get('/admin/users', (req, res) => {
  Promise.all([
    User.find({}),
    Graph.aggregate([{ "$group": { _id: "$userId", count: { $sum: 1 } } }])
  ]).then(([users, counts]) => {
    res.send(users.map(user => {
      const agg = counts.find(g => g._id === user._id.toString())
      return {
        ...user._doc,
        password: undefined,
        graphCount: agg ? agg.count : 0
      }
    }))
  })
})

router.get('/admin/users/:userId', (req, res) => {
  Promise.all([
    User.findOne({_id: req.params.userId}),
    Graph.find({userId: req.params.userId})
  ]).then(([user, graphs]) => {
    res.send({
      user: {
        ...user._doc,
        password: undefined
      },
      graphs: graphs.map(graph => ({
        _id: graph._id,
        name: graph.name,
      }))
    })
  })
  
})

module.exports = router;