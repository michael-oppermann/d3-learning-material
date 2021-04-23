
// We use d3.timeParse() to convert a string into JS date object
// Initialize helper function
const parseTime = d3.timeParse("%Y-%m-%d");

let data, lineChart; 

/**
 * Load data from CSV file asynchronously and render line chart
 */
d3.csv('data/sp_500_index.csv')
  .then(_data => {
    _data.forEach(d => {
      d.close = parseFloat(d.close);  // Convert string to float
      d.date = parseTime(d.date);     // Convert string to date object
    });

    data = _data;
    
    // Initialize and render chart
    lineChart = new LineChart({ parentElement: '#chart'}, data);
    lineChart.updateVis();
  })
  .catch(error => console.error(error));

/**
 * Input field event listener
 */
d3.select('#start-year-input').on('change', function() {
  // Get selected year
  const minYear = parseInt(d3.select(this).property('value'));

  // Filter dataset accordingly
  let filteredData = data.filter(d => d.date.getFullYear() >= minYear);

  // Update chart
  lineChart.data = filteredData;
  lineChart.updateVis();
});