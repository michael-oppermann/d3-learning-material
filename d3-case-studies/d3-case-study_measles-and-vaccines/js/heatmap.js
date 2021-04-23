class Heatmap {

  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      vaccineIntroduced: _config.vaccineIntroduced,
      containerWidth: 1100,
      containerHeight: 800,
      tooltipPadding: 15,
      margin: {top: 60, right: 20, bottom: 20, left: 45},
      legendWidth: 160,
      legendBarHeight: 10
    }
    this.data = _data;
    this.initVis();
  }
  
  /**
   * We create the SVG area, initialize scales/axes, and append static elements
   */
  initVis() {
    const vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.config.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chartArea = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.chart = vis.chartArea.append('g');

    // Add vaccine annotation
    vis.vaccineLine = vis.chartArea.append('line')
        .attr('class', 'vaccine-line');

    vis.vaccineLabel = vis.chartArea.append('text')
        .attr('class', 'vaccine-label')
        .attr('text-anchor', 'middle')
        .attr('y', -20)
        .attr('dy', '0.85em')
        .text('Vaccine introduced');

    // Initialize scales
    vis.colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateReds);

    vis.xScale = d3.scaleLinear()
        .range([0, vis.config.width]);

    vis.yScale = d3.scaleBand()
        .range([0, vis.config.height])
        .paddingInner(0.2);

    // Initialize x-axis
    vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(6)
        .tickSize(0)
        .tickFormat(d3.format('d')) // Remove comma delimiter for thousands
        .tickPadding(10);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chartArea.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.config.height})`);

    // Legend
    vis.legend = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.containerWidth - vis.config.legendWidth - vis.config.margin.right},0)`);

    vis.legendColorGradient = vis.legend.append('defs').append('linearGradient')
        .attr('id', 'linear-gradient');

    vis.legendColorRamp = vis.legend.append('rect')
        .attr('width', vis.config.legendWidth)
        .attr('height', vis.config.legendBarHeight)
        .attr('fill', 'url(#linear-gradient)');

    vis.xLegendScale = d3.scaleLinear()
        .range([0, vis.config.legendWidth]);

    vis.xLegendAxis = d3.axisBottom(vis.xLegendScale)
        .tickSize(vis.config.legendBarHeight + 3)
        .tickFormat(d3.format('d'));

    vis.xLegendAxisG = vis.legend.append('g')
        .attr('class', 'axis x-axis legend-axis');

    vis.updateVis();
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    const vis = this;

    // Group data per state (we get a nested array)
    // [['Alaska', [array with values]], ['Ala.', [array with values]], ...]
    vis.groupedData = d3.groups(vis.data, d => d.state);

    // Sort states by total case numbers (if the option is selected by the user)
    if (vis.config.sortOption == 'cases') {
      // Sum the case numbers for each state
      // d[0] is the state name, d[1] contains an array of yearly values
      vis.groupedData.forEach(d => {
        d[3] = d3.sum(d[1], k => k.value);
      });

      // Descending order
      vis.groupedData.sort((a,b) => b[3] - a[3]);
    }
    
    // Specificy accessor functions
    vis.yValue = d => d[0];
    vis.colorValue = d => d.value;
    vis.xValue = d => d.year;
   
    // Set the scale input domains
    vis.colorScale.domain(d3.extent(vis.data, vis.colorValue));
    vis.xScale.domain(d3.extent(vis.data, vis.xValue));
    vis.yScale.domain(vis.groupedData.map(vis.yValue));
    
    vis.renderVis();
    vis.renderLegend();
  }

  /**
   * Bind data to visual elements.
   */
  renderVis() {
    const vis = this;

    const cellWidth = (vis.config.width / (vis.xScale.domain()[1] - vis.xScale.domain()[0])) - 2;
    
    // 1. Level: rows
    const row = vis.chart.selectAll('.h-row')
        .data(vis.groupedData, d=> d[0]);

    // Enter
    const rowEnter = row.enter().append('g')
        .attr('class', 'h-row');

    // Enter + update
    rowEnter.merge(row)
      .transition().duration(1000)
        .attr('transform', d => `translate(0,${vis.yScale(vis.yValue(d))})`);

    // Exit
    row.exit().remove();

    // Append row label (y-axis)
    rowEnter.append('text')
        .attr('class', 'h-label')
        .attr('text-anchor', 'end')
        .attr('dy', '0.85em')
        .attr('x', -8)
        .text(vis.yValue);


    // 2. Level: columns

    // 2a) Actual cells
    const cell = row.merge(rowEnter).selectAll('.h-cell')
        .data(d => d[1]);

    // Enter
    const cellEnter = cell.enter().append('rect')
        .attr('class', 'h-cell');

    // Enter + update
    cellEnter.merge(cell)
        .attr('height', vis.yScale.bandwidth())
        .attr('width', cellWidth)
        .attr('x', d => vis.xScale(vis.xValue(d)))
        .attr('fill', d => {
          if (d.value === 0 || d.value === null) {
            return '#fff';
          } else {
            return vis.colorScale(vis.colorValue(d));
          }
        })
        .on('mouseover', (event,d) => {
          const value = (d.value === null) ? 'No data available' : Math.round(d.value * 100) / 100;
          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
            .html(`
              <div class='tooltip-title'>${d.state}</div>
              <div>${d.year}: <strong>${value}</strong></div>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });

    // 2b) Diagonal lines for NA values
    const cellNa = row.merge(rowEnter).selectAll('.h-cell-na')
        .data(d => d[1].filter(k => k.value === null));

    const cellNaEnter = cellNa.enter().append('line')
        .attr('class', 'h-cell-na');

    cellNaEnter.merge(cellNa)
        .attr('x1', d => vis.xScale(vis.xValue(d)))
        .attr('x2', d => vis.xScale(vis.xValue(d)) + cellWidth)
        .attr('y1', vis.yScale.bandwidth())
        .attr('y2', 0);

    // Set the positions of the annotations
    const xVaccineIntroduced = vis.xScale(vis.config.vaccineIntroduced);
    vis.vaccineLine
        .attr('x1', xVaccineIntroduced)
        .attr('x2', xVaccineIntroduced)
        .attr('y1', -5)
        .attr('y2', vis.config.height);

    vis.vaccineLabel.attr('x', xVaccineIntroduced);
    
    // Update axis
    vis.xAxisG.call(vis.xAxis);
  }

  /**
   * Update colour legend
   */
  renderLegend() {
    const vis = this;

    // Add stops to the gradient
    // Learn more about gradients: https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient
    vis.legendColorGradient.selectAll('stop')
        .data(vis.colorScale.range())
      .join('stop')
        .attr('offset', (d,i) => i/(vis.colorScale.range().length-1))
        .attr('stop-color', d => d);

    // Set x-scale and reuse colour-scale because they share the same domain
    // Round values using `nice()` to make them easier to read.
    vis.xLegendScale.domain(vis.colorScale.domain()).nice();
    const extent = vis.xLegendScale.domain();

    // Manually calculate tick values
    vis.xLegendAxis.tickValues([
      extent[0],
      parseInt(extent[1]/3),
      parseInt(extent[1]/3*2),
      extent[1]
    ]);

    // Update legend axis
    vis.xLegendAxisG.call(vis.xLegendAxis);
  }
}