/**
 * Load data from CSV file asynchronously and render scatter plot
 */
d3.csv('data/vancouver_trails.csv')
  .then(data => {
    // Convert strings to numbers
    data.forEach(d => {
      d.time = +d.time;
      d.distance = +d.distance;
    });
    
    // Initialize chart
    const scatterplot = new Scatterplot({ parentElement: '#scatterplot'}, data);
    
    // Show chart
    scatterplot.updateVis();
  })
  .catch(error => console.error(error));