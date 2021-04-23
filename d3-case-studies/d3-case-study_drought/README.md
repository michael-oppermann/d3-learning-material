# D3 Case Study: Drought and Deluge in the Lower 48

In this case study, we recreate a timeline visualization by Mike Bostock and Shan Carter that was originally published in [The New York Times](https://archive.nytimes.com/www.nytimes.com/interactive/2012/08/11/sunday-review/drought-history.html). It presents periods of dryness, based on the [Palmer Drought Index](https://en.wikipedia.org/wiki/Palmer_drought_index), in the contiguous U.S. between 1895 and 2013.

**You can see the full source code of this case study on [Github](https://github.com/UBC-InfoVis/2021-436V-case-studies/case-study_drought/) and in the browser-based IDE [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-case-studies/case-study_drought/).**

A screenshot of the final visualization is shown below.

* The years are arranged in a small multiples display.
* Each year is shown as a stacked area chart that is divided into 12 months.
* The stacked areas show seven colour-coded categories (*extremely moist*, *very moist*, *moderately moist*, *average*, *moderate drought*, *severe drought*, and *extreme drought*), given as relative numbers (%) in each month.
* Text labels indicate the year. Decades use a bold font.
* January 2013, the last month in our dataset, is annotated with a text label.
* An interactive colour legend is shown in the top right corner. Pointing on one category in the legend isolates it in the heatmap.
* Users can hover over a month:
	* Show what percentage of the U.S. was in moderate to extreme drought (sum of the three drought categories: *moderate drought*, *severe drought*, and *extreme drought*) as a text label right above.
	* The active categories are highlighted with a black outline.
	* The current month is added as a prefix to the year label.
	* When the cursor leaves the chart, the labels are hidden / changed to their original state.

![Result](resources/result.png?raw=true "Result")

#### Outline

1. [Data](#data)
2. [D3 Project Setup & Page Layout](#project-setup)
3. [Load Data and Initialize Heatmap](#load-data)
4. [Create Timeline](#create-timeline)
5. [Add a Text Annotation](#annotation)
6. [Highlight Active Month and Show Tooltip](#highlight-tooltip)
7. [Add an Interactive Colour Legend](#legend)
8. [Other resources](#resources)

## 1. <a name="data">Data</a>

*Data source: [National Oceanic and Atmospheric Administration](https://www.ncdc.noaa.gov/data-access/paleoclimatology-data/datasets/tree-ring/drought-variability)*

The data is stored in the CSV file `palmer_drought.csv`.

* Each row corresponds to one month and has 9 columns
* The column `key` specifies the year (first 4 digits) and month (last 2 digits).
* The columns `0` to `6` contain the drought index which is split up into 7 categories. The values are between 0 and 1 (0 - 100%).
* The column `row` specifies the row in the small multiples display. Each decade will be shown as a separate row. We could compute it on the fly but in our case it is already part of the dataset.

```
key,0,1,2,3,4,5,6,row
189501,0,0,0,0.952,0.048,0,0,12
189502,0,0,0,0.923,0.077,0,0,12
189503,0,0,0,0.898,0.086,0.016,0,12
...
```

## 2. <a name="project-setup">D3 Project Setup & Page Layout</a>

We clone our [D3 starter template](https://github.com/UBC-InfoVis/d3-starter-template) that contains a very basic HTML boilerplate and the D3 v6 bundle. We add the dataset and create a new file `timelineHeatmap.js` that will contain all the D3 code to bind the data to SVG elements. 

```
project/	
	index.html
	css/
		style.css
	js/
		d3.min.js
		timelineHeatmap.js
		main.js
	data/
		palmer_drought.json
```

Within `index.html`, we include the `timelineHeatmap.js` file and add a title and chart container.

```html
<h1>Drought and Deluge in the Lower 48</h1>
<div id="timeline"></div>
```

The HTML layout is very simple because we will create the whole visualization, including the colour legend and all annotations, in SVG.

## 3. <a name="load-data">Load Data and Initialize Timeline</a>

`main.js` acts as our controller: We load the external dataset, preprocess the data, and initialize the visualization class. If we would have any input fields or want to link multiple views, we would orchestrate all events inside this file.

All values are stored as strings when we load a CSV file using `d3.csv()`. Our first step is to convert all columns except the `key` to numeric values. Then we split up the `key` into separate `year` and `month` variables. The `row` number, that we later user to lay out the small multiples, is already specified in the dataset. We get the `col` (column) number based on the last digit of the `year`.

The D3 implementation of the timeline is isolated in a JS class (`timelineHeatmap.js`). We pass a *config* object and the loaded data as parameters.

```js
d3.csv('data/palmer_drought.csv').then(data => {
  data.forEach(d => {
  	// Convert strings to numeric values 
    data.columns.forEach(col => {
      if (col != 'key') {
        d[col] = +d[col];
      }
    });
	
	// Split 'key' into 'year' and 'month'
	// and determine column number for small multiples
    d.year = d.key.substring(0, 4);
    d.month = parseInt(d.key.substring(4, 6));
    d.col = +d.year[d.year.length-1];
    d.year = +d.year;
  });
  
  // Initialize visualization class
  timelineHeatmap = new TimelineHeatmap({ 
    parentElement: '#timeline'
  }, data);
});
```

## 4. <a name="create-timeline">Create Timeline</a>
### Class structure

We create the following class structure to divide the D3 code that gets executed only once from the code that gets called every time the data or display options are updated. 

In our specific example, users are not able to filter the data or change any settings that would affect the visual representation. Using the D3 enter-update-exit pattern to handle dynamic data is therefore not strictly necessary. However, for demonstration purposes, we will follow this pattern and implement the timeline as flexible as possible. It should be relatively easy to add interactive filters or reuse the component to visualize other datasets in the future, without many code adaptations.

```js
class TimelineHeatmap {

  // Class constructor with the initial configuration
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

We store the size configurations, the seven data categories, and month abbrevations in the *config* object in the class constructor:

```js
this.config = {
  parentElement: _config.parentElement,
  containerWidth: 1100,
  containerHeight:1100,
  margin: {top: 15, right: 20, bottom: 20, left: 5},
  palmerCategories: ['0','1','2','3','4','5','6'],
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
}
```

### Set up the SVG drawing area 

In `initVis()`, we use D3 to append an SVG element to the parent container and set its dimension.

```js
vis.svg = d3.select(vis.config.parentElement).append('svg')
	.attr('width', vis.config.containerWidth)
	.attr('height', vis.config.containerHeight);
```

We follow the [D3 Margin Convention](https://observablehq.com/@d3/margin-convention) and use a global margin object with individual spacings for all directions, as illustrated in the figure below. The variables `containerWidth` and `containerHeight` specify the overall drawing area while `width` and `height` specify the area that is used specifically for the small multiples. 

![Margins](resources/margins.png?raw=true "Margins")

We add an empty SVG `<group>` and position it based on the given margins.

```js
vis.chartArea = vis.svg.append('g')
	.attr('transform', `translate(${vis.config.margin.left},
								  ${vis.config.margin.top})`);
```

### Initialize scales and axes

Our visualization is structured hierarchically. We have a stacked area chart for each year and arrange them in a uniform grid as small multiples.

We initialize two categorical scales for the small multiples (`xGridScale` and `yGridScale`) and two linear scales for the stacked area charts (`xScale` and `yScale`).

1. The overall chart size is calculated based on the container size and the margins. We will use the `width` and `height` as the output range when we initialize the grid scales. 

	```js
	vis.config.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
	vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
	```

2. Initialize categorical grid scales that we use to position the stacked charts in rows and columns.
	
	```js
	vis.xGridScale = d3.scaleBand()
	    .domain(getArrayRange(9))
	    .range([0, vis.config.width])
	    .paddingInner(0.01);
	
	vis.yGridScale = d3.scaleBand()
	    .range([0, vis.config.height])
	    .paddingInner(0.5);
	```
	
	`getArrayRange(max)` is our own helper function to generate an array of size *max* + 1. For example, `max=4` results in `[0,1,2,3,4]`.
	
	We can define the input domain for the `xGridScale` during the initialization because we know that each decade has 10 years and we want to show one decade per row. We will define the domain for the `yGridScale` later in `updateVis()` because the number of years/decades might change.
	
	
3. Initialize linear x- and y-scales for the stacked area charts.

	We know that each year has 12 months and thus each chart is divided into 12 vertical slices. We will later draw the layers of the stacked area charts as "step" curves using `d3.curveStepAfter`. In order to split a curve into 12 steps, we need to initialize a linear scale with an input domain of 13 points (= 1-13).
	
	![Step curve](resources/step_curve.png?raw=true "Step curve")
	
	The values of the Palmer drought index are between 0 and 1 (0-100%). 
	
	The output range (width and height) of the stacked area charts is derived from the grid scales.

	```js
	vis.xScale = d3.scaleLinear()
        .domain([1,13])
        .range([0, vis.xGridScale.bandwidth()]);

    vis.yScale = d3.scaleLinear()
        .domain([0,1]);
	```

### Prepare data

Our dataset (`vis.data`) is an array of objects where each object contains the data for a single month. In the next step, we want to group these objects per year using `d3.groups`. The hierarchical data structure will make it easier for us to create a stacked area chart for each year.

```js
vis.groupedData = d3.groups(vis.data, d => d.year);
```

The result is a multi-dimensional array:
`[['2013', [array with monthly data objects]], ['2012', [array with monthly data]], ...]`

As mentioned above, we need 13 data points per layer that, when connected, lead to a stepped curve with 12 steps. Because we have only 12 objects per year, we copy the last one to get the desired result. We use `Object.assign({}, myObject)` to create a deep copy of a JS object.

```js
// d[1] is an array of objects, each containing the data for one month
const monthCopy = Object.assign({}, d[1][11]);
```


### Initialize stack and path generators

The stacked area charts are composed of multiple layers (SVG paths) that are stacked on top of each other. Alternatively, because we don't interpolate values between months, we could use SVG rectangles to achieve the same result. But this approach would require a vast number of SVG `<rect>` elements which would significantly affect the performance.

We use two "helper functions" to generate the pixel coordinates of the SVG paths. These functions have no direct visual output but instead take the data we provide and transform it, thereby generating new data that is more convenient to draw.

1. **Stack generator** 
	
	`d3.stack()` computes a baseline value for each datum/layer, which is one out of seven Palmer drought categories in our case.
		
	```js
	// Keys for the 7 Palmer drought cateogries
	vis.config.palmerCategories = ['0','1','2','3','4','5','6']
	```
	
	```js
	// Initialize stack generator
	vis.stack = d3.stack()
        .keys(vis.config.palmerCategories);
	```
	
	We can then use the stack generator on our dataset.
	
	```js
	// Loop through years
	vis.groupedData(d => {
		// d[0] = year
		// d[1] = array with 13 objects
		
		// Stack data
		d[2] = vis.stack(d[1]);
	}
	```
	
	Example excerpt of the result for a single year (`d[2]`):
	
	![Stack data](resources/stacked_data.png?raw=true "Stack data")
	
2. **Path generator** 

	We have prepared the data for the layers in our area charts but now we need to convert it to SVG path instructions, such as
	
	```html
<path d="M0,0L8.877627627627627,0L8.877627627627627,0L17.755255255255253,0L17.755255255255253,0L26.632882882882882,0L26.632882882882882,0.04260000000000004L35.51051051051051,0.04260000000000004L35.51051051051051, ...">
	```
	
	For this purpose, we initialize an area path generator that uses the x- and y-scales to convert the input data to pixel coordinates:
	
	```js
	vis.area = d3.area()
        .x((d,i) => vis.xScale(d.data.month))
        .y0(d => vis.yScale(d[0]))
        .y1(d => vis.yScale(d[1]))
        .curve(d3.curveStepAfter);
	```
	
	We use `d3.curveStepAfter` to interpolate the data points and create a step curve. You can check out this D3 block to see other curve interpolation options: [https://bl.ocks.org/d3noob/ced1b9b18bd8192d2c898884033b5529](https://bl.ocks.org/d3noob/ced1b9b18bd8192d2c898884033b5529)

### Update scales

In our case, the underlying data does not change and we could just define the input domains when we initialize the scales, but, as mentioned earlier, we want the visualization to be as flexible as possible and to also handle dynamic data. Therefore, we update the y-scales whenever `updateVis()` is called.

```js
vis.yGridScale.domain(getArrayRange(d3.max(vis.data, d => d.row)));
vis.yScale.range([vis.yGridScale.bandwidth(), 0]);
```

### Bind data to SVG elements

Now, we have made all the necessary preparations and can render the small multiples visualization using D3's enter-update-exit pattern in `renderVis()`.

The visualization is organized hierarchically. First, we create an SVG group for each year and position them using the grid scales (small multiples). Second, we create a stacked area chart within each of those groups.

1. **Small multiples**
	
	```js
	// Bind data to selection and use the year (d[0]) as a key
	const yearGroup = vis.chart.selectAll('.year-group')
        .data(vis.groupedData, d=> d[0]);

	// Enter
    const yearGroupEnter = yearGroup.enter().append('g')
        .attr('class', 'year-group');
	
	// Enter + update
    yearGroupEnter.merge(yearGroup)
        .attr('transform', d => `translate(${vis.xGridScale(d[1][0].col)},
        								   ${vis.yGridScale(d[1][0].row)})`);
    
    // Exit
    yearGroupEnter.exit().remove();
    ```
    
    Append text labels to show the years. We add a class `decade` to the first label in each row and apply a bold text formatting with CSS.
    
    ```js
    yearGroupEnter.append('text')
        .attr('class', 'year-label')
        .classed('decade', d => !(parseInt(d[0]) % 10))
        .attr('y', vis.yGridScale.bandwidth() + 10)
        .attr('dy', '0.35em')
        .text(d => d[0]);
	```

2. **Stacked area charts**
	
	```js
	const categoryPath = yearGroup.merge(yearGroupEnter).selectAll('.year-area')
        .data(d => d[2]);

    const categoryPathEnter = categoryPath.enter().append('path')
        .attr('class', d => `year-area cat cat-${d.key}`);
	
	// Call area path generator 
    categoryPathEnter.merge(categoryPath)
        .attr('d', vis.area);
	```
	
	We give each layer a distinct class (e.g., `cat-1`) and then apply fill colours for the 7 drought categories in CSS:
	
	```css
	.cat-0 {
	  fill: #dd3322;
	}
	.cat-1 {
	  fill: #e98736;
	}
	...
	```

*Intermediate result:*

![Intermediate result](resources/intermediate_result.png?raw=true "Intermediate result")

## 5. <a name="annotation">Add a Text Annotation</a>

We manually add a text annotation to January, 2013, which is the last available month in our dataset. Unfortunately, SVG `<text>`-elements can not handle multi-line text, so we need to embed the text as HTML content using `<foreignObject>`.

This is the only part of our visualization that is not fully generated from the data, although the positioning is flexible.

```js
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
```

![Annotation](resources/annotation.png?raw=true "Annotation")


## 6. <a name="highlight-tooltip">Highlight Active Month and Show Tooltip</a>

When users hover over a specific month, we want to highlight it and show what percentage of the U.S. was in moderate to extreme drought.

![Tooltip](resources/tooltip.png?raw=true "Tooltip")

1. We add transparent overlays (`<rect>`) to all area charts to **track the mouse position**. Using `vis.xScale.invert(xPos)`, we can get the month based on the pixel coordinate. In other words, we convert the output range (pixels) to the input domain (data values) which is the inverse of what we have done earlier.
	
	```js
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
          // ...
        })
        .on('mousemove', function(event,d) {
          // Get month that corresponds to current mouse x-coordinate
          // First array element is x, second is y
          const xPos = d3.pointer(event, this)[0];
           
          const month = Math.min(vis.xScale.invert(xPos), 12);
          const monthIndex = parseInt(month - 1);

         // ...
        })
        .on('mouseout', function(event,d) {
          // ...
        });
	```

2. Within `mousemove`, we add the active month as a **prefix to the year label**.

	```js
	d3.select(this.parentNode).select('.year-label')
		.text(`${vis.config.months[monthIndex]} ${d[0]}`);
	```
	
	`vis.config.months` is an array containing month abbrevations (Jan, Feb, Mar, ...).
	
	When the cursor leaves the chart, we change the label back to its original state.
	
	```js
	d3.select(this.parentNode).select('.year-label')
   		.text(d[0]);
	```

3. We also show the sum of the three drought categories (moderate drought, severe drought, and extreme drought) as a **text label tooltip** above the area chart.

	We add an empty text label to each chart and hide it by default.
	
	```js
	yearGroupEnter.append('text')
        .attr('class', 'percent-label')
        .attr('dy', '0.35em')
        .attr('y', -8)
        .style('display', 'none');
	```
	
	When the `mousemove` event gets triggered, we update the text and make it visible.
	
	```js
	d3.select(this.parentNode).select('.percent-label')
		.attr('x', vis.xScale(parseInt(month)))
		.text(`${Math.round(sumForMonth*100)}%`)
		.style('display', 'block');
	```
	
	The label gets hidden again after a `mouseout` event.

	```js
	d3.select(this.parentNode).select('.percent-label')
		.style('display', 'none');
	```
	
4. We **highlight the three drought categories** of the currently active month with a black outline.

	Similar to the tooltip text, we add a rectangle to the SVG and hide it by default.
	
	```js
	vis.highlightRect = vis.chartArea.append('rect')
        .attr('class', 'highlight-rect')
        .style('display', 'none');
	```
	
	The `width` is derived from the x-scale.
	
	```js
	vis.highlightRect.attr('width', vis.xGridScale.bandwidth()/12);
	```
	
	When users hover over a month, we display the rectangle and update its size.
	
	```js
	vis.highlightRect.style('display', 'block');
	```
	
	```js
	vis.highlightRect
		.attr('transform', `translate(${vis.xGridScale(monthData.col)},
									  ${vis.yGridScale(monthData.row)})`)
		.attr('x', vis.xScale(parseInt(month)))
		.attr('y', ySumForMonth)
		.attr('height', vis.yGridScale.bandwidth() - ySumForMonth);
	```


## 7. <a name="legend">Add an Interactive Colour Legend</a>

Finally, we add an interactive colour legend for the seven drought categories. When users place their cursor on one category, it will get highlighted in the visualization, as shown in the figure below.

![Legend](resources/legend_interaction.png?raw=true "Legend")

The legend has some manual specifications and it is only drawn once because our assumption is that the drought categories remain unchanged.

1. We add a few additional attributes to our *config* object.

	```js
	this.config = {
      legendWidth: 250,
      legendTitleHeight: 12,
      legendBarHeight: 14,
      // ...
    }
	```

2. We initialize a categorical scale that we use to position the coloured rectangles.

	```js
	const xLegendScale = d3.scaleBand()
        .domain(vis.config.palmerCategories)
        .range([0, vis.config.legendWidth])
        .paddingInner(0);
	```

3. We create seven rectangles and add the same classes as before to adjust the colours with CSS.

	```js
	vis.legend.selectAll('.legend-element')
		.data(vis.config.palmerCategories)
	  .join('rect')
		.attr('class', d => `legend-element cat cat-${d}`)
		.attr('width', xLegendScale.bandwidth())
		.attr('height', vis.config.legendBarHeight)
		.attr('x', d => xLegendScale(d))
		.attr('y', vis.config.legendTitleHeight);
   ```     
   
   *Result:*
   
   ![Legend colours](resources/legend_colours.png?raw=true "Legend colours")  

4. Because we assigned classes to all the layers in the stacked area charts, we can use the class attribute now to isolate one of them. We bind event listeners to the legend rectangles and whenever one category is selected, we give all other categories the class `inactive`.

   ```js
		.on('mouseover', (event,d) => {
			d3.selectAll(`.cat:not(.cat-${d})`).classed('inactive', true);
		})
		.on('mouseout', () => {
			d3.selectAll(`.cat`).classed('inactive', false);
		});
	``` 

	In CSS, we just add a new rule for the inactive state:
	
	```css
	.cat.inactive {
	  fill-opacity: 0.2;
	}
	```

5. In addition, we add multiple text labels to the legend. We don't explain the creation of this labels here because it is very similar to the ones we created earlier. You should have a look a the full source code on [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-case-studies/case-study_drought/).

## 8. <a name="resources">Other Resources</a>

* The NYT visualization that we recreated provides a historical perspective on drought in the U.S. The Palmer drought index is aggregated to a country level and there is no distinction between states or geographical regions. The main goal is to see temporal patterns and easily identify drought periods. In comparison, [several map visualizations](https://www.washingtonpost.com/weather/2021/01/07/drought-expands-north-america/) published by the WSJ provide a geographical perspective on this topic that is worth exploring.

* Other small multiples visualizations:
	* [Line chart small multiples by d3-graph-gallery.com](https://www.d3-graph-gallery.com/graph/line_smallmultiple.html )
	* [Brushable scatterplot matrix by Mike Bostock](https://observablehq.com/@d3/brushable-scatterplot-matrix)

--

*Created by Michael Oppermann, Jan 2021*