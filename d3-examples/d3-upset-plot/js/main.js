
/* 
 * Load CSV dataset
 * Data source: UpSet project (Alexander Lex)
 */
d3.json('data/simpsons.json')
  .then(data => {
    createUpSetPlot(data);
  });


/* 
 * Draw UpSet plot
 */
function createUpSetPlot(data) {
  // Process data: check set membership for each combination
  const allSetIds = data.sets.map(d => d.setId);
  
  data.combinations.forEach(combination => {
    combination.sets = [];
    allSetIds.forEach(d => {
      combination.sets.push({ 
        setId: d, 
        member: combination.setMembership.includes(d) 
      });
    });

    // Determine which sets (circles in the combination matrix) should be connected with a line
    if (combination.setMembership.length > 1) {
      combination.connectorIndices = d3.extent(combination.setMembership, d => allSetIds.indexOf(d));
    } else {
      combination.connectorIndices = [];
    }
  });

  // Define dimensions of the visualization 
  const containerWidth = 800;
  const containerHeight = 300;

  const margin = { top: 5, right: 0, bottom: 0, left: 5 };
  const innerMargin = 12;
  const tooltipMargin = 10;

  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.left;

  const leftColWidth = 280;
  const setIdWidth = 120;
  const setSizeChartWidth = leftColWidth - setIdWidth;
  const rightColWidth = width - leftColWidth;

  const topRowHeight = 130;
  const bottomRowHeight = height - topRowHeight - innerMargin;

  // Initialize scales
  const intersectionSizeScale = d3.scaleLinear()
      .range([topRowHeight, 0])
      .domain([0, d3.max(data.combinations, (d) => d.values.length)]);

  const setSizeScale = d3.scaleLinear()
      .range([setSizeChartWidth, 0])
      .domain([0, d3.max(data.sets, (d) => d.size)]);

  const xScale = d3.scaleBand()
      .range([0, rightColWidth])
      .domain(data.combinations.map((d) => d.combinationId))
      .paddingInner(0.2);

  const yScale = d3.scaleBand()
      .range([0, bottomRowHeight])
      .domain(allSetIds)
      .paddingInner(0.2);

  // Prepare the overall layout
  const svg = d3.select('#upset-plot')
    .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
    .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const setSizeChart = svg.append('g')
      .attr('transform', `translate(0, ${topRowHeight + innerMargin})`);

  const intersectionSizeChart = svg.append('g')
      .attr('class', 'intersection-size')
      .attr('transform', `translate(${leftColWidth}, 0)`);

  const combinationMatrix = svg.append('g')
      .attr('transform', `translate(${leftColWidth}, ${topRowHeight + innerMargin})`);


  /*
   * Combination matrix
   */
  
  // Create a group for each combination
  const combinationGroup = combinationMatrix.selectAll('.combination')
    .data(data.combinations)
    .join('g')
      .attr('class', 'combination')
      .attr('transform', (d) => `translate(${xScale(d.combinationId) + xScale.bandwidth()/2}, 0)`);

  // Select all circles within each group and bind the inner array per data item
  const circle = combinationGroup.selectAll('circle')
    .data((combination) => combination.sets)
    .join('circle')
      .classed('member', (d) => d.member)
      .attr('cy', (d) => yScale(d.setId) + yScale.bandwidth()/2)
      .attr('r', (d) => yScale.bandwidth()/2);

  // Connect the sets with a vertical line
  const connector = combinationGroup
    .filter((d) => d.connectorIndices.length > 0)
    .append('line')
      .attr('class', 'connector')
      .attr('y1', (d) => yScale(allSetIds[d.connectorIndices[0]]) + yScale.bandwidth()/2)
      .attr('y2', (d) => yScale(allSetIds[d.connectorIndices[1]]) + yScale.bandwidth()/2);


  /*
   * Set size chart
   */
  const setSizeAxis = d3.axisTop(setSizeScale);
  svg.append('g')
      .attr('transform', (d) => `translate(0, ${topRowHeight})`)
      .call(setSizeAxis);
  
  setSizeChart.selectAll('rect')
      .data(data.sets)
      .join('rect')
        .attr('class', 'bar')
        .attr('width', (d) => setSizeChartWidth - setSizeScale(d.size))
        .attr('height', yScale.bandwidth())
        .attr('x', (d) => setSizeScale(d.size))
        .attr('y', (d) => yScale(d.setId));

  setSizeChart.selectAll('.set-name')
      .data(data.sets)
      .join('text')
        .attr('class', 'set-name')
        .attr('text-anchor', 'middle')
        .attr('x', leftColWidth - setIdWidth/2)
        .attr('y', (d) => yScale(d.setId) + yScale.bandwidth()/2)
        .attr('dy', '0.35em')
        .text((d) => d.setId);


  /*
   * Intersection size chart
   */
  
  const intersectionSizeAxis = d3.axisLeft(intersectionSizeScale)
      .ticks(3);

  intersectionSizeChart.append('g')
      .attr('transform', (d) => `translate(${-innerMargin},0)`)
      .call(intersectionSizeAxis);
  
  intersectionSizeChart.selectAll('rect')
      .data(data.combinations)
      .join('rect')
        .attr('class', 'bar')
        .attr('height', (d) => topRowHeight - intersectionSizeScale(d.values.length))
        .attr('width', xScale.bandwidth())
        .attr('x', (d) => xScale(d.combinationId))
        .attr('y', (d) => intersectionSizeScale(d.values.length))
        .on('mouseover', (event,d) => {
          d3.select('#tooltip')
            .style('opacity', 1)
            .html(d.values.join('<br/>'));
        })
        .on('mousemove', (event) => {
          d3.select('#tooltip')
            .style('left', (event.pageX + tooltipMargin) + 'px')   
            .style('top', (event.pageY + tooltipMargin) + 'px')
        })
        .on('mouseout', () => {
          d3.select('#tooltip').style('opacity', 0);
        });

  /*
   * Axis titles
   */
  svg.append('text')
      .attr('class', 'axis-title')
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('y', topRowHeight - 30)
      .attr('x', setSizeChartWidth / 2)
      .text('Set Size');

  svg.append('text')
      .attr('transform', `translate(${leftColWidth - innerMargin - 30}, ${topRowHeight / 2}) rotate(-90)`)
      .attr('class', 'axis-title')
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text('Intersection Size');
}
