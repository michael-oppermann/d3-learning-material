# III. Data Joins and Basic Interactivity

In this tutorial, we introduce the enter-update-exit pattern which is a key concept to make D3 visualizations fully interactive. We present further examples on mouse events, animated transitions, and tooltips.

#### Tutorial Outline

1. [Enter, Update, Exit](#enter-update-exit)
2. [Updating Scales and Axes](#updating-scales-axes)
3. [Reusable D3 components](#reusable-d3-components)
4. [Animated Transitions](#animated-transitions)
5. [Tooltips](#tooltips)


## 1. <a name="enter-update-exit">Enter, Update, Exit</a> 

By now you have learned how to load external data and how to map it to visual elements, for example, to create a bar chart. But very often we have to deal with changing data or a continuous data stream rather than a static CSV file. Dynamic data often requires more sophisticated user interfaces that allow users to interact with the data (e.g., filter and sort).

**Instead of removing and redrawing visualizations each time new data arrives, we want to update only affected components to improve loading times and create smooth transitions.**

We will accomplish this by using D3's enter-update-exit pattern.

### *"Updating data"* means *"joining data"*

A data-join is followed by operations on the three virtual selections: **enter**, **update** and **exit**.

This means that we are merging new data with existing elements. In the merging process we have to consider:

- Enter: What happens to new data values without existing, associated DOM elements?
- Update: What happens to existing elements which have changed?
- Exit: What happens to existing DOM elements which are not associated with data anymore?

![Data Join](images/enter_update_exit_sketch.jpg?raw=true "Data Join")

To take care of the enter-update-exit pattern, we have to change the sequence of our D3 code a little bit. Instead of chaining everything together, some code snippets must be separated.

We create an SVG element and select it in D3:

```javascript
const svg = d3.select('svg');
```

And bind the data to SVG circles:

```javascript
let circle = svg.selectAll('circle')
    .data([5, 10, 15]);
```

The length of the dataset is 3 and we select all SVG circles in the document. That means, if there are 3 or more existing circles, the **enter selection** is empty, otherwise it contains placeholders for the missing elements.

The page is empty because we have not appended any circles yet. We can access the *enter selection* and append a new circle for each placeholder with the following statement:

```javascript
circle = circle.enter().append('circle')
    .attr('r', d => d)
    .attr('cx', (d,index) => (index * 80) + 50)
    .attr('cy', 80);
```

*(You might have noticed that we've actually already used this pattern multiple times.)*

But often you want to do the exact opposite operation. If someone filters the dataset you may want to remove existing elements. In this case, you have to use the ```exit``` selection. ```exit``` contains the leftover elements for which there is no corresponding data anymore.

We call the drawing function again with new data:

```javascript
circle = svg.selectAll('circle')
    .data([20, 30]);  
```

The new dataset contains 2 elements but on the website there are currently 3 circles. We can access the *exit selection* and remove the element that has no data-binding anymore:

```javascript
circle.exit().remove();
```

There is still one problem left: *dynamic properties*. We are using a data-dependent radius and the values in the new dataset have been changed. For this reason, we have to update the dynamic properties (that we previously set in the *enter selection*) every time we update the data. To do this we use the *merge* function to apply changes to the *enter and update selection*:

```javascript
circle = svg.selectAll('circle')
	.data(data);
``` 
The result of the  ```data()``` method returns the updated selection.

Putting everything together:

```javascript
const svg = d3.select('svg')

// Call rendering function with 2 datasets sequentially
updateChart([5, 10, 15]);
updateChart([20, 30]);

function updateChart(data) {
  // Data-join (circle now contains the update selection)
  let circle = svg.selectAll('circle')
      .data(data);
  
  // Enter (initialize the newly added elements)
  let circleEnter = circle.enter().append('circle')
      .attr('fill', '#707086')
  
  // Enter and Update (set the dynamic properties of the elements)
  circleEnter.merge(circle)
      .attr('r', d => d)
      .attr('cx', (d,index) => (index * 80) + 50)
      .attr('cy', 80);
  
  // Exit
  circle.exit().remove();
}
```
*Result:*

![Update Pattern Example](images/data_join_example.png?raw=true "Update Pattern Example")

### Key function

For the sake of clarity and simplicity, we have not mentioned an important detail - the *key function* - in the last example.

**The key function defines which datum should be assigned to which element.**

```javascript
let circle = svg.selectAll("circle")
	.data([5, 10, 15]);
```

The code ```.selectAll("circle")``` selects all circle-elements and if we chain it with ```.data([5, 10, 15])``` we are joining the given data with the selected circles. The default key function applies and the keys are assigned by index. In our example it will use the first three circles that it finds. The first datum (first item in our array) and the first circle have the key "0", the second datum and circle have the key "1", and so on.

Assume, that we have implemeted the "enter, update, exit"-pattern and appended the three circles to the webpage.

We can now start the pipeline again, with a slightly different array:

```javascript
let circle = svg.selectAll("circle")
	.data([10, 15]);
```

![Key Function (1)](images/key-function-1.png?raw=true "Key Function (1)")

The index will be used again as the default key to match the new data to the actual circles. There are three circles on the webpage and two items in the new dataset. Therefore, the last circle will be removed and the other two circles will be bound to the new data.

This is the simplest method of joining data and often sufficient. However, when the data and the elements are not in the same order, joining by index is insufficient. In this case, you can specify a key function as the second argument (callback function). The key function returns the key for a given datum or element:

```javascript
// use the actual data value as key function
let circle = svg.selectAll("circle")
	.data([5, 10, 15], d => d) // could be also d => d.customer_id if d is an object
	
// enter, update, exit

circle = svg.selectAll("circle")
	.data([10, 15], d => d)

// enter, update, exit
```

In the above example, the key function allows us to map the data value directly instead of the default by-index behavior:

![Key Function (2)](images/key-function-2.png?raw=true "Key Function (2)")

This means, we can update the appropriate elements without having to delete and re-add elements. We can update them in place!

> *"The key function also determines the enter and exit selections: the new data for which there is no corresponding key in the old data become the enter selection, and the old data for which there is no corresponding key in the new data become the exit selection. The remaining data become the default update selection." - Mike Bostock*

You can easily adapt the enter, update, exit sequence for any other visualizations. Using the D3 enter-update-exit pattern, code is more flexible and can accomodate changing data as well as different sized datasets.

### `join()` shortcut for the enter-update-exit pattern

Since D3 version 5, you can alternatively use the `join()` method which is simpler and more convenient for many cases. Instead of specifying enter, update, and exit operations separately, `join()` handles all three stages automatically. New elements will be added, existing elements will be updated, and obsolete elements will be removed.

The *updateChart* function from the previous example can be shortened to:

```javascript
function updateChart(data) {
  svg.selectAll('circle')
      .data(data)
    .join('circle')
      .attr('fill', '#707086')
      .attr('r', d => d)
      .attr('cx', (d,index) => (index * 80) + 50)
      .attr('cy', 80);
}
```

Nevertheless, sometimes it is important to have fine grained control over the enter, update, and exit selections, and a thorough understanding of this core mechanism in D3 is crucial.

You can also extend the `join()` statement to control what happens on enter, update and exit. Read more about this method and see an example: [https://observablehq.com/@d3/selection-join](https://observablehq.com/@d3/selection-join)

&nbsp; 

## 2. <a name="updating-scales-axes">Updating Scales and Axes</a>

Whenever you get new data or existing data changes, you need to recalibrate your scales, otherwise elements will get clipped, or the visualization will show the wrong information. Appending axes multiple times will lead to overlapping tick labels and make it unreadable.

In the last tutorial, you learned how to create basic scales:

```javascript
vis.yScale = d3.scaleLinear()
	.domain([0, d3.max(vis.data, d => d.price)])
	.range([0, vis.height]);
```

When the data changes, the **range** does not have to be updated, because the visual size of your chart usually does not change. You do need to update the **domain**, though, because the minimum and maximum of the data might change.

We can use a similar principle for updating axes. We initialize an axis and create an SVG group only once. Every time we update the chart, we use the .call() function to apply the correct scale to the axis and rerender it within the given SVG group.

The following class structure indicates when scales and axis are initialized, and when they need to be updated.

```javascript
class MyChart {
	constructor(_config, data) {
		// ... Class constructor ...
		this.initVis();
	}
	
	initVis() {
		let vis = this;
		
		// ... Other intialization code ...
		
		// Initialize scale
		vis.yScale = d3.scaleLinear()
			.range([0, vis.height]);
		
		// Initialize axis
		vis.yAxis = d3.axisLeft()
	    	.scale(vis.yScale);
	   
	   // Append axis group
	   vis.yAxisGroup = vis.chart.append('g')
	   		.attr('class', 'y-axis axis');
	}
	
	updateVis() {
		let vis = this;
		
		// ... Other code to prepare the data etc. ...
		
		// Update scale domain
		vis.yScale.domain([0, d3.max(vis.data, d => d.price)]);
	}
	
	renderVis() {
		let vis = this;
		
		// ... Other code to render chart ...
		
		// Update the axis: guarantees that the axis component uses the correct scale
		// (adjusted to match the new input domain)
		vis.yAxisGroup.call(vis.yAxis);
	}
}
```

&nbsp;

## 3. <a name="handling-user-input">Handling User Input</a>

With D3 visualizations, you can leverage the full power of web technologies to create interactive visualizations. For example, you can add HTML forms to enable user input or bind event listeners directly to SVG elements.

We can bind an event listener to any DOM element using `d3.selection.on()` method. We show this in the following example where we use an HTML input slider to change the radius of an SVG circle.

*HTML*

```html
<!-- ... -->
<body>
    <!-- HTML form -->
    <div>
        <label for="radius-slider">Radius: <span id="radius-value">60</span></label>
        <input type="range" min="1" value="60" max="80" id="radius-slider">
    </div>

    <!-- Empty SVG drawing area -->
    <svg id="chart" width="200" height="200"></svg>
    
    <script src="js/d3.v6.min.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

*JS*

```javascript
const svg = d3.select('svg');

// Show circle with initial radius of 60px
const circle = svg.append('circle')
    .attr('cx', 100)
    .attr('cy', 100) 
    .attr('fill', 'none')   
    .attr('stroke', 'green') 
    .attr('r', 60);

function updateCircle(radius) {
  circle.attr('r', radius);
}
```

```javascript
// Event slider for input slider
d3.select('#radius-slider').on('input', function() {
  // Update visualization
  updateCircle(parseInt(this.value));

  // Update label
  d3.select('#radius-value').text(this.value);
});
```

*Result*

![Change radius via slider](images/input_slider_radius_example.gif?raw=true "Change radius via slider")

You can see the complete example on [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-change-radius-with-slider) and change the code interactively.

This was a very simple example. We have the following recommendations when you use the previously introduced class structure for visualizations:

* Add global event listeners (e.g., checkboxes, sliders, ...) in `main.js`. The advantage is that `main.js` acts as a controller and you can trigger changes in multiple visualization components.
* Update configurations (e.g., `myChart.config.radius = 100`) or data (i.e., `myChart.data = data`).
* Call `myChart.updateVis()` to update the visualization accordingly.
* Add chart-specific events within the `myChart.js` class. For example, when you want listen to *mouseover* events on SVG circles, use D3's `.on()` function when you render the circles:
	
	```javascript
	svg.selectAll('circle')
   		.data(data)
	  .join('circle')
      	.attr('fill', 'green')
      	.attr('r', 4)
      	.attr('cx', d => vis.xScale(d.x))
      	.attr('cy', d => vis.yScale(d.y))
      	.on('mouseover', d => console.log('debug, show tooltip, etc.'))
	```

Alternatively, you could also use [jQuery](http://jquery.com/) or other JS libraries to handle events.

&nbsp;

## 4. <a name="animated-transitions">Animated Transitions</a>

By now, you should have a solid understanding of how to select elements and update various types of SVG attributes:

```javascript
d3.selectAll('circle').attr('fill', 'blue');
```

We selected all *circles* and changed the *fill color*.

D3 evaluates every *attr()* statement immediately, so the changes happen right away. But sometimes it is important to show the user what's happening between the states and not just the final result. D3 provides the `transition()` method that makes it easy to create these smooth, animated transitions between states:

```javascript
d3.selectAll('circle').transition().attr('fill", 'blue');
```

When you add `.transition()`, ***D3 interpolates between the old values and the new values***, meaning it normalizes the beginning and ending values, and calculates all their in-between states.

In our second example, the circle color changes from red to blue over time. The default time span is 250 milliseconds but you can specify a custom value by simply using the `duration()` method directly after `transition()`. We assume there are existing red circles on the web page.

This example shows an animation from red to blue (3 seconds):

```javascript
d3.selectAll('circle')
	.transition()
	.duration(3000)
	.attr('fill', 'blue');
```
![Transition with duration](images/transition-duration.gif?raw=true "Transition with duration")

If you need to delay an animation, you can add the `delay()` method right after `transition()`.

#### Transitions Are Per-Element and Exclusive

> *"Each element transitions independently. When you create a transition from a selection, think of it as a set of transitions, one per element, rather than a single mega-transition running on multiple elements. Different elements can have different delays and duration, and even different easing and tweens. Additionally, transition events are dispatched separately for each element. When you receive an end event for a given element, its transition has ended, but other transitions may still be running on other elements."* <br> &raquo; [http://bost.ocks.org/mike/transition/](http://bost.ocks.org/mike/transition/))


### Animation for Visualization

If done right, animations can make a visualization better and help engage the user. If done wrong (i.e., you don't follow key principles), you will achieve exactly the opposite results.
 
#### Pros
 
- Transitions show what is happening between states and add a sense of continuity to your visualization
- Animations can draw the user's attention to specific elements or aspects
- Animations can provide the user with interactive feedback
 
 
#### Cons
- Too many transitions will confuse the user (e.g., overused PowerPoint effects) 
- If the transition is not continuous, animations look strange and can even be deceiving based on the interpolation used.
- Animation across many states is the least effective use case for
data analysis tasks. In this case, use a static comparison of several charts/images (e.g., small multiples) instead of creating video-like animations.

&nbsp;

## 5. <a name="tooltips">Tooltips</a>

### HTML tooltips

When you create interactive visualizations, you often want to show tooltips to reveal more details about your data to your audience. There are different approaches to achieve this but we recommend the creation of a global tooltip container outside of the SVG that you can show/hide and position whenever users hover over a mark. This approach allows you to create more complex tooltip objects that can be styled with CSS and contain images or even small visualizations.

Example implementation workflow:

* Add tooltip placeholder to the *HTML* file:
	
	```html
	<div id="tooltip"></div>
	```

* Set absolute position, hide tooltip by default, and define additional optional styles in *CSS*:

	```css
	#tooltip {
		position: absolute;
		display: none;
		/* ... other tooltip styles ... */
	}
	```
* In *JS* (D3), update tooltip content, position, and visibility when users hovers over a mark. We distinguish between three different states: `mouseover`, `mousemove`, and `mouseleave` (in case of small marks, we add the positioning to the `mouseover` function and leave out `mousemove`). 

	```js
	myMarks
        .on('mouseover', (event,d) => {
          d3.select('#tooltip')
            .style('display', 'block')
            // Format number with million and thousand separator
            .html(`<div class="tooltip-label">Population</div>${d3.format(',')(d.population)}`);
        })
        .on('mousemove', (event) => {
          d3.select('#tooltip')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });
	```

#### Examples

[Sortable bar chart with tooltips](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-interactive-bar-chart)

![Interactive Bar Chart](images/interactive_bar_chart_example.gif?raw=true "Interactive Bar Chart")

[![Codesandbox: Interactive Bar Chart](images/codesandbox_d3-interactive-bar-chart.png?raw=true "Codesandbox: Interactive Bar Chart")](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-interactive-bar-chart)

[Interactive scatter plot with filters and tooltips](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-interactive-scatter-plot)

![Interactive Scatter Plot](images/interactive_scatter_plot_example.gif?raw=true "Interactive Scatter Plot")

[![Codesandbox: Interactive Scatter Plot](images/codesandbox_d3-interactive-scatter-plot.png?raw=true "Codesandbox: Interactive Scatter Plot")](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-interactive-scatter-plot)

### Tooltips for path elements (fuzzy position)

Until now, we have created tooltips only for basic SVG elements, such as circles or rectangles. When users hover over a specific mark, we can easily get the underlying data and show it at that position. However, when we create line or area charts (SVG paths), we typically want to allow users to hover anywhere over a path and see a tooltip, and not just at a few specific points.

![Tooltip position](images/tooltip_position.png?raw=true "Tooltip position")

We illustrate the mechanism for showing tooltips at fuzzy positions based on a line chart (`date` on x-axis, `stock price` on y-axis). 

1. We add a tracking area that covers the whole chart. Whenever users place their mouse cursor inside this area, we want to show a tooltip. After every `mousemove` event we need to update the tooltip accordingly.

	```js
	const trackingArea = vis.chart.append('rect')
	    .attr('width', width)
	    .attr('height', height)
	    .attr('fill', 'none')
	    .attr('pointer-events', 'all')
	    .on('mouseenter', () => {
          vis.tooltip.style('display', 'block');
        })
        .on('mouseleave', () => {
          vis.tooltip.style('display', 'none');
        })
        .on('mousemove', function(event) {
	      // See code snippets below
	    })
	```

2. Get the x-position of the mouse cursor using `d3.pointer()`. We only want to show a stock price tooltip for a specific date and the y-position is not relevant in this case, but can be extracted similarly.

	```js
	const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
	```

3. We have used D3 scales multiple times to convert data values (input domain) to pixels (output range). We can now use the `invert()` function to do the opposite and get the date that corresponds to the mouse x-coordinate.

	```js
	const date = vis.xScale.invert(xPos);
	``` 

4. We want to find the data point (stock price) based on the selected date. Therefore, we use a special helper function `d3.bisector` that returns the nearest `date` (in our dataset) that falls to the left of the mouse cursor.

	We initialize the d3.bisector somewhere outside of `.on('mousemove')`:
	
	```js
	const bisect = d3.bisector(d => d.date).left;
	```
	
	Then we can use `biscect()` to find the nearest object `d` in our dataset.<br>
	(Don't worry too much if this looks cryptic to you. Read more details in these tutorials: [d3noob.org](http://www.d3noob.org/2014/07/my-favourite-tooltip-method-for-line.html), [observable](https://observablehq.com/@d3/d3-bisect))
	
	```js
	const index = vis.bisectDate(vis.data, date, 1);
  	const a = vis.data[index - 1];
  	const b = vis.data[index];
  	const d = b && (date - a.date > b.date - date) ? b : a;
  	// d contains: { date: ..., stockPrice: ... }
	```
	
	At the end we can display an HTML or SVG tooltip with the available mouse coordinates and the corresponding data.
	
See the complete interactive line chart example on [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-interactive-line-chart).

![Interactive line chart](images/interactive_line_chart_example.gif?raw=true "Interactive line chart")

[![Codesandbox: Interactive Line Chart](images/codesandbox_d3-interactive-line-chart.png?raw=true "Codesandbox: Interactive Line Chart")](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-interactive-line-chart)

---

*Sources:*

* [Harvard's visualization course (CS171)](https://www.cs171.org/)
* [http://www.d3noob.org/2014/04/using-html-inputs-with-d3js.html](http://www.d3noob.org/2014/04/using-html-inputs-with-d3js.html)