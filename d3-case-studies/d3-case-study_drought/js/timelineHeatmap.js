class TimelineHeatmap {

  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1100,
      containerHeight:1100,
      margin: {top: 15, right: 20, bottom: 20, left: 5},
      legendWidth: 250,
      legendTitleHeight: 12,
      legendBarHeight: 14,
      palmerCategories: ['0','1','2','3','4','5','6'],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
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

    // Define the size of the SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chartArea = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Empty group for the legend
    vis.legend = vis.chartArea.append('g')
        .attr('transform', `translate(${vis.config.width - vis.config.legendWidth},0)`);

    // Empty group for all the stacked bar charts
    vis.chart = vis.chartArea.append('g');

    // Rectangle with black outline that we will later use to highlight a month on mouseover
    vis.highlightRect = vis.chartArea.append('rect')
        .attr('class', 'highlight-rect')
        .style('display', 'none');

    // Initialize categorical scales for small multiples (grid)
    vis.xGridScale = d3.scaleBand()
        .domain(getArrayRange(9))
        .range([0, vis.config.width])
        .paddingInner(0.01);

    vis.yGridScale = d3.scaleBand()
        .range([0, vis.config.height])
        .paddingInner(0.5);

    // Initialize linear scales for stacked bar charts
    vis.xScale = d3.scaleLinear()
        .domain([1,13])
        .range([0, vis.xGridScale.bandwidth()]);

    vis.yScale = d3.scaleLinear()
        .domain([0,1]);

    // Initialize stack generator
    vis.stack = d3.stack()
        .keys(vis.config.palmerCategories);

    // Initialize area path generator
    vis.area = d3.area()
        .x((d,i) => vis.xScale(d.data.month))
        .y0(d => vis.yScale(d[0]))
        .y1(d => vis.yScale(d[1]))
        .curve(d3.curveStepAfter);
    
    vis.renderLegend();
    vis.updateVis();
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;

    // Group data per year (we get a nested array)
    // [['2013', [array with values]], ['2012', [array with values]], ...]
    vis.groupedData = d3.groups(vis.data, d => d.year);
    
    // Loop through years
    vis.groupedData.forEach(d => {
      // Copy last month. A trick that is needed to create an area chart
      // Copy January in case of 2013, otherwise copy December
      if (d[0] == 2013) {
        const monthCopy = Object.assign({}, d[1][0]);
        monthCopy.month = 2;
        d[1].push(monthCopy);
      } else {
        const monthCopy = Object.assign({}, d[1][11]);
        monthCopy.month = 13;
        d[1].push(monthCopy);
      }
      // Apply stack generator
      d[2] = vis.stack(d[1]);
    });
    
    // Update scales
    vis.yGridScale.domain(getArrayRange(d3.max(vis.data, d => d.row)));
    vis.yScale.range([vis.yGridScale.bandwidth(), 0]);

    vis.renderVis();
  }

  /**
   * Bind data to visual elements.
   */
  renderVis() {
    let vis = this;

    vis.highlightRect.attr('width', vis.xGridScale.bandwidth()/12);

    // 1. Level: Small multiples
    // Bind data to selection and use the year (d[0]) as a key
    const yearGroup = vis.chart.selectAll('.year-group')
          .data(vis.groupedData, d=> d[0]);

    // Enter
    const yearGroupEnter = yearGroup.enter().append('g')
        .attr('class', 'year-group');

    // Enter + update
    yearGroupEnter.merge(yearGroup)
        .attr('transform', d => `translate(${vis.xGridScale(d[1][0].col)},${vis.yGridScale(d[1][0].row)})`)
    
    // Exit
    yearGroupEnter.exit().remove();

    // Append year label
    yearGroupEnter.append('text')
        .attr('class', 'year-label')
        .classed('decade', d => !(parseInt(d[0]) % 10))
        .attr('y', vis.yGridScale.bandwidth() + 10)
        .attr('dy', '0.35em')
        .text(d => d[0]);

    // 2. Level: Stacked area charts
    const categoryPath = yearGroup.merge(yearGroupEnter).selectAll('.year-area')
        .data(d => d[2]);

    // Add class for the 7 Palmer drought categories
    // We will use it in CSS to set the fill colour
    const categoryPathEnter = categoryPath.enter().append('path')
        .attr('class', d => `year-area cat cat-${d.key}`);

    // Call area path generator 
    categoryPathEnter.merge(categoryPath)
        .attr('d', vis.area);

    // Append percentage label
    yearGroupEnter.append('text')
        .attr('class', 'percent-label')
        .attr('dy', '0.35em')
        .attr('y', -8)
        .style('display', 'none');

    // Append transparent overlay that we will use to track the mouse position
    yearGroupEnter.append('rect')
        .attr('class', 'year-overlay')
        .attr('width', d => {
          // Special case because only 1 month of data is available
          if (d[0] == 2013) {
            return vis.xGridScale.bandwidth()/12;
          } else {
            return vis.xGridScale.bandwidth();
          }
        })
        .attr('height', vis.yGridScale.bandwidth())
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseover', function(event,d) {
          vis.highlightRect.style('display', 'block');
        })
        .on('mousemove', function(event,d) {
          // Get month that corresponds to current mouse x-coordinate
          const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
          const month = Math.min(vis.xScale.invert(xPos), 12);
          const monthIndex = parseInt(month - 1);

          // Sum drought category values for the current month
          const monthData = d[1][monthIndex];
          const sumForMonth = monthData['0'] + monthData['1'] + monthData['2'];
          const ySumForMonth = vis.yScale(sumForMonth);

          // Update highlight rectangle
          vis.highlightRect
              .attr('transform', `translate(${vis.xGridScale(monthData.col)},${vis.yGridScale(monthData.row)})`)
              .attr('x', vis.xScale(parseInt(month)))
              .attr('y', ySumForMonth)
              .attr('height', vis.yGridScale.bandwidth() - ySumForMonth);

          // Add abbreviated month to year text label
          d3.select(this.parentNode).select('.year-label')
              .text(`${vis.config.months[monthIndex]} ${d[0]}`);
          
          // Add tooltip text label
          d3.select(this.parentNode).select('.percent-label')
              .attr('x', vis.xScale(parseInt(month)))
              .text(`${Math.round(sumForMonth*100)}%`)
              .style('display', 'block');
        })
        .on('mouseout', function(event,d) {
          // Hide elements, reset to default state
          vis.highlightRect.style('display', 'none');
          d3.select(this.parentNode).select('.year-label')
              .text(d[0]);

          d3.select(this.parentNode).select('.percent-label')
              .style('display', 'none');
        });


    // Annotations
    const yearGroup2013Enter = yearGroupEnter.filter(d => d[0] == 2013);

    yearGroup2013Enter.append('foreignObject')
        .attr('x', 18)
        .attr('width', 360)
        .attr('height', 40)
      .append('xhtml:body')
        .style('font', ".7rem 'Helvetica Neue'")
        .html('During January, 56% of the contiguous U.S. was in moderate to extreme drought, the highest January level since 1955.');
    
    yearGroup2013Enter.append('line')
        .attr('class', 'annotation-line')
        .attr('x1', vis.xGridScale.bandwidth()/12)
        .attr('x2', vis.xGridScale.bandwidth()/12 + 10)
        .attr('y1', vis.yGridScale.bandwidth()/2)
        .attr('y2', vis.yGridScale.bandwidth()/2);
  }

  /**
   * Add categorical colour legend
   */
  renderLegend() {
    const vis = this;

    // Inititalize categorical scale
    const xLegendScale = d3.scaleBand()
        .domain(vis.config.palmerCategories)
        .range([0, vis.config.legendWidth])
        .paddingInner(0);

    // Add coloured rectangles
    vis.legend.selectAll('.legend-element')
          .data(vis.config.palmerCategories)
        .join('rect')
          .attr('class', d => `legend-element cat cat-${d}`)
          .attr('width', xLegendScale.bandwidth())
          .attr('height', vis.config.legendBarHeight)
          .attr('x', d => xLegendScale(d))
          .attr('y', vis.config.legendTitleHeight)
          .on('mouseover', (event,d) => {
            d3.selectAll(`.cat:not(.cat-${d})`).classed('inactive', true);
          })
          .on('mouseout', () => {
            d3.selectAll(`.cat`).classed('inactive', false);
          });

    // Add legend title
    vis.legend.append('text')
        .attr('class', 'legend-title')
        .attr('dy', '0.35em')
        .text('Dryness based on the Palmer Drought Index');

    const legendAxisYPos = vis.config.legendTitleHeight + vis.config.legendBarHeight + 5;

    // Add legend axis
    vis.legend.append('text')
        .attr('class', 'legend-axis-text')
        .attr('dy', '0.75em')
        .attr('y', legendAxisYPos)
        .attr('x', xLegendScale('3') - 10)
        .attr('text-anchor', 'end')
        .text('← Drier');

    vis.legend.append('text')
        .attr('class', 'legend-axis-text')
        .attr('dy', '0.75em')
        .attr('y', legendAxisYPos)
        .attr('x', xLegendScale('4') + 10)
        .text('Wetter →');

    vis.legend.append('text')
        .attr('class', 'legend-axis-text')
        .attr('dy', '0.75em')
        .attr('y', legendAxisYPos)
        .attr('x', vis.config.legendWidth / 2)
        .attr('text-anchor', 'middle')
        .text('Avg.');

    vis.legend.selectAll('.legend-line')
          .data(['3','4'])
        .join('line')
          .attr('class', 'legend-line')
          .attr('x1', d => xLegendScale(d))
          .attr('x2', d => xLegendScale(d))
          .attr('y1', d => vis.config.legendTitleHeight)
          .attr('y2', d => vis.config.legendTitleHeight + (vis.config.legendBarHeight * 2));

    // Add caption
    vis.legend.append('text')
        .attr('class', 'legend-caption')
        .attr('dy', '0.75em')
        .attr('y', legendAxisYPos + 20)
        .attr('x', vis.config.legendWidth / 2)
        .attr('text-anchor', 'middle')
        .text('Roll mouse over to isolate categories');
  }
}