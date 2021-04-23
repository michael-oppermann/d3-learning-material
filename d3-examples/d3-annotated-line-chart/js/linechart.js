class LineChart {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1100,
      containerHeight: 400,
      margin: {top: 40, right: 15, bottom: 25, left: 50}
    }
    this.data = _data;
    this.initVis();
  }
  
  /**
   * Initialize scales/axes and create SVG area
   */
  initVis() {
    let vis = this;

    vis.config.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.xScale = d3.scaleTime()
        .range([0, vis.config.width]);

    vis.yScale = d3.scaleLinear()
        .range([vis.config.height, 0])
        .nice();

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(9)
        .tickSizeOuter(0);

    vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(5)
        .tickSizeOuter(0)
        .tickFormat(d => `$ ${d}`);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart (see margin convention)
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.config.height})`);
    
    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

    vis.annotationsG = vis.chart.append('g');
  
    vis.updateVis();
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;
    
    vis.xValue = d => d.Date;
    vis.yValue = d => d.Close;

    vis.line = d3.line()
        .x(d => vis.xScale(vis.xValue(d)))
        .y(d => vis.yScale(vis.yValue(d)));

    // Set the scale input domains
    vis.xScale.domain(d3.extent(vis.data, vis.xValue));
    vis.yScale.domain(d3.extent(vis.data, vis.yValue));

    // Define annotations
    vis.annotationSpecification = [
      {
        note: { label: 'iMac Release' },
        className: 'dashed',
        subject: {
          y1: 0,
          y2: vis.config.height
        },
        disable: ['connector'],
        dy: -vis.config.height, // Show text label at the top of the chart
        data: { Date: '8/15/1998'}
      },
      {
        note: { label: 'iPod Release'},
        className: 'dashed',
        subject: {
          y1: 0,
          y2: vis.config.height
        },
        disable: ['connector'],
        dy: -vis.config.height, // Show text label at the top of the chart
        data: { Date: '10/23/2001'}
      },
      {
        note: {
          label: 'Stock Split 2:1', 
          lineType:'none', 
          orientation: 'leftRight', 
          align: 'middle'
        },
        className: 'anomaly',
        type: d3.annotationCalloutCircle,
        subject: { radius: 60 },
        data: { Date: '6/21/2000', Close: 76},
        dx: 70
      },
      {
        note: { label: 'Above $100', wrap: 100, },
        disable: ['connector'],
        subject: {
          x1: vis.xScale( new Date('10/1/1999')),
          x2: vis.xScale( new Date('8/1/2000'))
        },
        dx: -30,
        data: { Date: '10/1/1999', Close: 100 }
      }
    ];

    // Define base annotation type that may get overriden for some elements by the annotation specification
    vis.baseAnnotationType = d3.annotationCustomType(d3.annotationXYThreshold, {
      'note': {
          'lineType':'none',
          'orientation': 'top',
          'align':'middle'
      }
    });

    // Generate the annotation based on the given specifications
    vis.makeAnnotations = d3.annotation()
        .type(vis.baseAnnotationType)
        .accessors({ 
          x: d => vis.xScale(new Date(d.Date)),
          y: d => vis.yScale(d.Close)
        })
        .annotations(vis.annotationSpecification)
        .textWrap(30);

    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    let vis = this;

    // Add line path
    vis.chart.selectAll('.chart-line')
        .data([vis.data])
      .join('path')
        .attr('class', 'chart-line')
        .attr('d', vis.line);

    // Add annotation elements to the SVG
    vis.annotationsG.call(vis.makeAnnotations);
    
    // Update the axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}