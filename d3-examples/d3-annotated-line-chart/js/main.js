
/**
 * Load data from CSV file asynchronously and render chart
 */
d3.json('data/aapl_stock_historical.json').then(data => {
  data.forEach(d => {
    d.Date = new Date (d.Date);     // Convert string to date object
  });

  // Initialize and render chart
  lineChart = new LineChart({ parentElement: '#chart'}, data);
})
.catch(error => console.error(error));
