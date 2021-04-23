
// We use d3.timeParse() to convert a string into JS date object
// Initialize helper function
const parseTime = d3.timeParse("%Y-%m-%d");

let data, focusContextVis; 

/**
 * Load data from CSV file asynchronously and render area chart
 */
d3.csv('data/sp_500_index.csv')
  .then(_data => {
    _data.forEach(d => {
      d.close = parseFloat(d.close);  // Convert string to float
      d.date = parseTime(d.date);     // Convert string to date object
    });

    data = _data;
    
    // Initialize and render chart
    focusContextVis = new FocusContextVis({ parentElement: '#chart'}, data);
    focusContextVis.updateVis();
  });

