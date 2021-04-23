class Scatterplot {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 600,
      containerHeight: 400,
      margin: {top: 5, right: 5, bottom: 50, left: 50},
      tooltipPadding: 15,
      radius: 2
    }
    this.data = _data;
    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.config.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Parent div container
    vis.container = d3.select(vis.config.parentElement);

    // Add Canvas layer
    vis.canvas = vis.container.append('canvas')
        .attr('class', 'vis-layer')
        .attr('width', vis.config.width)
        .attr('height', vis.config.height)
        .style('transform', `translate(${vis.config.margin.left}px,${vis.config.margin.top}px)`);

    vis.canvasContext = vis.canvas.node().getContext('2d');

    // Add SVG layer
    vis.svg = vis.container.append('svg')
        .attr('class', 'vis-layer')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.config.height})`);
    
    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

    // Initialize scales
    vis.colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    vis.xScale = d3.scaleLinear()
        .range([0, vis.config.width]);

    vis.yScale = d3.scaleLinear()
        .range([vis.config.height, 0]);
    
    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        .tickPadding(10);

    vis.yAxis = d3.axisLeft(vis.yScale)
        .tickPadding(10);
    
    vis.updateVis();
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;
    
    // Set the scale input domains
    vis.xScale.domain(d3.extent(vis.data, d => d.x));
    vis.yScale.domain(d3.extent(vis.data, d => d.y));
    vis.colorScale.domain(d3.extent(vis.data, d => d.category));

    vis.renderVis();
  }

  /**
   * Bind data to visual elements.
   */
  renderVis() {
    let vis = this;

    // Clear canvas and draw points
    vis.canvasContext.clearRect(0, 0, vis.config.width, vis.config.height);
    vis.data.forEach(d => vis.renderPoint(d));
    
    // Update the axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }

  renderPoint(point) {
    let vis = this;

    // Compute position of current point
    const cx = vis.xScale(point.x);
    const cy = vis.yScale(point.y);

    // The ordinal colour scale returns a hex-code but we want an rgba format so we use d3.color()
    let pointColor = d3.color(vis.colorScale(point.category));
    pointColor.opacity = 0.05;

    // Set the data-dependent colour
    vis.canvasContext.fillStyle = pointColor;
    
    // Draw point
    vis.canvasContext.beginPath();
    vis.canvasContext.moveTo(cx + vis.config.radius, cy);
    vis.canvasContext.arc(cx, cy, vis.config.radius, 0, 2 * Math.PI);
    vis.canvasContext.fill();
  }
}