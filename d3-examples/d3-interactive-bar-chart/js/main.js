/**
 * Load data from CSV file asynchronously and render bar chart
 */
let barchart;
d3.csv('data/population.csv')
  .then(data => {
    data.forEach(d => {
      d.population = +d.population;
    });

    // Sort data by population
    data.sort((a,b) => b.population - a.population);
    
    // Initialize chart and then show it
    barchart = new Barchart({ parentElement: '#chart'}, data);
    barchart.updateVis();
  })
  .catch(error => console.error(error));


/**
 * Event listener: change ordering
 */
/*
var changeSortingOrder = d3.select("#change-sorting").on("click", function() {
    reverse = !reverse;
    updateVisualization();
});
*/

d3.select('#sorting').on('click', d => {
  barchart.config.reverseOrder = true;
  barchart.updateVis();
})