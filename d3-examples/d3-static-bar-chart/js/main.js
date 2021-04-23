/**
 * Load data from CSV file asynchronously and render bar chart
 */
d3.csv('data/sales.csv')
  .then(data => {
    // Convert sales strings to numbers
    data.forEach(d => {
      d.sales = +d.sales;
    });
    
    // Initialize chart
    const barchart = new Barchart({ parentElement: '#barchart'}, data);
    
    // Show chart
    barchart.updateVis();
  })
  .catch(error => console.error(error));