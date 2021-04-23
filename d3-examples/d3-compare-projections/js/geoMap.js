class GeoMap {

  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 600,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || {top: 0, right: 0, bottom: 0, left: 0},
      projection: _config.projection || d3.geoMercator()
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
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    //const projection = d3.geoMercator.fitSize([width, height], object);
    //vis.projection = d3.geoConicEqualArea();
    vis.geoPath = d3.geoPath().projection(vis.config.projection);

    vis.renderVis();
  }


  /**
   * Bind data to visual elements.
   */
  renderVis() {
    let vis = this;

    // Convert compressed TopoJSON to GeoJSON format
    const provinces = topojson.feature(vis.data, vis.data.objects.provinces)

    // Defines the scale of the projection so that the geometry fits within the SVG area
    vis.config.projection.fitSize([vis.width, vis.height], provinces);

    // Append shapes of Canadian provinces
    const geoPath = vis.chart.selectAll('.geo-path')
        .data(provinces.features)
      .join('path')
        .attr('class', 'geo-path')
        .attr('d', vis.geoPath);

    // Add an additional layer on top of the map to show the province borders more clearly
    // We use the helper function 'topojson.mesh'
    const geoBoundaryPath = vis.chart.selectAll('.geo-boundary-path')
        .data([topojson.mesh(vis.data, vis.data.objects.provinces)])
      .join('path')
        .attr('class', 'geo-boundary-path')
        .attr('d', vis.geoPath);
  }
}