
// We use d3.timeParse() to convert a string into JS date object
// Initialize helper function
const parseTime = d3.timeParse("%Y-%m-%d")

/**
 * Load data from CSV file asynchronously and render area chart
 */
d3.csv('data/sp_500_index.csv')
  .then(data => {

    data.forEach(d => {
      d.close = parseFloat(d.close);  // Convert string to float
      d.date = parseTime(d.date);     // Convert string to date object
    });
    console.log(data);
    
    // Initialize and render chart
    const areaChart = new AreaChart({ parentElement: '#chart'}, data);
    areaChart.updateVis();
  })
  .catch(error => console.error(error));