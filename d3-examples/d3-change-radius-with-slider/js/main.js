const svg = d3.select('svg');

// Show circle with initial radius of 60px
const circle = svg.append('circle')
    .attr('cx', 100)
    .attr('cy', 100) 
    .attr('fill', 'none')   
    .attr('stroke', 'blue') 
    .attr('r', 60);

function update(radius) {
  circle.attr('r', radius);
}



// Event slider for input slider
d3.select('#radius-slider').on('input', function() {
  // Update visualization
  update(parseInt(this.value));

  // Update label
  d3.select('#radius-value').text(this.value);
});