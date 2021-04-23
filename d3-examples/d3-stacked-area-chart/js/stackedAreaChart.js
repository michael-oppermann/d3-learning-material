class StackedAreaChart {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 800,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || {top: 25, right: 12, bottom: 30, left: 100},
      displayType: 'absolute'
    }
    this.data = _data;
    this.initVis();
  }
  
  /**
   * Initialize scales/axes and append static chart elements
   */
  initVis() {
    let vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.xScale = d3.scaleLinear()
        .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.colorScale = d3.scaleOrdinal()
        .range(['#6080b5', '#5a9866', '#f7dc7a']);
    

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        .tickFormat(d3.format("d")); // Remove thousand comma

    vis.yAxis = d3.axisLeft(vis.yScale)
        .tickSize(-vis.width)
        .tickPadding(10);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart (see margin convention)
    vis.chartContainer = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.chart = vis.chartContainer.append('g');

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
    
    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

    vis.stack = d3.stack()
        .keys([0,1,2]);

    vis.axisTitle = vis.chartContainer.append('text')
        .attr('class', 'axis-label')
        .attr('y', -18)
        .attr('x', -25)
        .attr('dy', '0.35em')
        .text('Trillion m³');

    /*
    // We need to make sure that the tracking area is on top of other chart elements
    vis.marks = vis.chart.append('g');
    vis.trackingArea = vis.chart.append('rect')
        .attr('width', vis.width)
        .attr('height', vis.height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all');

        //(event,d) => {

    // Empty tooltip group (hidden by default)
    vis.tooltip = vis.chart.append('g')
        .attr('class', 'tooltip')
        .style('display', 'none');

    vis.tooltip.append('text');
    */
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;

    // Group the data per year
    vis.groupedData = d3.groups(vis.data, d => d.year);

    // Prepare the data for rendering
    if (vis.config.displayType == 'absolute') {
      vis.stack.value((d,key) => d[1][key].freshwater_use);
    } else {
      // Calculate relative contribution (in %) of each region per year
      // 1. loop through years
      vis.groupedData.forEach(g => {
        // 2. Sum of current year
        const yearSum = d3.sum(g[1], d => d.freshwater_use);
        // 3. Get percentage of each region
        g[1].forEach(d => {
          d.freshwater_use_relative = d.freshwater_use/yearSum*100;
        });
      });

      vis.stack.value((d,key) => d[1][key].freshwater_use_relative);
    }
    vis.stackedData = vis.stack(vis.groupedData);

    vis.area = d3.area()
        .x((d,i) => vis.xScale(d.data[0]))
        .y0(d => vis.yScale(d[0]))
        .y1(d => vis.yScale(d[1]))
        //.curve(d3.curveStepAfter);

    // Set the scale input domains
    vis.xScale.domain(d3.extent(vis.data, d => d.year));
    vis.colorScale.domain([0,1,2]);

    if (vis.config.displayType == 'absolute') {
      vis.yScale.domain([0, d3.max(vis.stackedData[vis.stackedData.length - 1], d => d[1])]);
      vis.yAxis.tickFormat(d => d/1000);
    } else {
      vis.yScale.domain([0, 100]);
      vis.yAxis.tickFormat(d => `${d}%`);
    }

    vis.renderVis();
  }

  /**
   * This function contains the D3 code for binding data to visual elements
   * Important: the chart is not interactive yet and renderVis() is intended
   * to be called only once; otherwise new paths would be added on top
   */
  renderVis() {
    let vis = this;

    // Add line path
    vis.chart.selectAll('.area-path')
        .data(vis.stackedData)
      .join('path').transition()
        .attr('class', 'area-path')
        .attr('d', vis.area)
        .attr('fill', d => vis.colorScale(d.key));

    vis.axisTitle.style('display', vis.config.displayType == 'absolute' ? 'block' : 'none');
    /*
    vis.trackingArea
        .on('mouseenter', () => {
          vis.tooltip.style('display', 'block');
        })
        .on('mouseleave', () => {
          vis.tooltip.style('display', 'none');
        })
        .on('mousemove', function(event) {
          // Get date that corresponds to current mouse x-coordinate
          const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
          const date = vis.xScale.invert(xPos);

          // Find nearest data point
          const index = vis.bisectDate(vis.data, date, 1);
          const a = vis.data[index - 1];
          const b = vis.data[index];
          const d = b && (date - a.date > b.date - date) ? b : a; 

          // Update tooltip
          vis.tooltip.select('circle')
              .attr('transform', `translate(${vis.xScale(d.date)},${vis.yScale(d.close)})`);
          
          vis.tooltip.select('text')
              .attr('transform', `translate(${vis.xScale(d.date)},${(vis.yScale(d.close) - 15)})`)
              .text(Math.round(d.close));
        });
    */
    // Update the axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}