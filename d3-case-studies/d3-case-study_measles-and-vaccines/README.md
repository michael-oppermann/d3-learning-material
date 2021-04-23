# D3 Case Study: The Impact of Vaccines on the Measles

In this case study, we recreate a visualization that was created by Tynan DeBold and Dov Friedman and originally published in the Wall Street Journal as part of the article [Battling Infectious Diseases in the 20th Century](http://graphics.wsj.com/infectious-diseases-and-vaccines/). We will make minor style changes and extend the visualization slightly to walk you through some additional D3 features.

**You can see the full source code of this case study on [Github](https://github.com/UBC-InfoVis/2021-436V-case-studies/case-study_measles-and-vaccines/) and in the browser-based IDE [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-case-studies/case-study_measles-and-vaccines/).**

A screenshot of the final visualization is shown below. The heatmap illustrates how the first vaccine impacted the number of measles cases in the United States. 

* The rows denote the 50 states and the District of Columbia. The columns correspond to the time period from 1928 to 2011.
* The magnitude of cases per 100,000 people is visualized using the colour channel, and shown in a tooltip when users point their cursor on a specific cell.
* N/A values are shown with a grey diagonal line.
* Users can change the order of the states (rows) by using the dropdown box.
* A colour legend is shown in the top right corner.

![Result](resources/result.png?raw=true "Heatmap")

#### Outline

1. [Data](#data)
2. [D3 Project Setup & Page Layout](#project-setup)
3. [Load Data and Initialize Heatmap](#load-data)
4. [Create Heatmap](#create-heatmap)
5. [Add Vaccine Annotation, Tooltips, and a Legend](#annotation-tooltip-legend)
6. [Sort Rows in the Heatmap](#sort)
7. [Other Implementations and Resources](#implementations)

## 1. <a name="data">Data</a>

We download the infectious disease data from [Project Tycho](http://www.tycho.pitt.edu/). The original dataset contains historical data for seven diseases in the U.S. but we just want to visualize cases of measles, and thus filter the JSON file in an offline preprocessing step.

The final input data is in JSON format and stored in `measles_data.json`. It contains an array of objects, as shown in the excerpt below. The `value` attribute denotes the yearly number of cases per 100,000 people in each state.

```json
[
	{
		"year": 1928,
		"state": "Texas",
		"value": 97.33920705
	},
	{
		"year": 1928,
		"state": "Utah",
		"value": 16.76587302
	},
	...
]
```

In addition, we know that the first vaccine was introduced in **1963**, when John Enders and colleagues transformed their Edmonston-B strain of measles virus into a vaccine and licensed it in the United States (see [measles history](https://www.cdc.gov/measles/about/history.html)).


## 2. <a name="project-setup">D3 Project Setup & Page Layout</a>

We clone our [D3 starter template](https://github.com/UBC-InfoVis/d3-starter-template) that contains a very basic HTML boilerplate and the D3 v6 bundle. We add the dataset and create an empty file `heatmap.js` that will contain all the D3 code to bind the data to SVG elements. 

```
project/	
	index.html
	css/
		style.css
	js/
		d3.min.js
		heatmap.js
		main.js
	data/
		measles_data.json
```

Within `index.html`, we include the `heatmap.js` file, add some general information, and set up the page layout.

```html
<h1>The Impact of Vaccines on the Measles</h1>

<div id="heatmap-container" class="vis">
    <div class="caption">
        The heat map below shows the number of cases per 100,000 people.
        Sort states 
        <select id="sort-control">
            <option value="alphabetically">alphabetically</option>
            <option value="cases">by case numbers</option>
        </select>
    </div>
</div>
```

The general layout is simple because we have only a single view but positioning the caption in line with the colour legend adds some complexity. We decided to include the legend in the same SVG as the heatmap, and position it in the top right corner. However, the caption and the select box are plain HTML elements which need to be superimposed as a second layer on top of the SVG.

![Layout](resources/layout.png?raw=true "Layout")

We create a high-level container (`.vis`) and set it to `position: relative` in CSS. Inside, we create another container (`.caption`) and add the following CSS rule that positions it in the top left corner.

```css
.vis .caption {
  position: absolute;
  top: 0;
}
```

When we later add the SVG content to `.vis` the caption will be shown superimposed.

There are certainly many possible ways to achieve the desired result. You could also create a separate `<svg>`-element for the legend and create two columns in HTML, or you could embed the caption using `<foreignObject>` in a single SVG.

## 3. <a name="load-data">Load Data and Initialize Heatmap</a>

`main.js` acts as our controller: We load the external dataset and initialize the visualization class. Later, we will listen to select box changes and update the heatmap here. If we would have multiple linked views, we would orchestrate all events inside this file.

The D3 implementation of the heatmap is isolated in a JS class (`heatmap.js`). We pass a *config* object and the loaded data as parameters.

```js
d3.json('data/measles_data.json').then(data => {
  const heatmap = new Heatmap({
    parentElement: '#heatmap-container',
    vaccineIntroduced: 1963
  }, data);
});
```

## 4. <a name="create-heatmap">Create Heatmap</a>

### Class structure

We create the following class structure to divide the D3 code that gets executed only once from the code that gets called every time the data or display options are updated. 

In our specific example, the underlying data does not change and users can just change the sorting through a select box. Nevertheless, our goal is to implement the heatmap as flexible as possible. It should be relatively easy to add interactive filters or reuse the component to visualize other datasets (i.e., other diseases) in the future.

```js
class Heatmap {

  // Class constructor with initial configuration
  constructor(_config, _data) {
    this.config = {
    	// ...
    }
    // ...
    this.initVis();
  }
  
  // Create SVG area, initialize scales/axes, append static elements
  initVis() {
  	const vis = this;
  	// ...
  	vis.updateVis();
  }
  
  // Prepare the data and scales before we render it
  updateVis() {
  	const vis = this;
  	// ...
  	vis.renderVis();
  	vis.renderLegend();
  }
  
  // Bind data to visual elements
  renderVis() {
  	// ...
  }
  
  // Update colour legend
  renderLegend() {
  	// ...
  }
  
}
```

### Set up the SVG drawing area 

We use D3 to append an SVG element to the parent container and set its dimension.

```js
vis.svg = d3.select(vis.config.parentElement).append('svg')
	.attr('width', vis.config.containerWidth)
	.attr('height', vis.config.containerHeight);
```

We follow the [D3 Margin Convention](https://observablehq.com/@d3/margin-convention) and use a global margin object with individual spacings for all directions, as illustrated in the figure below. The variables `containerWidth` and `containerHeight` specify the overall drawing area while `width` and `height` specify the area that is used specifically for the heatmap cells. 

![Margins](resources/margins.png?raw=true "Margins")

We calculate the inner chart size and position an SVG `<group>` accordingly.

```js
vis.config.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

vis.chartArea = vis.svg.append('g')
	.attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
```

### Initialize scales and axes

We initialize three scales within the `initVis()` function:

1. **Colour scale**

	The original [WSJ visualization](http://graphics.wsj.com/infectious-diseases-and-vaccines/) uses a multi-hue non-sequential colour scale. This makes it easier to see smaller differences despite extreme outliers in some year but the user needs to lookup multiple colours in the legend, and it may even lead to misinterpretations. For a continous variable (i.e., measles cases), a single-hue sequential colour scale is a safer choice. We use the ["Reds" sequential colour scheme](https://github.com/d3/d3-scale-chromatic#interpolateReds) that is provided by D3:
	
	```js
	vis.colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateReds);
	```
	
2. **`x` scale**	
	
	Although the heatmap cells are arranged in a uniform-grid, we initialize a linear scale instead of a categorical scale for the `year` variable. Primarily to use the scale for an x-axis that shows a few year labels but not all of them.

	```js
	vis.xScale = d3.scaleLinear()
        .range([0, vis.config.width]);
	```
	
3. **`y` scale**	
	
	The y-scale is categorical and we use it to position each row of the heatmap.
	
	```js
	vis.yScale = d3.scaleBand()
        .range([0, vis.config.height])
        .paddingInner(0.2);
	```

In the next step, we initialize the x-axis and append a placeholder SVG group at the bottom of the chart:

```js
vis.xAxis = d3.axisBottom(vis.xScale)
    .ticks(6)
    .tickSize(0)
    .tickFormat(d3.format('d')) // Remove comma delimiter for thousands
    .tickPadding(10);

vis.xAxisG = vis.chartArea.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(0,${vis.config.height})`);
```

We will create row labels with the name of each state manually instead of using a second D3 axis component.


### Group data

Our dataset (`vis.data`) is an array of objects, each containing the `state`, `year`, and `cases`. In the next step, we want to group these objects per state using `d3.groups`. This makes it easier for us to sort states/rows later.

```js
vis.groupedData = d3.groups(vis.data, d => d.state);
```

The result is a nested array:
`[['Alaska', [array with values]], ['Texas', [array with values]], ...]`


### Update scales

In our case, the underlying data does not change and we could just define the input domains when we initialize the scales, but, as mentioned earlier, we implement the heatmap to be as flexible as possible and also handle dynamic data. Therefore, we update the scales whenever `updateVis()` is called.

We define some accessor functions in one place so that we can easily adjust them if the dataset changes.

```js
vis.yValue = d => d[0];
vis.colorValue = d => d.value;
vis.xValue = d => d.year; 
```

In the next step, we update the input domain of all three scales:

```js
vis.colorScale.domain(d3.extent(vis.data, vis.colorValue));
vis.xScale.domain(d3.extent(vis.data, vis.xValue));
vis.yScale.domain(vis.groupedData.map(vis.yValue));
```

### Bind data to SVG elements

Now, we have made all the necessary preparations and can draw the heatmap using D3's enter-update-exit pattern in `renderVis()`. It is important that we follow this pattern because the heatmap is interactive (i.e., sortable rows) and we do not want to remove and redraw all elements whenever it gets updated.

1. **Rows**
	
	We append a `<g>`-element for each row and position it using the y-scale. Within each row, we add a text label with the name of the respective state.
	
	```js
	// Bind data to selection and use the name of each state (d[0]) as a key
    const row = vis.chart.selectAll('.h-row')
        .data(vis.groupedData, d=> d[0]);

    // Enter
    const rowEnter = row.enter().append('g')
        .attr('class', 'h-row');

    // Enter + update
    rowEnter.merge(row)
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
	```

2. **Columns/cells**
	
	It is easy to determine the height of the cells because the y-scale is categorical and `.bandwidth()` is a function provided by `d3.scaleBand()` that we initialized earlier.
	
	However, we need to calculate the cell width manually because we use a linear x-scale (`2` specifies the padding between the cells):
	
	```js
	const cellWidth = (vis.config.width / (vis.xScale.domain()[1] - vis.xScale.domain()[0])) - 2;
	```
	
	Within each row, we bind the nested array (`d[1]`) that contains the yearly cases per state to SVG rectangles. 
	
	```js
	// Bind data to selection
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
        });
	```

3. **N/A values (diagonal lines)**

	We add diagonal lines to better indicate years where no data is available from years with none or very low case numbers. The code is very similar to step (2) but instead of rectangles we add SVG lines. We also filter years with *null* values when we bind the data to the selection.
	
	```js
	const cellNa = row.merge(rowEnter).selectAll('.h-cell-na')
        .data(d => d[1].filter(k => k.value === null));

    const cellNaEnter = cellNa.enter().append('line')
        .attr('class', 'h-cell-na');

    cellNaEnter.merge(cellNa)
        .attr('x1', d => vis.xScale(vis.xValue(d)))
        .attr('x2', d => vis.xScale(vis.xValue(d)) + cellWidth)
        .attr('y1', vis.yScale.bandwidth())
        .attr('y2', 0);
	```

4. **Update x-axis**

	Inside `renderVis()`, we also need to call the `xAxis` component to populate the empty group with axis tick labels.
	
	```js
	vis.xAxisG.call(vis.xAxis);
	```
	
*Intermediate result:*

![Intermediate result](resources/intermediate_result.png?raw=true "Intermediate result")

## 5. <a name="annotation-tooltip-legend">Add Vaccine Annotation, Tooltips, and a Legend</a>

### Vaccine Annotation

When you look at the visualization it becomes already obvious when the first measles vaccine was introduced roughly but we want to show it explictly using a vertical line and a text label. Thus, we add the following D3 code to the `initVis()` function:

```js
vis.vaccineLine = vis.chartArea.append('line')
    .attr('class', 'vaccine-line');

vis.vaccineLabel = vis.chartArea.append('text')
    .attr('class', 'vaccine-label')
    .attr('text-anchor', 'middle')
    .attr('y', -20)
    .attr('dy', '0.85em')
    .text('Vaccine introduced');
```

In the `updateVis()` function, we just need to update the position of the two SVG elements (in case the underlying x-scale changed):

```js
// Convert year (1963) to pixel coordinate
const xVaccineIntroduced = vis.xScale(vis.config.vaccineIntroduced);

// Set positions
vis.vaccineLine
    .attr('x1', xVaccineIntroduced)
    .attr('x2', xVaccineIntroduced)
    .attr('y1', -5)
    .attr('y2', vis.config.height);

vis.vaccineLabel.attr('x', xVaccineIntroduced);
```

### Tooltips

Using the colour channel in this type of visualization enables us to see overall patterns, trends, and extreme values but it is very difficult to look up specific values. In the next step, we will make the heatmap interactive and display a tooltip when the cursor points to a specific cell.

1. Add placeholder element to `index.html`.

	```html
	<div id="tooltip"></div>
	```

2. Listen to events and update tooltip. We use `event.pageX` and `event.pageY` to get the absolute coordinates of the cursor.

	```js
	cellEnter.merge(cell)
        // ... other attributes ...
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
	```

3. Add a CSS rule to highlight the active cell with a grey outline.

	```css
	.h-cell:hover {
	  transition: stroke 200ms ease-in-out;
	  stroke: #333;
	}
	```

### Legend

Our legend should show a gradient from *white* (left) to *dark red* (right) and a few corresponding axis labels, as shown below. Similar to previous components, the legend should be updated automatically in case the underlying data changes.

![Legend](resources/legend.png?raw=true "Legend")

1. We manually define the size of the legend (i.e., `legendWidth` and `legendBarHeight`) and add an empty group element in the top right corner of the SVG.

	```js
	vis.legend = vis.svg.append('g')
	        .attr('transform', `translate(${vis.config.containerWidth - vis.config.legendWidth - vis.config.margin.right},0)`);
	```

2. We initialize the base element for the linear gradient without defining any colours yet.

	```js
	vis.legendColorGradient = vis.legend.append('defs').append('linearGradient')
        .attr('id', 'linear-gradient');
	```

3. This gradient will then be used as the *fill colour* of a rectangle.

	```js
	vis.legendColorRamp = vis.legend.append('rect')
        .attr('width', vis.config.legendWidth)
        .attr('height', vis.config.legendBarHeight)
        .attr('fill', 'url(#linear-gradient)');
	```

4. We initialize a new x-scale and axis for the legend.

	```js
	 vis.xLegendScale = d3.scaleLinear()
        .range([0, vis.config.legendWidth]);

    vis.xLegendAxis = d3.axisBottom(vis.xLegendScale)
        .tickSize(vis.config.legendBarHeight + 3)
        .tickFormat(d3.format('d'));

    vis.xLegendAxisG = vis.legend.append('g')
        .attr('class', 'axis x-axis legend-axis');
	```

5. We update the colour gradient in the `renderLegend()` function that may get called repeatedly.
	
	Based on the same `vis.colorScale` that we have used to change the colour of the heatmap cells, we now generate *stops* for the legend. You can read more details about SVG gradients in [Nadieh Bremer's blog article](https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient).
	
	```js
	vis.legendColorGradient.selectAll('stop')
        .data(vis.colorScale.range())
      .join('stop')
        .attr('offset', (d,i) => i/(vis.colorScale.range().length-1))
        .attr('stop-color', d => d);
	```

6. We update the domain of the x-scale and call the axis component.
	
	The x-scale shares the same domain with the colour-scale, so we can just reuse it. Using `.nice()` on a scale rounds the domain so that values are easier to read (e.g., 3000 instead of 2998).
	
	```js
	vis.xLegendScale.domain(vis.colorScale.domain()).nice();
	```
	
	D3's automatic generation of axis tick labels is not always suitable. In our case, we want to show four specific labels (*start*, *one third*, *two thirds*, *end*) although the data values (input domain) might change. We set the tick values manually based on the domain:
	
	```js
	const extent = vis.xLegendScale.domain();
	vis.xLegendAxis.tickValues([
		extent[0], 				// start
		parseInt(extent[1]/3),	// one third
		parseInt(extent[1]/3*2),// two thirds
		extent[1]				// end
    ]);
	```


## 6. <a name="sort">Sort Rows in the Heatmap</a>

The last missing part is the interactive sort feature. We added a select box with two options (*"alphabetically"* and *"by case numbers"*) earlier but we still need to link it to our heatmap.

In `main.js`, we add an event listener for the select box that triggers an update:

```js
d3.select('#sort-control').on('change', function() {
	heatmap.config.sortOption = d3.select(this).property('value');
	heatmap.updateVis();
});
```

The rows are sorted alphabetically by default. In the heatmap class (`updateVis()`), we check if the second option is selected and sum up all case numbers per year. We can then use this total number (`d[3]`) to sort the rows in descending order:

```js
if (vis.config.sortOption == 'cases') {
  // Sum the case numbers for each state
  // d[0] is the state name, d[1] contains an array of yearly values
  vis.groupedData.forEach(d => {
    d[3] = d3.sum(d[1], k => k.value);
  });

  // Sort in descending order by total cases
  vis.groupedData.sort((a,b) => b[3] - a[3]);
}
```

The sorting works already because we followed the D3 enter-update-exit pattern and just need to run `renderVis()` when the sorting changes.

We make a tiny extension to our code to show a sorting animation.

```js
rowEnter.merge(row)
	.transition().duration(1000) // <--- new line
	.attr('transform', d => `translate(0,${vis.yScale(vis.yValue(d))})`);
```

## 6. <a name="implementations">Other Implementations and Resources</a>

The visualization technique chosen by the WSJ authors for this specific data received some attention in blogs and led to various recreations:

* [Randy Olson](http://www.randalolson.com/2016/03/04/revisiting-the-vaccine-visualizations/) analyzes issues stemming from the multi-hue colour palette and shows alternatives to the heatmap, such as multi-series line charts.

* [Andy Kirk](https://www.visualisingdata.com/2015/02/visualisation-data-like/) provides a brief visualization critique on his blog and asks if we like the visualization or the data we see.

* [Yuan Li](https://observablehq.com/@foxerlee/the-impact-of-vaccines) recreated the heatmap using JS/D3 in an Observable notebook. They used the `join()` shortcut which was introduced in D3 *v5* while we used the more traditional enter-update-exit pattern.

* [Ben Moore](https://benjaminlmoore.wordpress.com/2015/04/09/recreating-the-vaccination-heatmaps-in-r/) walks you through an R implementation of the heatmap using ggplot2.

--

*Created by Michael Oppermann, Jan 2021*