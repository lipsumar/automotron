const mongoose = require('mongoose')
const shortid = require('shortid');

const GraphSchema = new mongoose.Schema({
  _id: String,
  graphData: String,
  userId: String,
  name: String
}, {_id: false});

const Graph = mongoose.model('Graph', GraphSchema);

module.exports = Graph;
module.exports.getNewId = function () {
  return tryNewId()
}

function tryNewId(){
  const id = shortid.generate();
  return Graph.findById(id).then(existingGraph => {
    if(existingGraph){
      return tryNewId()
    }
    return id;
  })
}