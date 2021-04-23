
// 1) Load CSV data
d3.csv('data/cities_and_population.csv')
  .then(data => {
    // 2) Inspect dataset in the web console
    console.log(data);

    // 3) Filter all cities that are part in the European Union
    data = data.filter(d => d.eu == 'true');
    
    // 4) Get the length of the array and print the number of cities on the web page
    d3.select('body')
      .append('p')
      .text('Number of cities: ' + data.length);

    // 5) Prepare the data: convert numerical values to numbers
    data.forEach(d => {
      d.population = +d.population;
      d.x = +d.x;
      d.y = +d.y;
    });

    // 6) Create empty SVG container
    const svg = d3.select('body').append('svg')
      .attr('width', 800)
      .attr('height', 550)
      .attr('class', 'd3-chart');

    // 7) Append circles
    // Use anonymous functions to access object attributes and to create dynamic SVG properties
    const circles = svg.selectAll('circle')
        .data(data)
      .enter()
        .append('circle')
        .attr('r', d => d.population >= 1000000 ? 8 : 4)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

    // 8) Append text labels
    // Use the filter() function to show the labels only for cities with a population >= 1 mio.
    const labels = svg.selectAll('text')
        .data(data.filter(d => d.population >= 1000000))
      .enter()
        .append('text')
        .attr('class', 'city-label')
        .attr('x', d => d.x)
        .attr('y', d => d.y - 15)
        .text(d => d.city)
  })
  .catch(error => console.error(error));