
// We use d3.timeParse() to convert a string into JS date object
// Initialize helper function
const parseTime = d3.timeParse("%Y-%m-%d");

let data, stackedAreaChart; 

/**
 * Load data from CSV file asynchronously and render area chart
 */
d3.csv('data/freshwater-use-by-aggregated-region.csv')
  .then(_data => {
    _data.forEach(d => {
      d.year = +d.year;
      d.freshwater_use = Math.round((+d.freshwater_use)/1000000000);
    });

    data = _data;
    
    // Initialize and render chart
    stackedAreaChart = new StackedAreaChart({ parentElement: '#area-chart'}, data);
    stackedAreaChart.updateVis();
  })
  .catch(error => console.error(error));


/**
 * Select box event listener
 */
d3.select('#display-type-selection').on('change', function() {
  // Get selected display type and update chart
  stackedAreaChart.config.displayType = d3.select(this).property('value');
  stackedAreaChart.updateVis();
});