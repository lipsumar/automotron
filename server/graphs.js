const express = require('express');
const router = express.Router();
const Graph = require('./models/graph');
const ensureLoggedIn = require('./middlewares/ensureLoggedIn');
const AutomotronGraph = require('./automotron-graph').default;
const axios = require('axios');

router.get(
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

router.get(
  '/graphs/:graphId',
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

router.get('/graphs/:graphId/run/:format', (req, res) => {
  runGraph(req.params.graphId, req.params.format).then(out => {
    res.type(req.params.format).send(out)
  })
})
router.get('/graphs/:graphId/run', (req, res) => {
  runGraph(req.params.graphId, 'text').then(out => {
    res.type('text').send(out)
  })
})

function runGraph(id, format){
  return Graph.findOne({_id:id}).then(graph => {
    const graphData = JSON.parse(graph.graphData)
    const graphInstance = new AutomotronGraph(graphData.graph, {
      apiBaseUrl: process.env.API_BASE_URL,
      axios
    })
    return graphInstance.run().then(sequence => {
      if(format === 'text'){
        return sequence.map(i => i.value).join(' ').replace(/\\n/g, '\n')
      }else if(format === 'json'){
        return sequence
      }
    })
  })
}

router.post(
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
      if(graph.userId !== req.user._id.toString()){
        res.status(401).send()
        return
      }
      graph.save().then(() => {
        res.send({
          _id: graph.id,
          graphData,
          name
        })
      })
    })
  }
)

module.exports = router;