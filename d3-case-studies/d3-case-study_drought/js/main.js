// Load data from CSV file
d3.csv('data/palmer_drought.csv').then(data => {
  data.forEach(d => {
    // Convert strings to numeric values
    data.columns.forEach(col => {
      if (col != 'key') {
        d[col] = +d[col];
      }
    });

    // Split 'key' into 'year' and 'month'
    // and determine column number for small multiples
    d.year = d.key.substring(0, 4);
    d.month = parseInt(d.key.substring(4, 6));
    d.col = +d.year[d.year.length-1];
    d.year = +d.year;
  });
  
  // Initialize visualization class
  timelineHeatmap = new TimelineHeatmap({ 
    parentElement: '#timeline'
  }, data);
});

// Helper function to create an array of size max + 1
function getArrayRange(max) {
  return Array.from(Array(max+1).keys());
}
