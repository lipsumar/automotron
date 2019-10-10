import axios from 'axios';

const ax = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
})

export default {
  login(username, password){
    return ax.post('/login', {username, password})
      .then(resp => resp.data)
  },
  loggedIn(){
    return ax.get(`/logged-in?_${Math.random()}`)
      .then(resp => resp.data)
  },
  getGraphList(){
    return ax.get('/graphs')
      .then(resp => resp.data)
  },
  getGraph(id){
    return ax.get(`/graphs/${id}`)
      .then(resp => resp.data)
  },
  saveGraph(id, graphData, name){
    return ax.post('/graphs', {id, graphData, name})
      .then(resp => resp.data)
  }
}
