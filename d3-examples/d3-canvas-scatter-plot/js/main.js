/**
 * Load data from CSV file asynchronously and render scatter plot
 */
d3.csv('data/mnist_umap_embedding.csv')
  .then(data => {
    data.forEach(d => {
      d.x = parseFloat(d.x);
      d.y = parseFloat(d.y);
      d.category = +d.category;
    });
    
    const scatterplot = new Scatterplot({ parentElement: '#scatterplot'}, data);
  })
  .catch(error => console.error(error));