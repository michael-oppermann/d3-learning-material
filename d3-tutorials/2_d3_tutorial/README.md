# II. Making a Chart

In this tutorial, you will learn how to create basic chart types, such as bar charts, scatter plots, and line charts. We will introduce the concept of *input domains* and *output ranges* which are the basis for *D3 scales* and needed in almost every visualization. We will also show you an object-oriented approach to make visualization components reusable.

#### Contents

1. [More D3 Basics](#more-d3-basics)
2. [Making a Bar Chart](#making-a-bar-chart)
3. [Reusable D3 Components](#reusable-d3-components)
4. [Making Line and Area Charts](#making-line-and-area-charts)

## <a name="more-d3-basics">1. More D3 Basics</a>

### SVG groups

In the last tutorial, we created basic SVG shapes, like rectangles or circles, but there is another SVG element that is very useful for programming in D3: the group element (`<g></g>`). In contrast to graphical elements, the group element does not have a visual presence but it helps us to organize other elements and to apply *transformations*. In this way, we can create hierarchical structures. 

```javascript
// Create group element
const group = svg.append('g');

// Append circle to the group
const circle = group.append('circle')
	.attr('r', 4)
	.attr('fill', 'blue');
```
Group elements are invisible but we can apply transformations, for example *translate()* or *rotate()*, to the group and it will affect the rendering of all child elements. 

```javascript
// Group element with 'transform' attribute
// x = 70, y = 50 (moves the whole group 70px to the right and 50px down)
const group = svg.append("g")
	.attr("transform", "translate(70, 50)");
```

![SVG Groups](images/svg-groups.png?raw=true "SVG Groups")



### Scales

Until now, we have only used *x* and *y* values that corresponded directly to pixel measurements on the screen, within a pre-defined SVG drawing area.
That is not very flexible and only feasible for static data. What if our data attributes are suddenly doubled? We can not increase the size of the chart every time a value increases. At some point, the user might have to scroll through a simple bar chart to get all the information.

This is where ***scales*** come in. We specify a fixed SVG drawing space on our web page and scale the data to fit in the dedicated area.

* Scales are functions that map from an input domain to an output range.
* D3 provides built-in methods for many different scales: linear, ordinal, logarithmic, square root, and so on. Most of the time you will use *linear scale functions*, so we will focus on learning this type of scale.
* You can read more about D3 scales here:<br>[https://github.com/d3/d3-scale/blob/master/README.md](https://github.com/d3/d3-scale/blob/master/README.md)

*Example:* We want to visualize the monthly sales of an ice cream store. The input data are numbers between 0 and 20,000 USD and the maximum height of the chart is 400px. We take an input inverval (called ***domain***) and transform it into a new output interval (called ***range***).

![Scales](images/input_domain_output_scale.png?raw=true "Scales")

We could transform the numbers from one domain into the other manually but what if the sales rise above 20.000 and the interval changes? That means a lot of manual work. Thankfully, we can use D3's built-in scaling methods to do this automatically.

D3 provides scale functions to convert the *input domain* to an *output range*. We can specify the domain and range by using *method chaining syntax*:

```javascript
// Creating a linear scale function
const iceCreamScale = d3.scaleLinear()
	.domain([0, 20000])
	.range([0, 400]);

// Call the function and pass an input value
iceCreamScale(5000);	// Returns: 100
``` 
This was pretty easy, because we already knew the max value of the data. What if we load data from an external source and don't know the data range the data is going to be in? Instead of specifying fixed values for the domain, we can use the convenient array functions ```d3.min()```, ```d3.max()``` or ```d3.extent()```.

```javascript
const quarterlyReport = [
	{ month: 'May', sales: 6900 },
	{ month: 'June', sales: 14240 },
	{ month: 'July', sales: 25000 },
	{ month: 'August', sales: 17500 }
];

// Returns the maximum value in a given array (= 25000)
const max = d3.max(quarterlyReport, d => d.sales);

// Returns the minimum value in a given array (= 6900)
const min = d3.min(quarterlyReport, d => d.sales);

// Returns the min. and max. value in a given array (= [6900,25000])
const extent = d3.extent(quarterlyReport, d => d.sales);
```

#### Time scales

Time scales are a variant of linear scales that have a temporal domain. They require JS date objects 

#### Ordinal scales

D3 also provides methods to create ordinal scales with a discrete domain.

```javascript
// Create an ordinal scale function
const xScale = d3.scaleBand()
	.domain(['Vanilla', 'Cookies', 'Chocolate', 'Pistachio'])
	.range([0, 400]) 		// D3 fits n (=4) bands within a 400px space
	.paddingInner(0.05);	// Adds spacing between bands

// By definition all bands have the same width
// and you can get it with `xScale.bandwidth()`

// We can use JS .map() instead of manually specifying all possible values
const months = quarterlyReport.map(d => d.month);
months // Returns: ['May', 'June', 'July', 'August']
```

![Ordinal scale bands](images/ordinal_scale_band.png?raw=true "Ordinal scale bands")

For example, D3's ordinal scales can be very useful to simplify the positioning of bars in a bar chart, as you will see very soon.


#### Colour scales

D3 has built-in color palettes that work like ordinal scales and can also be accessed like other scales:

*Examples:*

- ```d3.scaleOrdinal(d3.schemeCategory10)``` -  ordinal scale with a range of 10 categorical colours
- ```d3.scaleOrdinal(d3.schemeCategory20)``` -  ordinal scale with a range of 20 categorical colours


```javascript
// Construct a new ordinal scale with a range of ten categorical colours
var colorPalette = d3.scaleOrdinal(d3.schemeCategory10);

// We can log the color range and see 10 distinct hex colours
console.log(colorPalette.range());
// ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]

// Specify domain (optional)
colorPalette.domain(['Vanilla', 'Cookies', 'Chocolate', 'Pistachio']);

// Use color palette
colorPalette("Chocolate") // Returns: #2ca02c
```

We can then bind the colour scale to data values and render it:

![D3 Ordinal Color Scale](images/color_scale_ordinal.png?raw=true)


Instead of using a fixed range of colours, you can use linear scale functions to create colour gradients: 

```javascript
const linearColor = d3.scaleLinear()
  .domain([0,100])
  .range(['lightgreen', 'darkgreen']);

linearColor(0) // Returns: #90ee90
```
![D3 Linear Color Scale](images/color_scale_linear.png?raw=true "Linear Color Scale")

Read more about [D3 colour scales](https://github.com/d3/d3-scale-chromatic/blob/master/README.md) or [other scale functions](https://github.com/d3/d3-scale), such as logarithmic or diverging scales.


### Axes

We typically need to add x- and y-axes to allow the user to extract meaningful insights from visualizations. An ***axis*** is the visual representation of a scale.

D3 provides four methods to create axes with different orientations and label placements (`d3.axisTop`, `d3.axisBottom`, `d3.axisLeft`, and `d3.axisRight`) which can display reference lines for D3 scales automatically. These axis components contain lines, labels, and ticks.

```javascript
// Create a horizontal axis with labels placed below the axis
const xAxis = d3.axisBottom();

// Pass in the scale function
xAxis.scale(xScale);
```

The above is equivalent to:

```javascript
const xAxis = d3.axisBottom().scale(xScale);
```

Finally, to add the axis to the SVG, we need to specify the position in the DOM tree and then we have to *call* the axis function.

We create an SVG group element as a selection and use the `call()` function to hand it off to the *axis* function. All the axis elements are getting generated within that group.

```javascript
// Draw the axis
svg.append('g')
	.attr('class', 'axis x-axis')
	.call(xAxis);
```


#### Refine the axis

D3 axis functions automatically adjust the spacing and labels for a given scale and range. Depending on the data and the type of the visualization, you may want to modify these settings.

```javascript
var xAxis = d3.axisBottom()
	.scale(xScale)
	. ... // Add options here
```

There are many different options to customize axes:

- Number of ticks: `.ticks(5)`
- Tick format, e.g. as percentage: `.tickFormat(d3.format(".0%"))` 
- Predefined tick values: `.tickValues([0, 10, 20, 30, 40])`
- Remove tick marks at the beginning and end of an axis: `.tickSizeOuter(0)`

You can read more about D3 axis, ticks, and tick formatting in the [D3 documentation](https://github.com/d3/d3-axis/blob/master/README.md).

&nbsp;

## 2. <a name="making-a-bar-chart">Making a Bar Chart</a>

Now, we know most of the concepts to create a D3 bar chart with a categorical y-axis and a linear x-axis. First, we need to download the D3 library and create a simple HTML page. **Important:** A local web server is necessary because we load data from a CSV file; otherwise we will get a browser error.

*index.html*

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>D3 Bar Chart</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
	<!-- We will add the SVG chart to the following container -->
	<div id="chart"></div>

    <script src="js/d3.v6.min.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

The D3 implementation is in a separate JS file `main.js`. See code comments below for further details.

*main.js*

```javascript
/*
 *  Load data from CSV file
 */
d3.csv('data/sales.csv')
	.then(data => {
  		// Convert sales strings to numbers
		data.forEach(d => {
		  d.sales = +d.sales;
		});
    
		showBarChart(data);
	})
 	.catch(error => {
  		console.error('Error loading the data');
	});

/*
 *  Draw chart
 */
function showBarChart(data) {
	const width = 500;
	const height = 120;
	
	// Append empty SVG container and set size
	const svg = d3.select('#chart').append('svg')
	  .attr('width', width)
	  .attr('height', height);
	
	// Initialize linear and ordinal scales (input domain and output range)
	const xScale = d3.scaleLinear()
	  .domain([0, d3.max(data, d => d.sales)])
	  .range([0, width]);
	
	const yScale = d3.scaleBand()
	  .domain(data.map(d => d.month))
	  .range([0, height])
	  .paddingInner(0.1);
	
	// Initialize axes
	const xAxis = d3.axisBottom(xScale);
	const yAxis = d3.axisLeft(yScale);
	
	// Draw the axis
	const xAxisGroup = svg.append('g')
	  .attr('class', 'axis x-axis')
	  .call(xAxis);
	
	const yAxisGroup = svg.append('g')
	  .attr('class', 'axis y-axis')
	  .call(yAxis);
	
	// Add rectangles
	const bars = svg.selectAll('rect')
	  .data(data)
	  .enter()
	.append('rect')
	  .attr('class', 'bar')
	  .attr('fill', 'steelblue')
	  .attr('width', d => xScale(d.sales))
	  .attr('height', yScale.bandwidth())
	  .attr('y', d => yScale(d.month))
	  .attr('x', 0);
}
```

**Intermediate result:**

![D3 Bar Chart Draft](images/d3_bar_chart_1.png?raw=true "D3 Bar Chart Draft")

The current chart does not look correct. We use `.axisBottom()` which places the tick labels below the x-axis but it is still shown at the top of the SVG area.

Recall that we can use the *transform* attribute to change the position and move the axis to the bottom, such as:

```javascript
const xAxisGroup = svg.append('g')
	.attr('class', 'axis x-axis')
	.attr('transform', `translate(0, ${height - margin})`)
	.call(xAxis);
```

Positioning the axes or defining the correct margins between components can be cumbersome. We recommend you to follow the *D3 Margin Convention* and to use a global margin object, with individual spacings for all directions.

#### The D3 Margin Convention

> "By convention, margins in D3 are specified as an object with top, right, bottom and left properties. Then, the outer size of the chart area, which includes the margins, is used to compute the inner size available for graphical marks by subtracting the margins." *(Mike Bostock)* &raquo; [See more details](https://observablehq.com/@d3/margin-convention)

![D3 Margin Convention](images/margin-convention.png?raw=true "Margin Convention")

#### Other chart refinements

We apply `.tickSizeOuter(0)` to remove tick marks at the beginning and end of an axis, and set the number of x-axis ticks with `.ticks(6)`. Additionally, we use CSS to adjust the style of the chart slightly. We now also specify the bar colour in CSS because it is independent of the data.

```css
.axis path,
.axis line {
	fill: none;
	stroke: #333;
	shape-rendering: crispEdges;
}

.axis text {
	font-family: sans-serif;
	font-size: 11px;
}

.bar {
	fill: steelblue;
	shape-rendering: crispEdges;
}
```

*```shape-rendering``` is an SVG property which specifies how the SVG elements are getting rendered. We use `shape-rendering: crispEdges;` in this example to make sure that we don't get blurry axes and bars.*

The final D3 code in the `showBarChart()` function:

```javascript
function showBarChart(data) {	
	// Margin object with properties for the four directions
	const margin = {top: 5, right: 5, bottom: 20, left: 50};
	
	// Width and height as the inner dimensions of the chart area
	const width = 500 - margin.left - margin.right,
	height = 140 - margin.top - margin.bottom;
	
	// Define 'svg' as a child-element (g) from the drawing area and include spaces
	const svg = d3.select('#chart').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', `translate(${margin.left}, ${margin.top})`);
	
	// All subsequent functions/properties can basically ignore the margins
	
	// Initialize linear and ordinal scales (input domain and output range)
	const xScale = d3.scaleLinear()
		.domain([0, d3.max(data, d => d.sales)])
		.range([0, width]);
	
	const yScale = d3.scaleBand()
		.domain(data.map(d => d.month))
		.range([0, height])
		.paddingInner(0.15);
	
	// Initialize axes
	const xAxis = d3.axisBottom(xScale)
		.ticks(6)
		.tickSizeOuter(0);
	
	const yAxis = d3.axisLeft(yScale)
		.tickSizeOuter(0);
	
	// Draw the axis (move xAxis to the bottom with 'translate')
	const xAxisGroup = svg.append('g')
		.attr('class', 'axis x-axis')
		.attr('transform', `translate(0, ${height})`)
		.call(xAxis);
		
	const yAxisGroup = svg.append('g')
		.attr('class', 'axis y-axis')
		.call(yAxis);
	
	// Add rectangles
	svg.selectAll('rect')
		.data(data)
		.enter()
	  .append('rect')
		.attr('class', 'bar')
		.attr('width', d => xScale(d.sales))
		.attr('height', yScale.bandwidth())
		.attr('y', d => yScale(d.month))
		.attr('x', 0);
} 
```

*Result:*

![D3 Bar Chart](images/d3_bar_chart_2.png?raw=true "D3 Bar Chart")


&nbsp;

## 3. <a name="reusable-d3-components">Reusable D3 Components</a> *(ES6 Classes)*

Thinking about the structure of your project early on can save you a lot of time and will make your implementation more robust, extensible and reusable. This becomes particularly important when we create interactive visualizations where the underlying data changes or small multiple displays.

### Divide and conquer

You should always try to split a complex problem into smaller, easier-to-tackle sub-problems. Each sub-problem can then be solved independently and afterwards integrated into the final system.

**D3 visualizations should be organized and structured using individual classes for different chart types**: do not have one monolithic file containing all of your code. Also, think about **consistent structure for the functions within each class**, to make these components as flexible and reusable as possible. 

We recommend creating a JavaScript class for each visualization chart type that is used following this pipeline:

![D3 Components - Pipeline](images/d3_components_overview.png?raw=true "D3 Components - Pipeline")

### Function structure of an individual class

ES6 introduced classes to better support object-oriented programming that you should use. Note that when reading code for older JavaScript versions, a similar functionality was achieved by using Object.prototype functions.

Similar to other programming languages, ES6 classes have a constructor and properties can be defined by using the keyword ```this```:

```javascript
// ES6 Class
class BarChart {

  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 10, bottom: 30, right: 10, left: 30 }
    }
    
    // Call a class function 
    this.initVis();
  }
  
  initVis() {
  	...
  }
  
  ...
}
```

Instantiating a new instance of a class is done by using the keyword ```new```. The constructor should be used to define properties:

```javascript
// Create an instance (for example in main.js)
let barchart = new BarChart({
	'parentElement': '#bar-chart-container',
	'containerHeight': 400
});
```

Object attributes can be updated afterwards:

```javascript
barchart.data = data;
```

The variables should be stored in the chart object. We recommend avoiding simply using the  ```this``` keyword within complex class code involving SVG elements because the scope of ```this``` will change and it will cause undesirable side-effects. Instead, we recommend creating another variable (for example ```vis``` or ```_this```) at the start of each function to store the *this*-accessor.  

```javascript
initVis() {
    let vis = this;
    
    vis.svg = d3.select(vis.config.parentElement).append('svg');
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
    ...
}
```

The functions  `initVis()`, `updateVis()`, and `renderVis()` should be used, following the implementation pipeline above. You might also need additional functions. The goal is to execute only the code that is needed to update the chart instead of removing and redrawing the entire chart after a user interaction; this code structure makes that goal straightforward to achieve.

```javascript
initVis() {
    let vis = this;
    ...
}
updateVis() {
    let vis = this;
    ...
}
renderVis() {
    let vis = this;
    ...
}
```

### Breakdown of project into classes

In this example, there are two chart types, stacked area chart and timeline, and so there are two class files, `stackedAreaChart.js` and `timeline.js`
![Project overview](images/d3_components_overview_2.png?raw=true "Project overview")

The divide-and-conquer concept (i.e., splitting up a complex problem into various sub-tasks) also applies to the overall file structure of your project.


We recommend that you create object instances for the chart type classes in the file ```main.js```, which should be the entry point for your application, so that your code stays clean and understandable. For example, if you want to use the same data for multiple charts, you would load the data only once in *main.js*, and then re-use it in each class instance.

This methodology will become very helpful for developing larger systems and more sophisticated interaction mechanisms.

### Examples

We have used this approach to turn the previous bar chart example into a resuable class. You can look at the complete example on [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-static-bar-chart) where you can also play around with different parameters and styles.

[![D3 Bar Chart](images/codesandbox_d3-static-bar-chart.png?raw=true "D3 Bar Chart")](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-static-bar-chart)

You should also check out our scatter plot example on [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-static-scatter-plot).

[![Static scatter plot](images/codesandbox_d3-static-scatter-plot.png?raw=true "Static scatter plot")](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-static-scatter-plot)
	
&nbsp;

## 4. <a name="making-line-and-area-charts">Making Line and Area Charts</a>

In the last tutorial, we briefly showed you how to create basic shape elements with SVG (rectangles, circles, text, straight lines) and we used some of those elements to build a bar chart and a scatter plot.

For creating line and area charts we want to use SVG's [path](https://www.w3schools.com/graphics/svg_path.asp) element. Specifying the coordinates for a path is significantly more complex than for basic shapes, as shown in the following code snippet and result below:

```html
<svg width="500" height="200">
  <path style="fill: none; stroke: blue" d="M0 10 L100 75 L300 90 L350 20"></path>
</svg>
```

![SVG path](images/svg_path.png?raw=true "SVG path")

Fortunately, D3 provides the `d3.line()` and `d3.area()` functions, allowing us to draw a line and area charts more efficiently. Basically these functions take our data and convert it into the SVG path coordinates we wrote above.

Using D3's *line generator*:

```javascript
const data = [{x: 0, y: 10}, {x: 100, y: 75}, {x: 300, y: 90}, {x: 350, y: 20}]

// Prepare a helper function
const line = d3.line()
    .x(d => d.x)
    .y(d => d.y);

// Add the <path> to the <svg> container using the helper function
d3.select('svg').append('path')
    .attr('d', line(data))
    .attr('stroke', 'red')
    .attr('fill', 'none');
```

![D3 SVG path](images/d3_svg_path.png?raw=true "D3 SVG path")

The *area generator* works similar. An area is defined by two polylines and we need to specify differing y-values (`y0` and `y1`). Most commonly, `y0` is defined as a constant representing zero. The first line (the topline) is defined by `y1` and is rendered first; the second line (the baseline) is defined by y0 and is rendered second. The two lines typically share the same x-values.

```javascript
const data = [{x: 0, y: 10}, {x: 100, y: 75}, {x: 300, y: 90}, {x: 350, y: 20}]

// Prepare a helper function
const area = d3.area()
  .x(d => d.x)      // Same x-position
  .y1(d => d.y)     // Top line y-position
  .y0(0)            // Bottom line y-position

// Add the area path using this helper function
d3.select('svg').append('path')
  .attr('d', area(data))
  .attr('stroke', 'green')
  .attr('fill', 'green');
```

![D3 SVG area path](images/d3_svg_area_path.png?raw=true "D3 SVG area path")


Result if we change the baseline y-position: e.g., `.y0(150)`

![D3 SVG area path 2](images/d3_svg_area_path_2.png?raw=true "D3 SVG area path 2")

You can use D3's `.curve()` to interpolate the curve between points, for example, to smoothen the curve or to produce a step function, as shown below. Note: Use curve interpolation very carefully as it may misrepresent the actual data!

```javascript
const area = d3.area()
  .x(d => d.x)
  .y1(d => d.y)
  .y0(150)
  .curve(d3.curveNatural);

// ...
```

![D3 SVG area path 3](images/d3_svg_area_path_smooth.png?raw=true "D3 SVG area path 3")

```javascript
const line = d3.line()
  .x(d => d.x)
  .y(d => d.y)
  .curve(d3.curveStep);
```

![D3 SVG line path step](images/d3_svg_line_path_step.png?raw=true "D3 SVG line path step")

&raquo; [Compare different curve interpolation types interactively here.](http://bl.ocks.org/d3indepth/b6d4845973089bc1012dec1674d3aff8)

### Example

In this example, we used a line and area generator. You can look at the full source code on [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-static-area-chart). We will extend this visualization in later tutorials by adding interactive tooltips and filters.

[![Static area chart](images/codesandbox_d3-static-area-chart.png?raw=true "Static area chart")](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-static-area-chart)


---

*Sources:*

* [Harvard's visualization course (CS171)](https://www.cs171.org/)
* [https://www.d3-graph-gallery.com/graph/shape.html](https://www.d3-graph-gallery.com/graph/shape.html)