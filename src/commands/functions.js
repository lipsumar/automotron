import flatten from 'lodash.flatten'

export default {
  removeNodes(nodes, { graph, ui }) {
    nodes.forEach(node => {
      // first, remove links to the node
      const links = this.getLinksOfNode(node, graph)
      links.forEach(link => {
        graph.removeLink(link.from, link.to)
        const uiLink = ui.getLink({ nodeId: link.from.id, outlet: link.fromOutlet }, { nodeId: link.to.id, inlet: link.toInlet })
        ui.removeLink(uiLink)
      })

      graph.removeNode(node.id)
      ui.removeNode(node.id)
    })
  },
  getLinksOfNodes(nodes, graph) {
    return flatten(nodes.map(node => this.getLinksOfNode(node, graph)))
  },
  getLinksOfNode(node, graph) {
    return graph.links.filter(link => link.from.id === node.id || link.to.id === node.id)
  },

  addNodesAndLinks(data, { graph, ui }) {
    graph.buildState(data)

    // links & nodes can not be passed directly to ui.buildGrah
    // we first need to get them from the graph
    const links = data.links.map(normalizedLink => {
      return graph.links.find(link =>
        link.from.id === normalizedLink.from.nodeId &&
        link.to.id === normalizedLink.to.nodeId &&
        link.fromOutlet == normalizedLink.from.outlet &&
        link.toInlet == normalizedLink.to.inlet
      )
    })
    const nodes = data.nodes.map(node => graph.getNode(node.id))

    this.addedNodes = nodes;

    ui.buildGraph({
      nodes,
      links
    })
  },

  createContainer(opts, { graph, ui }) {
    const node = graph.createContainer(opts)
    ui.createContainer(node)
    return node
  },

  createLink(opts, { graph, ui }) {
    const from = graph.getNode(opts.from.nodeId)
    const to = graph.getNode(opts.to.nodeId)

    let link;
    if (opts.from.outlet === 'agreement') {
      link = graph.createAgreementLink(from, to)
    } else {
      link = graph.createLink(from, to, {
        fromOutlet: opts.from.outlet,
        toInlet: opts.to.inlet
      })
    }

    ui.createLink(link)
    return link
  },

  removeLink(opts, {graph,ui}){
    const from = graph.getNode(opts.from.nodeId)
    const to = graph.getNode(opts.to.nodeId)

    graph.removeLink(from, to)
    const linkUI = ui.getLink({ nodeId: from.id, outlet: opts.from.outlet }, { nodeId: to.id, inlet: opts.to.inlet })
    ui.removeLink(linkUI)
  }


}