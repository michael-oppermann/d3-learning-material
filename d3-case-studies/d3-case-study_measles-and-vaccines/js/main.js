/**
 * Load data from CSV file asynchronously and render chart
 */
d3.json('data/measles_data.json').then(data => {
  const heatmap = new Heatmap({
    parentElement: '#heatmap-container',
    vaccineIntroduced: 1963
  }, data);
  
  d3.select('#sort-control').on('change', function() {
    heatmap.config.sortOption = d3.select(this).property('value');
    heatmap.updateVis();
  });
});