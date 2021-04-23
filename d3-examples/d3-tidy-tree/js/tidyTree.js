class TidyTree {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 600,
      containerHeight: 260,
      margin: {top: 10, right: 100, bottom: 10, left: 100}
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

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.updateVis();
  }

  /**
   * Prepare the data before we render it
   */
  updateVis() {
    let vis = this;

    vis.data = d3.hierarchy(vis.data);
    vis.treeData = d3.tree().size([vis.config.height, vis.config.width])(vis.data);
    
    vis.renderVis();
  }

  /**
   * Bind data to visual elements.
   */
  renderVis() {
    let vis = this;

    // Draw the edges
    const link = vis.chart.selectAll('path')
        .data(vis.treeData.links())
      .join('path')
        .attr('class', 'edge')
        .attr('d', d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));
      
    // Draw the nodes
    const node = vis.chart.selectAll('g')
        .data(vis.treeData.descendants())
      .join('g')
        .attr('transform', d => `translate(${d.y},${d.x})`);

    node.append('circle')
        .attr('class', 'node-circle')
        .attr('r', 2.5);

    node.append('text')
        .attr('dy', '0.31em')
        .attr('x', d => d.children ? -6 : 6)
        .attr('text-anchor', d => d.children ? 'end' : 'start')
        .text(d => d.data.name);
  }
}