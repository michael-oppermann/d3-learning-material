class ForceDirectedGraph {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 600,
      containerHeight: 600,
      margin: {top: 25, right: 20, bottom: 20, left: 35}
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

    // Initialize scales
    vis.colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Initialize force simulation
    vis.simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(vis.config.width / 2, vis.config.height / 2));

    vis.updateVis();
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;

    // Add node-link data to simulation
    vis.simulation.nodes(vis.data.nodes);
    vis.simulation.force('link').links(vis.data.links);

    vis.colorScale.domain(vis.data.nodes.map(d => d.group));
    
    vis.renderVis();
  }

  /**
   * Bind data to visual elements.
   */
  renderVis() {
    let vis = this;

    // Add links
    const links = vis.chart.selectAll('line')
        .data(vis.data.links, d => [d.source, d.target])
        .join('line');

    // Add nodes
    const nodes = vis.chart.selectAll('circle')
        .data(vis.data.nodes, d => d.id)
      .join('circle')
        .attr('r', 5)
        .attr('fill', d => vis.colorScale(d.id));

    // Update positions
    vis.simulation.on('tick', () => {
      links
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

      nodes
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
    });
  }
}