/**
 * Load data from CSV file asynchronously and render force directed graph
 */
d3.json('data/miserables.json').then(data => {
  const forceDirectedGraph = new ForceDirectedGraph({ parentElement: '#force-directed-graph'}, data);
})
.catch(error => console.error(error));