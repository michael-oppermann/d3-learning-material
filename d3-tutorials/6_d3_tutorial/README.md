# VI. Advanced Concepts

#### Learning Objectives

In this tutorial, we will introduce a few more concepts and additional libraries that can be used in conjunction with D3. While in the last few weeks the goal was to cover a core set of D3 concepts in depth, we will now discuss a range of topics on a high-level and provide pointers to additional resources.

#### Tutorial Outline

1. [Graphs & Trees](#graphs-trees)
2. [Scrollytelling](#scrollytelling)
3. [Responsive Visualizations](#responsive-visualizations)
4. [Annotations](#annotations)
5. [Scalable Visualizations with Canvas](#canvas)



## 1. <a name="graphs-trees">Graphs & Trees</a>

In the previous tutorials and examples, we have visualized distributions, trends, rankings, correlations, and geographical maps. Other common objectives are to visualize relationships in a network or hierarchical structures. The elements in these visualizations are usually referred to as nodes or vertices, and the relationships are links or edges. D3 provides layout generators that help us to lay out these nodes and edges as graphs or trees.

### 1.1 Force-Directed Graph Layout

A common method to visualize networks is to use a force-directed graph showing nodes that are connected with lines. This graph layout is based on a physical simulation: a common configuration is to have nodes repel one another while the edges are considered springs that pull each other close. As a result, nodes that are tightly connected will be close to each other while nodes that are not connected are far apart. The d3-force module provides an API to set up such a simulation and supports a broad set of parameters to control various forces.

We briefly describe the process to visualize a small network of character co-occurences in *Les Misérables* below.

1. **Load data**

	The network data is given as `nodes` and `links`.
	
	```js
	"nodes": [
	    {"id": "Myriel", "group": 1},
	    {"id": "Napoleon", "group": 1},
	    {"id": "Mlle.Baptistine", "group": 1},
   		...
   ],
   "links": [
	    {"source": "Napoleon", "target": "Myriel", "value": 1},
	    {"source": "Mlle.Baptistine", "target": "Myriel", "value": 8},
	    {"source": "Mme.Magloire", "target": "Myriel", "value": 10},
   ]
	```

2. **Initialize force simulation**
	
	```js
	const simulation = d3.forceSimulation()
		.force('link', d3.forceLink().id(d => d.id))
		.force('charge', d3.forceManyBody())
		.force('center', d3.forceCenter(config.width / 2, config.height / 2));
   ```
   
   `forceManyBody()` is used to simulate electrostatic charge causing nodes to repel each other. `forceCenter()` attracts nodes towards the centre of the SVG area. `forceLink().id(...)` links nodes to each other based on their IDs.

3. **Add data to the simulation**
	
	```js
	simulation.nodes(data.nodes);
   simulation.force('link').links(data.links);
   ```

4. **Draw nodes and links**
	
	```js
	// Add links
    const links = chart.selectAll('line')
        .data(data.links, d => [d.source, d.target])
      .join('line');

    // Add nodes
    const nodes = chart.selectAll('circle')
        .data(data.nodes, d => d.id)
      .join('circle')
        .attr('r', 5)
	```
   
   Data can be updated dynamically and we do not need to redraw the graph entirely when it changes.
   
   As you may have noticed, we have not specified any coordinates yet. This happens in an iterative process: (1) coordinates are calculated based on the force simulation (2) node and link positions are updated. These two steps are repeated until the system eventually finds an equilibrium or until we stop the simulation. We refer to these iterations as *ticks*.
   
   In our implementation, we listen for tick events as the simulation runs and update the positions:
   
   ```js
   simulation.on('tick', () => {
		links
			.attr('x1', d => d.source.x)
			.attr('y1', d => d.source.y)
			.attr('x2', d => d.target.x)
			.attr('y2', d => d.target.y);
      
		nodes
			.attr('cx', d => d.x)
			.attr('cy', d => d.y);
    });
   ```
   
   This process is computationally expensive but works fine for smaller graphs.
   
You can see the complete source code of this example on [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-force-directed-graph).

[![D3 Force-Directed Graph](images/codesandbox_d3-force-directed-graph.png?raw=true "D3 Force-Directed Graph")](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-force-directed-graph)

#### Resources on network visualizations with D3

* [Mike Bostock's observable notebook demonstrates how to update a force-directed graph](https://observablehq.com/@d3/modifying-a-force-directed-graph)
* [Mike Bostock implemented the *Les Misérables* example with dragable nodes](https://observablehq.com/@d3/force-directed-graph)
* [Steve Haroz' d3-force testing ground lets you interactively try various settings and combinations of forces](https://bl.ocks.org/steveharoz/8c3e2524079a8c440df60c1ab72b5d03)
* [Elijah Meeks shared many different network visualizations as D3 blocks](https://bl.ocks.org/emeeks)
* [Detailed tutorial on D3's force layout by *D3 in Depth*](https://www.d3indepth.com/force-layout/)


### 1.2 Tree Layout

D3 also facilitates the creation of a wide range of hierarchical visualizations. We picked the "tidy tree" layout as one example but you should check out [d3-hierarchy](https://github.com/d3/d3-hierarchy) to learn more about other popular techniques.

1. Load data

	For this example, we use a simple JS object that has already a hierarchical structure. In other cases, the data may be given as tabular data and requires some preprocessing.
	
	```js
	const rawData = {
	  name: "root",
	  children: [
	    {name: "child #1"},
	    {
	      name: "child #2",
	      children: [
	        {name: "grandchild #1"},
	        {name: "grandchild #2"},
	        {name: "grandchild #3"}
	      ]
	    }
	  ]
	};
	```

2. Create an abstract data representation to ease traversing of the hierarchy
	
	We use `d3.hierarchy()` to create an internal hierarchical representation of the data. It computes the depth for all nodes and provides various methods to navigate the tree. For example `node.descendants` returns an array of descendant nodes: the given node, then each child, and each child’s child, and so on.
	
	```js
	const data = d3.hierarchy(rawData);
	```

3. Compute the tree layout

	In the next step, we use `d3.tree()` to compute the layout for the hierarchical data. This method generates x- and y-coordinates of all nodes based on the given chart size.
	
	```js
	const treeData = d3.tree().size([height, width])(data);
	```
	
4. Draw nodes and edges	
	
	Finally, we can draw the SVG elements based on the precomputed layout.
	
	```js
	// Draw the edges
    const link = chart.selectAll('path')
        .data(treeData.links())
      .join('path')
        .attr('class', 'edge')
        .attr('d', d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));
      
    // Draw the nodes
    const node = chart.selectAll('g')
        .data(treeData.descendants())
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
	```
	
You can see the complete source code of this example on [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-tidy-tree).

[![D3 Tree](images/codesandbox_d3-tidy-tree.png?raw=true "D3 Tree")](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-tidy-tree)

#### Resources on tree visualizations

* [Fil provides a great overview of d3.hierarchy() with visual examples](https://observablehq.com/@d3/d3-hierarchy)
* [Mike Bostock's implementation of a collapsible tree](https://observablehq.com/@d3/collapsible-tree])
* [Description of various layouts by *D3 in Depth*](https://www.d3indepth.com/layouts/)

## 2. <a name="scrollytelling">Scrollytelling</a>

*Scrollytelling* or *scroll-based interaction* is a popular technique to reveal or alter content based on the user's scroll behavior. Instead of overwhelming the audience with a complex multi-view visualization, scrollytelling allows us to guide users through the data and show different perspectives step by step. Thus, scrollytelling is often used for data journalism projects. Some noteable examples are:

* [https://www.nytimes.com/interactive/2016/07/07/world/americas/bolivia-climate-change-lake-poopo.html](https://www.nytimes.com/interactive/2016/07/07/world/americas/bolivia-climate-change-lake-poopo.html)
* [https://www.theguardian.com/us-news/ng-interactive/2015/oct/19/homan-square-chicago-police-detainees](https://www.theguardian.com/us-news/ng-interactive/2015/oct/19/homan-square-chicago-police-detainees)
* [https://www.nytimes.com/interactive/2014/06/05/upshot/how-the-recession-reshaped-the-economy-in-255-charts.html](https://www.nytimes.com/interactive/2014/06/05/upshot/how-the-recession-reshaped-the-economy-in-255-charts.html)
* [https://pudding.cool/2017/03/hamilton/index.html](https://pudding.cool/2017/03/hamilton/index.html)

We recommend the library [Waypoints](http://imakewebthings.com/waypoints/) to listen for scroll events. We just need to define several sections on the web page and initialize them as *waypoints* in JS. Events are then automatically triggered when users scroll to a specific section. For more complex applications, you may need to [implement your own scroller](https://vallandingham.me/scroller.html) to get more flexibility.

You can see an example scrollytelling implementation on [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-waypoints-scrollytelling). At the beginning, the visualization shows rectangles that are arranged in a grid layout. In the subsequent steps, we highlight specific rectangles using a different colour, and in the last step we convert a subset of the rectangles into a bar chart.

[![D3 and Waypoints Scrollytelling](images/codesandbox_d3-waypoints-scrollytelling.png?raw=true "D3 and Waypoints Scrollytelling")](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-waypoints-scrollytelling)

In the following, we describe the general implementation steps:

1. **Page layout**
	
	There are many different ways to arrange content but typically scrollytelling visualizations are divided into two main columns. In one column is the actual visualization that stays in place but the visual representation changes. The second column contains all the text and other material that we want to show next to the visualizations. Users can scroll through the text column in the same way as with regular web pages.
	
	We create the page layout with HTML and CSS. The text column is divided into different sections or steps that we will use to trigger events.
	
	```html
	<div class="container">
        <div id="vis-column"></div>
        <div id="text-column">
            <div class="step" id="step0">Step 0</div>
            <div class="step" id="step1">Some other text for step 1</div>
            <div class="step" id="step2">More text for step 2</div>
            ...
        </div>
    </div>
   ```
   
   The vis column must have a fixed position:
   
   ```css
   #vis-column {
	  position: fixed;
	  width: 400px;
	}
   ```

2. **Initialize event listener using the Waypoints library**

	After creating a div container for each step and including the Waypoints library in the HTML document, we need to initialize the waypoints in JS.
	
	We can use D3 to select all containers with the class `step`
	
	```js
	// Create a waypoint for each `step` container
	const waypoints = d3.selectAll('.step').each( function(d, stepIndex) {
		return new Waypoint({
			// `this` contains the current HTML element
			element: this,
			handler: function(direction) {
		    // Check if the user is scrolling up or down
		    const nextStep = direction === 'down' ? stepIndex : Math.max(0, stepIndex - 1)
		    
		    // Update visualization based on the current step
		    scrollerVis.goToStep(nextStep);
		  },
		  // Trigger scroll event halfway up. Depending on the text length, 75% might be even better
		  offset: '50%',
		});
	});
	```

3. **Initialize visualization**

	Similar to all our previous visualizations, we set up the SVG drawing area and create any static elements. We also bind the data to SVG elements:
	
	```js
	// Bind data to rectangles but don't specify any attributes yet
	vis.rectangles = vis.chart.selectAll('rect')
		.data(data).join('rect');
	```

4. **Create steps**

	We need to change the visualization based on the currently active *step*. There are many different ways to implement this mechanism. We decided to create a function for each step and store the function names in a config object.
	
	```js
	vis.config.steps = ['step0', 'step1', 'step2', ...]
	```
	
	```js
	step0() {
		// ...
	}
	
	step1() {
		// ...
	}
	```
	
	We can then call a function based on the given step index:
	
	```js
	goToStep(stepIndex) {
   		this[this.config.steps[stepIndex]]();
	}
	```

5. **Change visual representation**
	
	Inside theses function we need to update the attributes. For example, we can change the colour of some rectangles:
	
	```js
	step1() {
		const vis = this;
		vis.rect.transition()
			.attr('fill', d => d.active ? 'red' : '#ccc');
	}
	```
	
	**Important:** You need to consider both scroll directions when you update the visualization. For example, imagine the x and y positions of the SVG elements remain unchanged between step 0 to step 2. Thus, we initialize the positions in step 0 and update other attributes in step 1 and 2. Step 3 brings major layout changes and the element positions are updated. This workflow works when users scroll from step 0 to step 3. Howevever, when users scroll up from step 3 to step 2 we need to set the positions again or otherwise the visualization will break.
	
	You can see the complete source code of this example on [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-waypoints-scrollytelling).
	

#### Resources on scrollytelling

* [Russell Goldenberg surveys various scrollytelling implementations](https://pudding.cool/process/how-to-implement-scrollytelling/) and also explains [responsive scrollytelling](https://pudding.cool/process/responsive-scrollytelling/) for mobile devices.
* [Mike Bostock's rules for employing scrolling effectively](https://bost.ocks.org/mike/scroll/)
* [Jim Vallandingham collected further scrollytelling examples](https://vallandingham.me/scroll_talk/examples/)
* [Cuthbert Chow's storytelling tutorial](https://towardsdatascience.com/how-i-created-an-interactive-scrolling-visualisation-with-d3-js-and-how-you-can-too-e116372e2c73)

## 3. <a name="responsive-visualizations">Responsive Visualizations</a>

In all the tutorials and D3 examples we implemented fixed-sized visualizations to avoid another level of complexity. However, in practice, the wide variety of screen sizes and the growing trend of using phones and tablets to consume visualizations should not be neglected. In the following, we describe a few steps to make a scatter plot responsive to the screen resolution. These steps can be also applied to other visualization types. More complex visualizations and, in particular, annotations may require additional manual tweaking.

1. We specify only the *height* of the SVG container in the chart configuration (`config.containerHeight`). The container *width* is flexible.

2. We initialize all static elements, scales, and axes without specific sizes (`initVis()` in visualization class).

3. Whenever `updateVis()` gets called, we check the width of the parent container (or web page) and set all size attributes.

	* Get the width of a div container (i.e., `<div id="scatterplot"></div>`):
	
		```js
		config.containerWidth = document.getElementById('scatterplot').clientWidth;
		```
	
	* Update SVG size
	
		```js
		svg
			.attr('width', config.containerWidth)
	   		.attr('height', config.containerHeight);
		```
	
	* Update inner chart size based on margin specifications:

		```js
		config.width = config.containerWidth - config.margin.left - config.margin.right;
		config.height = config.containerHeight - config.margin.top - config.margin.bottom;
		```
	
	* Update scales, axes, and so on:

		```js
		xAxisG
      		.attr('transform', `translate(0,${config.height})`);
		```
		
		```js
		xScale
			.range([0, config.width])
			.domain([minData, maxData]);
		```

4. Update the chart whenever the window size changes:

	We listen to the window resize event and call `updateVis()`. If D3's enter-update-exit pattern is implemented correctly, the chart will not be removed and redrawn entirely when the update function is called, and instead only the SVG element attributes are updated.
	
	The resize event gets triggered on page load so we set a flag to prevent an initial update.

	```js
	let pageLoad = true;
	d3.select(window).on('resize', () => {
		if (pageLoad) {
			pageLoad = false;
		} else {
			scatterplot.updateVis()
		}
	});
	```

5. Specify a maximum width 

	`document.getElementById('scatterplot').clientWidth` returns the full width of the div container, which might be too big on a large monitor. We can just use CSS to set a maximum width:
	
	```css
	#scatterplot {
		max-width: 1000px;
	}
	``` 

6. Flexible height

	In some cases you might also want to adjust the height of a visualization. Based on the given workflow it should be straightforward to implement it. Always keep in mind to initialize elements without size specifications and update them dynamically later.

You can see the complete source code of the responsive scatterplot on [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-responsive-scatter-plot).

[![D3 Responsive Scatterplot](images/codesandbox_d3-responsive-scatter-plot.png?raw=true "D3 Responsive Scatterplot")](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-responsive-scatter-plot)

## 4. <a name="annotations">Annotations</a>

When you create visualizations for communication purposes, annotations are an essential but often neglected component. Text labels, lines, arrows, and other shapes can help you to make a visualization more accessible to your target audience. Annotations can improve clarity, for example, by explaining data anomalies or highlighting interesting patterns in a visualization.

There are many different ways to create annotations and the design decisions largely depend on the visualization type, the intended goal, and your users. Changing the mark colours and adding a few text labels can already be a very useful cue to grab the attention of the audience. With your acquired D3 knowledge, it should be relatively easy to make those chart extensions. Connecting text labels with lines or adding multi-line text with D3 is a more tedious process.

The powerful [d3-annotation library by Susie Lu](https://d3-annotation.susielu.com/) makes the process of creating D3 annotations much easier. We highly recommend that you check out the [official website](https://d3-annotation.susielu.com/). We have also created a line chart example to demonstrate different annotation types on [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-annotated-line-chart).

[![D3 Annotated Line Chart](images/codesandbox_d3-annotated-line-chart.png?raw=true "D3 Annotated Line Chart")](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-annotated-line-chart)

The figure below shows the structure of the annotations that are supported by the *d3-annotation* library. All annotations consist of three elements, a *note*, a *connector*, and a *subject*, that can be defined and customized through the annotation specification. 

![D3 Annotation](images/d3-annotation.png?raw=true "D3 Annotation")

In the following, we describe the general workflow for using the library based on our example:

1. **Create a line chart** that shows the Apple stock between 1997 and 2003. The implementation of the base visualization remains unchanged.

2. [**Download**](https://github.com/susielu/d3-annotation/blob/master/d3-annotation.min.js) the library and include it in the HTML file.

3. **Create the annotation specification**
	
	The specification contains all the annotation content and its positions, and thus is the most important part.
	
	```js
	const annotationSpecification = [{ ... }, { ... }];
	```
	
	
	*Example: Add a vertical line with a text label at the top.*
	
	```js
	{
		type: d3.annotationXYThreshold,
		note: { label: "iMac Release" }, // Text label
		className: "dashed",		// Use the class name to change the style with CSS
		subject: {					// The subject is a vertical line from top to bottom of the chart
			y1: 0,
			y2: height
		},
		disable: ["connector"],		// We don't want to draw a connector line between the subject and the text label
		dy: -height, 				// Show the text label at the top of the chart
		data: { Date: "8/15/1998"}	// The x-position of the data will be based on the data (`Date`)
	}
	```
	
	![Line Annotation](images/line-annotation.png?raw=true "Line Annotation")
	
	
	*Example: Add a circle to highlight a certain pattern in the line chart.*
	
	```js
	{
		note: {
			label: "Stock Split 2:1", 
			lineType:"none", 
			orientation: "leftRight", 
			align: "middle"
		},
		className: "anomaly",
		type: d3.annotationCalloutCircle,
		subject: { radius: 60 },				// Circle radius in pixels
		data: { Date: "6/21/2000", Close: 76},	// Position of the circle will be determined from the data
		dx: 70 // Offset x-position of the text label
	}
	```
	
	![Circle Annotation](images/circle-annotation.png?raw=true "Circle Annotation")
	
4. **Generate annotation elements and add them to the SVG**

 	When we add multiple annotations to one chart we can define a base type to keep the annotation specification shorter:
 	
 	```js
	const baseAnnotationType = d3.annotationCustomType(d3.annotationXYThreshold, {
		"note": {
			"lineType":"none",
			"orientation": "top",
			"align":"middle"
		}
	});
 	```
 	
 	Generate the annotation based on the given specifications:
 	
 	```js
 	const makeAnnotations = d3.annotation()
		.type(baseAnnotationType)
		.accessors({
			// Use existing D3 scales that we used for the chart to position the annotations
			x: d => xScale(new Date(d.Date)),
			y: d => yScale(d.Close)
		})
		.annotations(annotationSpecification)
		.textWrap(30);	// Break longer text into multiple lines
 	```
 	
 	Add the annotation elements to the SVG:
   
   ```js
   chart.call(makeAnnotations);
	```

See the complete source code on [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-annotated-line-chart).

#### Resources on visualization annotations

* [d3-annotation library by Susie Lu](https://d3-annotation.susielu.com/) and many [official examples](https://d3-annotation.susielu.com/#examples)
* [d3-annotation tutorial on d3-graph-gallery.com](https://www.d3-graph-gallery.com/graph/custom_annotation.html)
* [*Making Annotations First-Class Citizens in Data Visualization* by Elijah Meeks](https://medium.com/@Elijah_Meeks/making-annotations-first-class-citizens-in-data-visualization-21db6383d3fe)
	
## 5. <a name="canvas">Scaleable Visualizations with Canvas</a>

The rendering method that is used in D3 visualizations is typically **SVG** because it comes with multiple advantages:

* We can bind data to SVG elements to dynamically set attributes which works very well with d3.
* We can select and update specific SVG elements.
* We can use CSS to style SVG elements.

But the disadvantage of SVG is that it is not very scalable if the visualization contains more than a few thousand elements. In some cases, you may notice perfomance issues already with few hundred complex SVG paths.

The alternative way to render web-based visualizations is to use [Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) which is significantly more scalable but has a more complex low-level API than SVG. 

In the following, we briefly describe how to create a scatterplot with 70K points using a combination of SVG and Canvas. We draw the axes in SVG because the D3 helper functions `d3.axisBottom()` and `d3.axisLeft()` return SVG elements. The points are drawn inside a Canvas container.

1. Create Canvas and SVG layers

	* We add a div container to the HTML page and set the CSS attribute `position:relative;`

		```html
		<div id="scatterplot"></div>
		```
	
	* We append the two layers using D3. The SVG layer has the same size as the parent container while the canvas layer is slightly smaller because it does not include the axes.

		```js
	    const canvas = container.append('canvas')
	        .attr('class', 'vis-layer')
	        .attr('width', config.width)
	        .attr('height', config.height)
	        .style('transform', `translate(${config.margin.left}px,${config.margin.top}px)`);
		```
	
		```js
		// Add SVG layer
	   const svg = container.append('svg')
	        .attr('class', 'vis-layer')
	        .attr('width', config.containerWidth)
	        .attr('height', config.containerHeight);
		```
		
	* To make sure that both layers are superimposed, we add the class `vis-layer` and set the CSS attribute:

		```css
		.vis-layer {
			position:absolute;
		}
		```

2. Initialize scales and axes: This step is identical to previously discussed D3 visualizations based on SVG, and thus we do not repeat those steps here.

3. Select the drawing context.

	* The first difference in drawing points inside of a Canvas-container compared to SVG is that we need to select the drawing context. We cannot just append elements to `canvas` but instead need to select the two-dimensional rendering context first:
	
	```js
	const canvasContext = canvas.node().getContext('2d');
	```

4. Draw the points

	* Clear the Canvas whenever the data changes. As mentioned earlier, we cannot bind data to the elements and always need to redraw all points:
	
		```js
		const canvasContext.clearRect(0, 0, config.width, config.height);
		```
		
	* Loop through data array and call our own rendering function for each point

		```js
		data.forEach(d => renderPoint(d));
		```
		
	* Inside the `renderPoint()` function, we implement the Canvas-specific drawing instructions:

		```js
		function renderPoint(point) {
			// Position of current point using scales
	   		const cx = xScale(point.x);
	    	const cy = yScale(point.y);
	    	
	    	// Set colour and opacity
	    	// (We could also use a colour scale and set a data-dependent colour value)
	    	const pointColor = d3.color('steelblue');
    		pointColor.opacity = 0.05;
    		
    		// d3.color() returns the colour in rgba format that can be used for Canvas' fillStyle attribute
    		canvasContext.fillStyle = pointColor;
    		
    		// Draw point
		    canvasContext.beginPath();
		    canvasContext.moveTo(cx + config.radius, cy);
		    canvasContext.arc(cx, cy, config.radius, 0, 2 * Math.PI);
		    canvasContext.fill();
	   }
		```

You can see the complete source code of a multi-class scatterplot with 70K points on [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-canvas-scatter-plot).

[![D3 Canvas Scatterplot](images/codesandbox_d3-canvas-scatter-plot.png?raw=true "D3 Canvas Scatterplot")](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-canvas-scatter-plot)

Compared to a regular SVG-based scatterplot we need more steps to draw basic circles using Canvas which becomes even more complex when we want to add other shapes or interactivity. Thus, we only recommend to use Canvas for performance reasons.

#### Resources on Canvas-based visualizations

* [Nadieh Bremer describes her process in creating an interactive circle packing visualization and shares many useful resources](https://www.visualcinnamon.com/2015/11/learnings-from-a-d3-js-addict-on-starting-with-canvas/)
* [Andrew Reid provides a detailed comparison between SVG- versus Canvas-based D3 visualizations](https://stackoverflow.com/a/50143500)
* [Maximiliano Duthey explains how to add D3's zooming and panning functionality to a scatterplot](https://medium.com/@xoor/implementing-charts-that-scale-with-d3-and-canvas-part-2-d9f657f2757b)
* [Janu Verma’s D3 block includes JS code for adding interactive tooltips](http://bl.ocks.org/Jverma/70f7975a72358e6d69cdd4bf6a0569e7)



---

*Other sources:*

* [dataviscourse.net](https://www.dataviscourse.net/)