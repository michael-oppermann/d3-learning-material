class ScrollerVis {

  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 400,
      containerHeight: 600,
      cellWidth: 18,
      cellHeight: 18,
      cellSpacing: 12,
      yAxisWidth: 150,
      barHeight: 18,
      barSpacing: 4,
      margin: {top: 5, right: 30, bottom: 5, left: 5},
      steps: ['step0', 'step1', 'step2', 'step3', 'step4']
    }
    this.data = _data;
    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    // Identify hikes with the longest distance
    const dataTop15 = [...vis.data].sort((a,b) => b.distance - a.distance).slice(0,15);
    const namesTop15 = dataTop15.map(d => d.trail);
    vis.data.forEach(d => {
      d.rank = namesTop15.indexOf(d.trail);
    });

    vis.dataLongestHike = [...vis.data].sort((a,b) => b.time - a.time)[0];

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.config.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.xScale = d3.scaleLinear()
        .range([0, vis.config.width-vis.config.yAxisWidth])
        .domain([0, d3.max(dataTop15, d => d.distance)]);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Initialize scales
    vis.colorScale = d3.scaleOrdinal()
        .range(['#78ab9c', '#e2cc00', '#c5eadf'])
        .domain(['default','highlighted', 'inactive']);

    // Calculate number of columns and rows for the grid layout
    vis.config.columns = Math.floor(vis.config.width / (vis.config.cellWidth + vis.config.cellSpacing));
    vis.config.rows = Math.ceil(vis.data.length / vis.config.columns);

    // Bind data to rectangles but don't specify any attributes yet
    vis.rect = vis.chart.selectAll('rect')
        .data(data, d => d.name).join('rect');

    // Call first step
    vis.step0();
  }
  step0() {
    const vis = this;

    // Arrange rectangles in grid layout and set a default colour
    vis.rect.transition()
        .attr('fill', vis.colorScale('default'))
        .attr('width', d => vis.config.cellWidth)
        .attr('height', d => vis.config.cellHeight)
        .attr('x', (d, i) => i % vis.config.columns * (vis.config.cellWidth + vis.config.cellSpacing))
        .attr('y', (d, i) => Math.floor(i / vis.config.columns) % vis.config.rows * (vis.config.cellHeight + vis.config.cellSpacing));
  }

  step1() {
    const vis = this;

    // Change the colour of some rectangles to highlight them
    vis.rect.transition()
        .attr('fill', d => d.difficulty=='Easy' ? vis.colorScale('highlighted') : vis.colorScale('default'));
  }

  step2() {
    const vis = this;

    // Change the colour of other rectangles
    vis.rect.transition()
        .attr('fill', d => d.difficulty=='Difficult' ? vis.colorScale('highlighted') : vis.colorScale('default'));
  }

  step3() {
    const vis = this;
    
    // Highlight one trail
    // Important: We also need to update the width, height, etc because these attributes are
    // getting changed in step4() and we want to allow users to scroll up and down.
    vis.rect.transition()
        .attr('opacity', 1)
        .attr('fill', d => d.trail==vis.dataLongestHike.trail ? vis.colorScale('highlighted') : vis.colorScale('inactive'))
        .attr('width', d => vis.config.cellWidth)
        .attr('height', d => vis.config.cellHeight)
        .attr('x', (d, i) => i % vis.config.columns * (vis.config.cellWidth + vis.config.cellSpacing))
        .attr('y', (d, i) => Math.floor(i / vis.config.columns) % vis.config.rows * (vis.config.cellHeight + vis.config.cellSpacing));

    if (vis.textG) vis.textG.remove();
  }

  step4() {
    const vis = this;

    vis.rect
        .attr('fill', vis.colorScale('default'))
      .transition().duration(500)
        .attr('opacity', 0)
      .filter(d => d.rank >= 0)
        .attr('opacity', 1)
        .attr('x', vis.config.yAxisWidth)
        .attr('y', d => d.rank * (vis.config.barHeight + vis.config.barSpacing))
        .attr('height', d => vis.config.barHeight)
        .attr('width', d => vis.xScale(d.distance));

    vis.textG = vis.chart.selectAll('g')
        .data(vis.data.filter(d => d.rank >= 0))
      .join('g')
        .attr('opacity', 0)
        .attr('transform', d => `translate(${vis.config.yAxisWidth},${d.rank * (vis.config.barHeight + vis.config.barSpacing)})`);

    vis.textG.append('text')
        .attr('class', 'chart-label chart-label-name')
        .attr('text-anchor', 'end')
        .attr('dy', '0.35em')
        .attr('x', -3)
        .attr('y', vis.config.barHeight/2)
        .text(d => d.trail);

    vis.textG.append('text')
        .attr('class', 'chart-label chart-label-val')
        .attr('dy', '0.35em')
        .attr('x', 5)
        .attr('y', vis.config.barHeight/2)
        .text(d => d.distance);

    vis.textG.transition().duration(800)
        .attr('opacity', 1);
  }
  
  goToStep(stepIndex) {
    this[this.config.steps[stepIndex]]();
  }
}