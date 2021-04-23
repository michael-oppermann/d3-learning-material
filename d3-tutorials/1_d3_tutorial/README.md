# I. Intro to D3

In this tutorial you will learn how to create your first D3 implementation. We will show you how to draw basic SVG shapes and how to bind it to data values. We will also reiterate advanced JS concepts: *method chaining*, *anonymous functions*, *asynchronous execution*, and *callbacks*.


#### Tutorial Outline

1. [D3 Project](#d3-project)
2. [A Brief Overview of SVG](#svg-overview)
3. [Adding a DOM Element with D3](#add-to-dom)
4. [Binding Data to Visual Elements](#binding-data)


## 1. <a name="d3-project">D3 Project</a>

D3 (Document-Driven-Data) is a powerful JS library for manipulating documents based on data.

> D3 allows you to bind arbitrary data to a Document Object Model (DOM), and then apply data-driven transformations to the document. For example, you can use D3 to generate an HTML table from an array of numbers. Or, use the same data to create an interactive SVG bar chart with smooth transitions and interaction.
> 
> \- [*D3, Mike Bostock*](https://d3js.org/)

D3 is not a monolithic framework. Instead, D3 is a suite of many small modules with minimal dependencies that can be loaded independently. These modules provide low-level building blocks, such as selections, scales, shapes, and so on, rather than configurable charts. Although D3 is a popular choice for implementing web-based visualizations, the low-level primitives and wide range of functionality can be used for all kinds of things.

In this course, we will use the official [D3 bundle](https://d3js.org/d3.v6.min.js) that contains all the default modules to make things easier. Once you are more experienced, you don't need to always load the entire library and you can include only the parts that you actually use.


#### D3 Version

We will use D3 version 6. When looking up code examples online, be aware that many examples still use version 3, which was a lot less modular than newer versions. The differences between version 4 and version 6 are mostly minor but some of the concepts are simplified and new features are introduced. You can look up the differences between major releases in the [D3 docs](https://github.com/d3/d3/blob/master/CHANGES.md).


#### D3 Integration

*This is a brief overview of how to set up a basic D3 project. This should not be completely new and might look different for larger web applications.*

Before working with D3, you need to download the D3 library or include it from a content delivery network (CDN), such as [cdnjs.com](https://cdnjs.cloudflare.com/ajax/libs/d3/6.2.0/d3.min.js). In the assignment templates, we typically provide a rough project structure where D3 is already included:

```
project/	
	index.html
	css/
		style.css
	js/
		d3.min.js
		main.js
```

Below, we update our HTML boilerplate code to include a reference to D3, to another JS file (e.g., ```main.js```), and to an external CSS file (```style.css```). You should keep your own JS code separated from the JS libraries that you are using. In the future, you might have more than one library and don't want to change your code every time you update one of them (e.g., new release), so make sure you encapsulate your own code into separate files (libraries). Make also sure to include libraries before using them in your code (order of *script* tags).

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>D3 Project</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

	<script src="js/d3.min.js"></script>
	<script src="js/main.js"></script>
</body>
</html>
```

In this course, we will include JS files separately and do not use any build tools or JS module bundlers, such as [web pack](https://webpack.js.org/), to keep it simple.

## 2. <a name="svg-overview">A Brief Overview of SVG</a>

We will use D3 to bind data values to visual marks and channels on a web page. D3's default rendering platform is [SVG](https://www.w3schools.com/graphics/svg_intro.asp) (Scalable Vector Graphics) that we will use throughout this course. D3 also supports [HTML Canvas](https://www.w3schools.com/html/html5_canvas.asp) which is useful for displaying a larger number of objects but has limited flexibility and, therefore, we will only briefly introduce it at the very end of the course. Here are some key facts about SVG:

- SVG is defined using markup code similar to HTML.
- SVG elements don't lose any quality when they are resized.
- SVG elements can be included directly within any HTML document or dynamically inserted into the DOM with JS.
- Before you can draw SVG elements, you have to add an `<svg>` element with a specific `width` and `height` to your HTML document, for example: `<svg width="500" height="500"></svg>` .
- The SVG coordinate system places the origin (0/0) in the top-left corner of the svg element.
- SVG has no layering concept or depth property. The order in which elements are coded determines their depth order.

**Basic shape elements in SVG:** `rect`, `circle`, `ellipse`, `line`, `text`, and `path`

*Examples:*

```html
<svg width="400" height="50">

<!-- Rectangle (x and y specify the coordinates of the upper-left corner -->
<rect x="0" y="0" width="50" height="50" fill="blue" />

<!-- Circle: cx and cy specify the coordinates of the center and r the radius -->
<circle cx="85" cy="25" r="25" fill="green" />

<!-- Ellipse: rx and ry specify separate radius values -->
<ellipse cx="145" cy="25" rx="15" ry="25" fill="purple" />

<!-- Line: x1,y1 and x2,y2 specify the coordinates of the ends of the line -->
<line x1="185" y1="5" x2="230" y2="40" stroke="gray" stroke-width="5" />

<!-- Text: x specifies the position of the left edge and y specifies the vertical position of the baseline -->
<text x="260" y="25" fill="red">SVG Text</text>

</svg>
```

*Result:*

![SVG Example](images/svg-examples.png?raw=true "SVG Example")

## 3. <a name="add-to-dom">Adding a DOM Element with D3</a>

Previusly, you may have already created dynamic content and added new elements to the DOM tree with plain JS or the jQuery library. Now, we will generate new page elements with D3. After loading the D3 library, we can add our own script (e.g., `main.js`).

The following example consists of only one line of JS code. We use D3 to add a paragraph with the text "Hello World!" to a basic web page. All functions are in the ```d3``` namespace, so we can access them by starting our statements with: ```d3.```

```javascript
d3.select("body").append("p").text("Hello World!");
```

![D3 - Add element to DOM](images/d3-hello-world.png?raw=true "D3 - Add element to DOM")

Before going into further details we want to introduce (or remind you of) the JS concept of **method chaining**:

Method or function chaining is a common technique in JS and particularly useful when working with D3. It can be used to simplify code in scenarios that involve calling multiple methods on the same object consecutively.
 
- The functions are "chained" together with periods.
- The output type of one method has to match the input type expected by the next method in the chain.
 
The alternative code of the example above without method chaining:

```javascript
const body = d3.select('body');
const p = body.append('p');
p.text('Hello World!');
```

We will use the chain syntax in most examples and templates and we encourage you to do so too.


#### D3 Select

The `select()` method uses CSS selectors as input to grab page elements. It will return a reference to the first element in the DOM that matches the selector.

In our example we have used `d3.select('body')` to select the first DOM element that matches our CSS selector, `body`. Once an element is selected - and handed off to the next method in the chain - you can apply **operators**. These D3 operators allow you to get and set **properties**, **styles**, and **content** (and will again return the current selection).

Alternatively, if you need to select more than one element, use `selectAll()`. We will try it later in an example.

#### D3 Append

After selecting a specific element, we can apply an operator, such as `.append('p')`

The `append()` operator adds a new element as the last child of the current selection. We specified "p" as the input argument, so an empty paragraph has been added to the end of the *HTML body*. The new paragraph is automatically selected for further operations.

At the end, we use the `text()` operator to insert a string between the opening and closing tags of the current selection (`<p></p>`).

In summary, all methods together:

```javascript
d3.select('body')
	.append('p')
	.text('Hello World!');
```

Your D3 statements can be much longer, so you should always put each operator on its own indented line.

## 4. <a name="binding-data">Binding Data to Visual Elements</a>

### Binding data to DOM elements

Similar to our last example, we keep using basic HTML tags, but this time we append a new paragraph for each value in a given array:

```javascript
const provinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];

const p = d3.select('body').selectAll('p')
	.data(provinces)
	.enter()
	.append('p')
	.text('Array Element');
```

*Result:*

![D3 - Bind Data 1](images/d3_bind_dom_elements.png?raw=true "D3 - Bind Data 1")


1. `.select('body')` Reference to the target container.

2. `.selectAll('p')` Selection representing the elements (paragraphs) we want to create.

3. `.data(provinces)` Loads the dataset (array of strings). The data could be also numbers, objects or other arrays. Each item of the array is assigned to one element of the current selection.

	Instead of returning just the regular selection, the `data()` operator returns **three virtual selections**:
	
	- **Enter** contains a new placeholder for any missing elements
	- **Update** contains existing elements bound to the data
	- **Exit** contains existing elements that are not bound to data anymore and should be removed
	
	There are no `<p>` elements on the page so the **enter** selection contains placeholders for all elements in the array. In this and the following examples, we will concentrate only on the *enter* selection. You will learn more about the *enter-update-exit* sequence later when we will create interactive visualizations.

4. `.enter()` Creates new data-bound elements/placeholders.
5. `.append('p')` Takes the empty placeholder selection and appends a paragraph to the DOM for each element.
6. `.text('Array Element')` Adds a string to each newly created paragraph


### Dynamic Properties

The dataset has been loaded and bound to new paragraphs but all the appended elements contain the same content: *"Array Element"*.

If you want access to the corresponding values from the dataset, you have to use *anonymous functions*. For example, we can include such a function inside the `text()` operator:

```javascript
// Our preferred option: ES6 arrow function syntax
.text(d => d);

// Alternative: Traditional function syntax
.text( function(d) { return d; } );
```

*Updated example:*

```js
const p = d3.select('body').selectAll('p')
    .data(provinces)
    .enter()
    .append('p')
    .text(d => d);
```

*Result:*

![D3 - Bind Data 2](images/d3_bind_dom_elements_2.png?raw=true "D3 - Bind Data 2")

In comparison, an ordinary JS function looks like the following code below. It has a function name, an input and an output variable. If the function name is missing, then it is called an *anonymous function*.
 
```javascript
function doSomething(d) {
	return d;
}
```

If you want to use the function only in one place, an anonymous function is more concise than declaring a function and then doing something with it in two separate steps. We will use this JS concept very often in D3 to access individual values and to create interactive properties.
 
```javascript
.text(d => d.firstName);
```

In the previous example we have used the function to access individual values of the loaded array. That is one feature of D3: It can pass array elements and corresponding data indices to an anonymous function, which is called for each array element individually.

In the D3 documentation and most tutorials, you'll generally see the parameter `d` used for the current data value and `i`  (or `index`) used for the index of the current data element. The index is passed as a second parameter in function calls and is optional. 

Example for an anonymous function that passes the data value and index:

```javascript
.text((d, index) => { 
	console.log(index); // Debug variable
	return `element: ${d} at position: ${index}`; 
});
```


It is still a regular function, so it doesn't have to be a simple return statement. We can use if-statements, for-loops, console message, and we can also access the index of the current element in our selection.
 

### HTML attributes and CSS properties

As already mentioned earlier, we can get and set different **properties** and **styles** - not only the textual content. This becomes very important when working with SVG elements.

*Example (1) - Add paragraphs and set properties*

```javascript
const provinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];

// Append paragraphs and highlight one element
let p = d3.select('body').selectAll('p')
    .data(provinces)
    .enter()
  .append('p')
    .text(d => d)
    .attr('class', 'custom-paragraph')
    .style('font-weight', 'bold')
    .style('color', d => {
      if(d == 'BC')
        return 'blue';
      else
        return 'red';
    });
```

- We use D3 to set the paragraph content, the HTML class, the font-weight and as the last property, the font colour which depends on the individual array value.
- If you want to assign specific styles to the whole selection (e.g., font weight), we recommend you to define an HTML class (`custom-paragraph` in our example) and add these rules to an external CSS file. Using classes and CSS styles will make your code more concise and reusable.

*Result:*

![D3 - Bind Data 3](images/d3_bind_dom_elements_3.png?raw=true "D3 - Bind Data 3")

Now we are in a good position to actually use SVG instead of simple HTML tags.

*Example (2) - Add SVG rectangles and set properties*

```javascript
const numericData = [1, 2, 4, 8, 16];

// Add <svg> element (drawing space)
const svg = d3.select('body').append('svg')
    .attr('width', 300)
    .attr('height', 50);

// Add rectangle
svg.selectAll('rect')
    .data(numericData)
    .enter()
  .append('rect')
    .attr('fill', 'red')
    .attr('width', 50)
    .attr('height', 50)
    .attr('y', 0)
    .attr('x', (d, index) => index * 60);
```
- We have appended SVG elements to the DOM tree in our second example. This means that we had to create the SVG drawing area first. We did this with D3 and saved the selection in the variable ```svg``` (in case you wonder why the ```d3``` object is missing in the second statement).
- It is crucial to set the SVG coordinates of visual elements. If we don't set the `x` and `y` values, all the rectangles will be drawn at the same position at (0, 0). By using the index, of the current element in the selection, we can create a dynamic `x` property and shift every newly created rectangle 60 pixels to the right.

*Result:*

![D3 - Bind Data 4](images/d3_bind_svg_elements.png?raw=true "D3 - Bind Data 4")

&nbsp;

-----

#### Activity (1)

Now, we highly recommend that you create your first D3 project and implement this little example.

1. **Create a new D3 project or clone our [D3 project starter template](https://github.com/UBC-InfoVis/d3-starter-template)**
 
2. **Append a new SVG element to your HTML document with D3** (width: 500px, height: 500px)

3. **Draw circles with D3**

	Append a new **SVG circle** for every object in the following array:

	```javascript
	const sandwiches = [
		 { name: "Thesis", price: 7.95, size: "large" },
		 { name: "Dissertation", price: 8.95, size: "large" },
		 { name: "Highlander", price: 6.50, size: "small" },
		 { name: "Just Tuna", price: 6.50, size: "small" },
		 { name: "So-La", price: 7.95, size: "large" },
		 { name: "Special", price: 12.50, size: "small" }
	];
	```

4. **Define dynamic properties**

	- Set the x/y coordinates and make sure that the circles don't overlap each other
	- Radius: *large sandwiches* should be twice as big as small ones
	- Colours: use two different circle colours. One colour (```fill```) for cheap products < 7.00 USD and one for more expensive products
	- Add a border to every circle (SVG property: ```stroke```)
	
*The result might look like the following:*
	
![D3 - Result Activity 1](images/d3_circle_activity.png?raw=true "Result Activity 1")

**Important notice:** This example is not intended to be a best practice example of how to work with D3 scales. It was designed to help you to get a better understanding of different basic concepts in D3.

In a later tutorial, you will learn how to create real scales for different types of data, you will work with more flexible size measurements and you will learn how to use D3 axes in your visualizations.

-----

&nbsp;


### Loading external data

Instead of typing the data in a local variable, which is only convenient for very small datasets, we can load data *asynchronously* from external files. The D3 built-in methods make it easy to load JSON, CSV, and other files.

You should already be familiar with the JSON format from the previous lab and you have probably worked with CSV files in the past too.

> **CSV (Comma Separated Values)**
> 
> Similar to JSON, CSV is a file format which is often used to exchange data. Each line in a CSV file represents a table row and as the name indicates, the values/columns are separated by a comma.
> 
> In a nutshell: The use of the right file format depends on the data - JSON should be used for hierarchical data and CSV is usually a proper way to store tabular data.

We'll store the same sandwich price information in a CSV file. Very often, CSV files are generated by exporting data from other applications, but for this and many other examples in this course, our data is stored in a static CSV file.

*sandwiches.csv (stored within a subfolder of our project named "data")*

```javascript
name,price,size
Thesis,7.95,large
Dissertation,8.95,large
Highlander,6.50,small
Just Tuna,6.50,small
So-La,7.95,large
Special,12.50,small
```

By calling D3 methods, such as `d3.csv()`, `d3.json()`, or `d3.tsv()`, we can load external data resources in the browser. These functions take the file path as an argument and load the data asynchronously. Once the data is loaded and the [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) got resolved, you can work with the data:

```javascript
d3.csv('data/sandwiches.csv')
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('Error loading the data');
  });
```

#### Why do we need an asynchronous execution?

* The page should always be visible when data is loading in the background, and scripts that do not depend on the data should run immediately.
* Scripts that do depend on the data should only run once, when the data has been loaded.

Reading a file from the disk or an external server usually takes a while. Hence, we are using an asynchronous execution: We don't have to wait and stall, instead we can proceed with further tasks that do not rely on the dataset. After receiving a notification that the data loading process is complete, the callback function `then()` is executed.

**Code that depends on the dataset should generally exist only in the `then()` callback function!** You can (and often should) structure your code in separate functions, however, if these functions depend on the dataset, they should only be called inside the callback function).

*Example:*

```javascript
d3.csv('data/sandwiches.csv')
  .then(data => {
  	console.log('Data loading complete. Work with dataset.');
    console.log(data);
  })
  .catch(error => {
    console.error('Error loading the data');
  });

console.log('Do something else, without the data');
```

*The result below shows that the execution order is different than what you might have expected:*

The callback function, the inner function of `d3.csv()`, is called only after the dataset has been fully loaded into browser memory. In the meantime other scripts are executed.

![D3 - Data Loading 1](images/d3_async_data_loading.png?raw=true "Data Loading 1")


You might have noticed that each value of the CSV file is stored as a string, including numerical values. We need to convert all numerical values to *numbers*, or otherwise you will see unexpected behavior when making calculations.
	
We recommend iterating over all rows and using a statement similar to the following code snippet. Putting a "+" in front of a variable converts that variable to a number (you can also use `parseInt()` or `parseFloat()`)
	
```javascript
d.age = +d.age;
```

&nbsp;

-----

#### Activity (2)

*Use your files from the previous activity. You don't have to create a new project.*

1. **Download the dataset:** [https://raw.githubusercontent.com/UBC-InfoVis/datasets/master/cities\_and\_population.csv](https://raw.githubusercontent.com/UBC-InfoVis/datasets/master/cities_and_population.csv)

2. **Use D3 to load the CSV file**

	Write the data to the *web console* and inspect it in your browser (Which properties are available? What are types of the variables?)

3. **Filter the dataset using JS**

	We are only interested in cities that are part of the *European Union (EU)*. Use the filtered dataset for the remainder of this activity.

4. **Append a new paragraph to your HTML document**

	Count all elements in the filtered dataset and use JS or D3 to write the result (i.e., the number of EU countries) to your webpage.

5. **Prepare the data: Convert all numerical values to numbers.**

6. **Draw one SVG circle for each row in the filtered dataset**

	- All the elements (drawing area + circles) should be added dynamically with D3
	- SVG container: width = 700px, height = 550px
	- Use the x/y coordinates from the dataset to position the circles

7. **Dynamic circle properties**

	Change your default radius to a data-dependent value:
	
	- The radius should be **4px** for all cities with a population lower than 1.000.000.
	- The radius for all the other cities should be **8px**.

	*(You will learn how to create more dynamic scales in an upcoming D3 tutorial)*

8. **Assign labels with the names of the European cities**

	- Use the *SVG text* element
	- All the elements should have the same class: ```city-label```
	- The labels should be only visible for cities with a population equal or higher than 1.000.000. You can use the SVG property ```opacity``` to solve this task.

9. **Styling**

	*Create a new external stylesheet if you have not done it yet.*
	
	Add proper styles to your webpage but include at least these CSS rules for the class ```city-label```:
	
	- Font size = 11px
	- Text anchor = middle


*Your result should look similar to this screenshot:*

![Activity 2 Result](images/d3_map_activity.png?raw=true "Activity 2 Result")

Later in this course, you will also learn how to create interactive maps.

---

*Sources:*

* [Harvard's visualization course (CS171)](https://www.cs171.org/)