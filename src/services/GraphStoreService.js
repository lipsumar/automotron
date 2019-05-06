import uniqueId from 'uniqid'

class GraphStoreService{
  constructor(){
    const list = window.localStorage.getItem('amt-list')
    if(!list){
      window.localStorage.setItem('amt-list', '[]')
    }
  }

  fetchGraph(id){
    return new Promise(resolve => {
      let graph = window.localStorage.getItem(`amt-graph-${id}`)
      if(!graph){
        resolve(null)
      } else {
        resolve(JSON.parse(graph))
      }
    })
  }

  saveGraph(id, graph){
    return new Promise(resolve => {
      window.localStorage.setItem(`amt-graph-${id}`, JSON.stringify(graph))
      this.upsertList(id, graph.name)
      resolve()
    })
  }

  upsertList(id, name){
    const list = this.getList()
    const item = list.find(i => i.id === id)
    if(item){
      item.name = name
    }else{
      list.push({id, name})
    }
    window.localStorage.setItem('amt-list', JSON.stringify(list))
  }

  getList(){
    return JSON.parse(window.localStorage.getItem('amt-list'))
  }

  getFreeId(){
    return uniqueId()
  }
}

export default new GraphStoreService()