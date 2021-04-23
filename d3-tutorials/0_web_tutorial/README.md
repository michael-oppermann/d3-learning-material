# 0. Web Development

The reward of learning D3 is exponentially greater compared to higher-level visualization libraries that provide preconfigured templates for common chart types.
However, the creation of expressive visualizations in D3 requires a certain level of programming experience and web development knowledge (HTML, CSS, JavaScript, etc) that is covered in [CPSC 310](https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-course&dept=CPSC&course=310) and inherited prerequisites. It is imperative that you are comfortable using all the technologies that we superficially walk through in this article. The learning curve of D3 is challenging for the short time span of a single academic term and we do not recommend taking this course if you had no previous exposure to web development.

This tutorial will serve to refresh you in case you're rusty, for the prerequisite material. 

#### Tutorial Outline

1. [HTML: Set up and modify HTML documents](#html)
2. [CSS: Define CSS rules to style web pages (with CSS selectors)](#css)
3. [JS: Solid understanding of JavaScript fundamentals](#js)
4. [Tools: Use several web development tools (code editor, local webserver, web browser developer tools)](#tools)
5. [Git: Use Git (required for submitting assignments and project milestones)](#git)
6. [HTML & CSS Frameworks](#frameworks)

## 1. <a name="html">HTML</a>

[HTML](https://www.w3schools.com/html/) (Hypertext Markup Language) is used to structure content for web browsers. It enables us to differentiate between content and structure of a document. A comprehensive and well structured list of HTML elements can be found at [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element). We will use the latest evolution of HTML referred to as [HTML5](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5).

In D3 web applications, HTML is primarily used to create a basic layout and to add control widgets, such as checkboxes, radio buttons, and input sliders. Most of the visual elements will be actually drawn inside an `<svg></svg>` container. You will learn about **SVG** in the first D3 tutorial.

### HTML Boilerplate

Every HTML5 document requires a little bit of boilerplate code that you should just copy and past every time you create a new file. A boilerplate is a piece of code that is usually copied with little or no alteration, much like a template, to speed up the creation of new files. In the case of HTML5 this includes several HTML tags (e.g. \<head>, \<html>, ...) that don't have visual equivalents on the website, but that are necessary to define the document's metadata. All HTML elements are surrounded by angle bracket tags, which come in pairs where the end is preceded by a slash. 

Make sure to get familiar with this structure:

```html
<!DOCTYPE HTML>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Web page title</title>
    
    <!-- The following line references an external css file -->
    <link href="css/styles.css" rel="stylesheet">
</head>
<body>
	This is where the main content of the page goes.
	
	<!-- Load external JS files -->
	<script src="js/main.js"></script>
</body>
</html>
```

### Classes and IDs

Classes and IDs are extremely helpful for selecting specific HTML elements. Your CSS and JavaScript (JS) code will rely heavily on classes and IDs to identify elements in *selectors*.

(1) ```<div>Interactive Data Visualization</div>```

In the above HTML snippet, the div-element has no attributes, so the only possible way to identify the element is by its tag name *div*. If there are multiple div-tags in one page, which happens frequently, selecting just the above div element becomes a problem.

(2) ```<div id="book-123">The Value of Visualization</div>```

To solve this problem, you can give the element a unique ID: *book-123*. However, each element can only have a single ID, and each ID value can be used only once per page!

(3) ```<div class="book content">Visualization Analysis and Design</div>```

Any attribute or styling information that needs to be applied to multiple elements on a page should be done with a *class*. In the above example, we have assigned the div element to the class *book*, that allows us to select all HTML containers of the type *book*. At the same time, we have assigned the div element to the class *content*. 

Elements can be assigned multiple classes, simply by separating them with a space.

### DOM

The Document Object Model (DOM) is a programming interface for HTML, XML, and SVG documents. It provides a hierarchical (tree-structured) representation of the document and it defines a way that the structure can be accessed from programs so that they can change the document structure, style, and content. Or in other words, it is a model that the browser generates, when it parses the HTML document. We will later use JS/D3 to add to and manipulate the DOM dynamically.


## 2. <a name="css">CSS</a>

With HTML you define the structure and content of the page and with CSS you set its style - things like fonts, colors, margins, backgrounds, and so on.

A stylesheet will usually consist of a list of CSS rules that are inserted either in a ```<style>``` block in your HTML header, or, more often, stored in an external file and included via the below line of code, which assumes that you have a separate file ```style.css``` in the folder ```css```. Make sure to always include an external style sheet in the HTML header (inside the ```<head></head>``` elements of your HTML file). 

```html
<link rel="stylesheet" href="css/style.css"> 
``` 

CSS styles consist of selectors and properties, grouped in curly brackets. A property and its value are separated by a colon, and the line is terminated with a semicolon.

A simple rule in CSS can look like the following:

```css
div {
	font-size: 15px;
	padding: 30px 10px;
	background-color: #F7F7F7;
	color: black;
	border: 2px solid red;
}
```

*Result:* 

![CSS Example Result](images/css-example.png?raw=true "CSS Example Result")


If you are searching for an exhaustive list of style properties we recommend [Mozilla's Developer Platform](https://developer.mozilla.org/en-US/docs/Web/CSS) or [w3schools.com](http://www.w3schools.com/CSS/). Some CSS properties are needed quite often, so you should try to memorize them.

In the above example we have assigned our CSS rule to all div containers but if we want to style specific elements we can use the selectors *id* and *class*.

As you can see in the example below, IDs are preceded with a hash mark (*#article-1*) and class names are preceded with a period (*.error*). You can also use descendent selectors to address nested elements (*.article .warning*), where the child is separated from its parent by a space.  

*Example:* 

`style.css` 

```css
#article-1 {
	text-decoration: underline;
}
.error {
	font-weight: bold;
	color: red;
}
.article .warning {
	color: blue;
}
```

`index.html`

```html
<!DOCTYPE HTML>
<html lang="en">
<head>
	<meta charset="UTF-8">
  	<title>Simple CSS</title>
  	<link rel="stylesheet" href="css/style.css"> 
</head>
<body>

<div class="article" id="article-1">Some text</div>
	
<div class="article">
	Some other text
	<div class="warning">and a warning</div>
</div>
	
<div class="article error">Error!</div>

</body>
</html>
```

*Result:*

![CSS Example 2 Result](images/css-example-2.png?raw=true "CSS Example 2 Result")

## 3. <a name="js">JavaScript (JS)</a>

*From now on, and in all upcoming tutorials and assignments we will use the common abbreviation JS for the term JavaScript.*

In this course, we will use **ES6** (6th version of the JS standard ECMAScript) which is a significant update to previous JS versions. It includes dozens of new features to make your code more modern and more readable. One of these features is the (optional) ability to write object-oriented code.

We highly recommend that you follow a JS style guide (e.g., [Airbnb](https://google.github.io/styleguide/jsguide.html) or [Google](https://google.github.io/styleguide/jsguide.html)) to ensure consistency and to improve the overall code quality, especially in team projects.

### A short reiteration of the basic concepts of JS 

#### Variables

Recommendation: Use `const` by default and `let` whenever you need to reassign a variable.

```javascript
// `const` keyword ensures that the variable it creates is read-only
const THRESHOLD = 10;

// `let` keyword declares a block-scoped variable
let month = "February";	

// Variables in JS are loosely typed
let day = 4;				// Integer
let temperature = 34.36; 	// Double
let winter = true; 			// Boolean

// `const` does not ensure that the variable is immutable
// the object property can change
const students = { 
	count: 10
};
students.count += 1; 		// OK: count=11
students = { count: 20 }; 	// Type error
```

#### Data Structures

##### Arrays
* Arrays can store a sequence of values, and contain any type of data. Arrays are a compound type in JS.
* Use bracket notation ```[]``` to define or access an array.

```javascript
// Array with integer values
let numbers = [1, 2, 3, 100, 500, 4];	

// Array with strings
let fruits = ["Orange", "Banana", "Apple"];

// Empty array declaration
let names = [];

// Access the elements of an array
fruits[0]; 	// Returns: Orange
fruits[1]; 	// Returns: Banana

// Adding array elements
fruits.push("Mango");	// adds a new element to fruits

// Access the length of an array using the length attribute
let numberOfFruits = fruits.length;

// You can nest arrays (multidimensional)
let nestedNumbers = [[1, 2], [3, 4], [5, 6]];
```

You can do much more with arrays than shown here. Again, check out the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) documentation to learn more about specific concepts. Arrays are very important for data visualization, so take the time to go through this thoroughly!


##### Objects

* Objects are the second type of compound data types in JS.
* Use curly brackets ```{}``` to define an object and list *properties* and *values*.

```javascript
// JS object with four properties
let course = {
	id: "CPSC436",
	name: "Information Visualization",
	students: 100,
	active: true
}

// Accessing an object via dot notation, specifying the name of the property
course.id; 		// Returns: CPSC436
course.students;	// Returns: 100

// We can include arrays in objects
let course = {
	id: "CPSC436",
	students: ["Michael", "Ann", "James", "Kathy"]
};

// And we can also create arrays of objects
let courses = [
	{ id: "CPSC436", name: "Visualization" },
	{ id: "CPSC110", name: "Computation, Programs, and Programming" }
];

// To access this data we just follow the trail of properties
courses[1].id; 	// Returns: CPSC110
```

Keep in mind: [...] means array and {...} means object!

##### JSON (JavaScript Object Notation)

* JSON is a popular data-interchange format for APIs and therefore very important for our future tasks (i.e., load given dataset). 
* It is basically a JS object, with the only difference being that the property names are surrounded by double quotation marks.

```json
{
	"id": "CPSC436",
	"name": "Information Visualization",
	"students": 100,
	"active": true
}
```


#### Control Structures & Loops

You should already be familiar with **control structures**, **loops** and **functions**. The following just shows some examples and the correct syntax for using those structures.

##### If statements

```javascript
let numericData = 10;

// Regular if statement 
if (numericData >= 10) {
	console.log("Equal or greater than 10");
} else if (numericData > 0 && numericData < 10) {
	console.log("Between 0 and 10");
} else {
	console.log("Less than 1");
}

// The ternary operator can be used as a compact alternative to an if-statement
// CONDITION ? WHAT_HAPPENS_IF_TRUE : WHAT_HAPPENS_IF_FALSE
let result = (numericData >= 10) ? "greater than or equal to 10" : "less than 10";
let result = (numericData % 2 === 0) ? "even" : "odd";
```

##### For loops

```javascript
// (1) Loop through a block of code 5 times (printing the value of i each time to the console)
for (let i = 0; i < 5; i++) {
	console.log(i);
}

// (2) Loop through each of the values in an array
let arrayWithNames = ["Jack", "Anna", "Mike", "Susan"];
for (let i = 0; i < arrayWithNames.length; i++) {
	console.log(arrayWithNames[i]);
}

// (3) Loop through the properties of an object
let person = { firstName: "John", lastName: "Doe", age: 24 };
for (let property in person) {
	console.log(property + ": " + person[property]);
}

// (4) The holy grail of JS loops: 
// Making use of object oriented JS, the forEach loop is an array method 
// that iterates over all elements in the array. The index of the element 
// and the element itself are available inside the loop via an anonymous
// callback function.
arrayWithNames.forEach( (element, index) => {
	console.log(index + ": " + element);
});
```

#### Functions

Here we list a few examples to show you the syntax for functions. In the following weeks you will learn more about anonymous functions, callbacks, and other features.

```javascript
// Call a function
toCelsius(34);

// Function (with input parameter and return value)
function toCelsius(fahrenheit) {
	return (5/9) * (fahrenheit-32);
}

// Another function call
console.log("Write something to the web console");
```

Variables within a function have *private* scope, however, when they are declared outside a function they are *global*.


### More JavaScript

Here we introduce some more advanced JS concepts, that will be very important once we start working with D3. Don't worry if you are not familiar with all those concepts — we will reiterate them with more examples in the next tutorials in connection with D3.

#### Template literals

Template literals are an alternative way to concatenate strings and variables. We specify literals with back-ticks (\`) at the beginning and end to distinguish them from ordinary strings that use single or double quotes. Inside a literal, we use placeholders that are indicated by a dollar sign and curly braces (`${expression}`).

```js
const temp = 39; 
const message = `The expected max. temperature today is ${temp}°C`;
```

A placeholder supports any JS expression, so we can subsitute a lot more than variable names. For example, we can embed an arithmetic expression inline or call a function:

```js
// Function returns a dynamic variable that is embedded using template literals 
const message = `Current temperature: ${toCelsius(34)}°C`;
```

Another benefit of template literals, besides the concise syntax, is that they can span multiple lines.

#### Functions are objects

In JS, functions are objects that can be *called*. They take arguments and they return values. But because of their object-like characteristics, they are also just values that can be stored in variables and passed on.

There is an alternative way of defining functions:

```javascript
// We assign a function to the variable 'message'
let message = function(firstName) {
    return `Hello, I'm ${firstName}.`;
}

// We can call the function to get the expected message
console.log(message("Victoria"));	// Returns: Hello, I'm Victoria.
```

You can also use **arrow functions** as a more concise syntax for writing function expressions.

```javascript
let message = firstName => {
    return `Hello, I'm ${firstName}.`;
}
console.log(message("Victoria"));	// Returns: Hello, I'm Victoria.
```

Note: Arrow functions have restricted functionality compared to "traditional functions". They don't have bindings to the `this` keyword and, thus, can't be used in the example below. Nevertheless, the compact arrow syntax makes D3 code typically more readable and we will use it in many situations. It's not a requirement in assignments or in the project and you can just use `function()` syntax!

A more advanced example:

```javascript
let person = { firstName: "Victoria", age: 24, profession: "Student" };

// Add a new variable to the object 'person' called 'message'.
// Store a function inside 'message' instead of a static value.
person.message = function() {
	return `Hello, I'm ${this.firstName}.`;
}
console.log(person); // Returns your new person object
console.log(person.message()); // Returns: Hello, I'm Victoria.
```

In all these examples, the current *scope* - the environment in which the function executes in - is important.

The default scope for executing functions is the *Window Object* which is a browser level object representing the actual browser window/tab. Additionally, we have also used the keyword ```this```. In the global execution context (outside of the function), ```this``` refers to the global *Window Object*. Inside a function or a class, the value of ```this``` depends on how it is called. 

So that means, if you run the function in the `person` object's scope (second example), you can access the firstName attribute via ```this```. If you use ```this.firstName``` in a function by itself (e.g. without the scope of the person object) it will give you an error, because your window object has no attribute ```firstName```.

If `this` still seems confusing to you, you can read up on these ideas on the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this). We will also come back to `this` in later tutorials.


#### Array manipulation with higher-order functions

JS offers several functions for fast array manipulation. These functions usually rely on concepts from functional programming and can be hard to grasp at the beginning. We will come back to them in more detail later, but below you find a first introduction.
You can read further on [higher-order functions](http://eloquentjavascript.net/05_higher_order.html).

The ***filter(callback)*** method creates a new array with the elements that meet a condition implemented by the provided callback function.

```javascript
// ---- Filter Example 1 - Get all cities except London ---- 

const cities = ["Vienna", "Paris", "London", "London"];

// Pass an anonymous function to cities.filter()
const filteredCities = cities.filter(city => city != "London");

console.log(filteredCities); // Returns: ["Vienna", "Paris"]


// ---- Filter Example 2 - Get all numbers which are >= 10 and have array indices > 3 ---- 

const numericData = [1, 20, 3, 40, 5, 60, 7, 80];

// Anonymous function takes the array element's current value and index as parameters
const filteredNumericData = numericData.filter( (value, index) => {
	return (value >= 10) && (index > 3);
});

console.log(filteredNumericData); // Returns: [60, 80]

```

The ***sort()*** method does an inline sort of the items in an array. No new array object will be created during execution.

```javascript
// ---- Sort Example 1 - Filter array with strings (default sorting) ---- 

const cities = ["Vienna", "Paris", "London", "Munich", "Toronto"];
cities.sort();
cities 	// Returns: ["London", "Munich", "Paris", "Toronto", "Vienna"]


// ---- Sort Example 2 - Filter array with objects ---- 
// We are specifying a function that defines the sort order

const products = [
	{ name: "laptop", price: 800 },
	{ name: "phone", price:200},
	{ name: "tv", price: 1200}
];

// Sort ascending by the 'price' property
products.sort( (a, b) => {
	return a.price - b.price;
});

// Sort descending by the 'price' property
products.sort( (a, b) => {
	return b.price - a.price;
});
```
The ***map()*** method creates a new array with the results of calling a provided function on every element of the original array.

```javascript
// ---- Map Example 1 - Calculate the square root ----

const numericData = [1, 4, 9];
const roots = numericData.map(Math.sqrt);

roots	// Returns: [1, 2, 3]


// ---- Map Example 2 - Double the prices ---- 

const products = [
	{ name: "laptop", price: 800 },
	{ name: "phone", price:200},
	{ name: "tv", price: 1200}
];

const expensiveProducts = products.map(doublePrice);

function doublePrice(elem){
	elem.price = elem.price * 2;
	return elem;
}

expensiveProducts // Returns: [{ name: "laptop", price: 1600 }, { name: "phone", price:400}, { name: "tv", price: 2400}]
```

*You will learn more about other useful array manipulation methods (e.g. ```join()```, ```reduce()```, ...) in our D3 tutorials later.*

## 4. <a name="tools">Tools</a>

### Code editor

You can use any code editor that you are comfortable with. Some developers prefer basic editors, such as [Sublime Text](https://www.sublimetext.com/) or [Atom](https://atom.io/), while others prefer full IDEs, such as [Webstorm](https://www.jetbrains.com/community/education/#students) (free student license available). Especially for the team project you should take an IDE into consideration.

You may also want to try online interactive notebooks (such as [Observable](http://observablehq.com/)) that become increasingly popular to experiment with smaller D3 examples. However, they are not suitable for assignments because you need to use our given templates and submit the source code through git.

### Local web server

When developing a visualization, the data files are usually loaded dynamically using JS, such as `d3.csv()`. In this case, you will need to start a local web server to serve all your HTML/CS/JS and data files. 

We recommend two alternative command line options to start a server within your project directory:

* **HTTP server provided by Python**. For Python 2, use `python -m SimpleHTTPServer [PORT-NUMBER]`. For Python 3, use `python -m http.server [PORT-NUMBER]`

* **HTTP server provided by NodeJS**. First install through npm: `npm install http-server -g`. Then start the server: `http-server [PATH] -p [PORT-NUMBER]`. When specifying the path, please avoid spaces in the path name or use double quatations.

In both cases, you can view the results in a web browser using `http://localhost:[PORT-NUMBER]`.

Alternatively, you can use an **IDE**, such as [Webstorm](https://www.jetbrains.com/webstorm/) to view your D3 project on a local web server (i.e., in Webstorm → right-click on `myProjectIndex.html` → `run`).


### Web developer tools

Every modern-day web browser has built-in developer tools that expose the current state of the DOM and help us to better understand what is going on. We strongly encourage you to use Google Chrome or Mozilla Firefox. We will use the newest stable release of Chrome for grading.

The official browser websites provide detailed descriptions and tutorials: see [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools) and [Firefox Developer Tools](https://developer.mozilla.org/en-US/docs/Tools). Make sure to check out the keyboard shortcut of your system to open the developer tools (e.g., `command + option + j` for Chrome DevTools on Mac).

Most important are the *Web Inspector* and the *JavaScript Console*.

* **Web Inspector:** We can see something that looks like the source code of the HTML document that you wrote in your editor. Some tags are probably collapsed. Actually, you are not viewing the raw content of your HTML document. What you are seeing is the visual representation of the DOM tree (after all scripts have run and potentially modified the original HTML source)!

	The HTML you write is parsed by the browser and turned into the DOM. In simple cases this will look like your raw HTML, but if any JS code has been executed, the current DOM may be different, as JS commands can add, remove, and adjust the DOM dynamically.
	
	In a separate *styles panel*, you can see all CSS rules that are being applied to whatever element is currently selected in the DOM Tree.
	
* **Web Console:** When you implement JS and D3 components you will frequently log messages to the Console to make sure that your code works as expected. You can also use the Console to execute JS statements directly to change how the page looks or runs.

If you haven't done already, it's now time to open the developer tools in your browser and explore the various features. You can, for example, inspect the DOM and CSS attributes of a random web page, and test a few JS commands in the console.  

**From now on, whenever you are programming HTML, CSS, JS, or D3, you should always have the developer console open. This helps you in debugging and figuring out what is going on in the code!**

## 5. <a name="git">Use Git & Github</a>

We will use **git** repositories (via Github) for all programming assignments and project milestones.  You should already be well acquainted with the process and all necessary git commands from previous courses (see [Reid Holmes'
CPSC 310 git tutorial](https://github.com/ubccpsc/310/blob/2019jan/resources/git.md) as a refresher).

We automatically generate git repositories in your github student account ([https://github.students.cs.ubc.ca](https://github.students.cs.ubc.ca)) that typically contain templates, code snippets, and data to help you get started. Submit a programming assignment or project milestone by updating the given repository (`git push`). You can commit/push
changes as often as you want before the deadline.

#### Technical hints: How to set up Git SSH authentication?

You can clone repositories using either HTTPS and SSH, but we recommend using SSH because you do not need to enter your credentials everytime you pull and push once you set it up for the first time. We have also seen access issues (code: 403) with HTTPS cloning in previous years.

Please check whether you have a SSH key generated already: there should be `id_rsa` and `id_rsa.pub` in `~/.ssh`. If yes, please go to step 3.

1. Generate a SSH key on your local machine. Run the following command in a terminal. Follow the prompts to store the key in `~/.ssh` and enter a passphrase (it can be empty, or a phrase you like).

	```
	ssh-keygen -t rsa -C "your_email@example.com"
	```

2. Navigate to `~/.ssh`. Note that this is a hidden folder by default. You should see `id_rsa` (private key) and `id_rsa.pub` (public key).

3. Open the `id_rsa.pub` with a text editor or using the command `cat id_rsa.pub` (on *nix OS), and copy the entire content, which should be a long string.

4. Open the settings in your students github account, navigate to the SSH and GPG key tab (on the left sidebar), and then upload your public key.

5. You should be able to use the SSH link to clone repositories.

*Note: do not upload or send out your private key. It is supposed to be on your own machine.*




## 6. <a name="frameworks">HTML & CSS Frameworks</a> *(optional)*

Rather than coding from scratch, HTML & CSS frameworks enable you to utilize ready-made blocks of code to help you get started. They give you a solid foundation for what a typical web project requires and usually they are also flexible enough for customization. Most of these frameworks provide some JS functionality as well.

[**Bootstrap**](https://getbootstrap.com/) is one of the most widely used frameworks, it is easy to understand and it provides an extensive documentation with many examples. There are many other frameworks that provide similar functionality, such as [Foundation](https://get.foundation/) or [UIKit](http://getuikit.com/).

The question whether a framework can be useful largely depends on the individual project and the developer. Therefore, it is up to you to decide if you want to use it in your assignments or projects.

Here is a summary of *Bootstrap*:

* **Open source** HTML, CSS, and JS framework. 
* Provides a **base styling** for common used HTML elements.
* The **grid system** helps you to create multi-column and nested layouts, especially if your website should work on different devices and you are not fully comfortable with CSS flexbox.
* Extensive list of **pre-styled components** (navigation, dropdown-menu, forms, tables, icons, etc).
* **Customizable**: Built on [Sass](https://sass-lang.com/) and all specifications can be overridden by your own rules.
* **Compatible** with the latest versions of all major browsers.
* Many websites are easily recognizable as "bootstrap projects" because of their similar look. We recommend you to use frameworks only as a starting point and customize components to fit your needs.

---

##### Additional Learning Resources

* [Curran Kelleher's video tutorial on JavaScript](https://www.youtube.com/watch?v=rUnmw9fQEwg&t=2s)
* Tutorials, examples, documentations (HTML, CSS, JS): [W3Schools](https://www.w3schools.com/), [MDN web docs](https://developer.mozilla.org/en-US/docs/Learn)
* [ES6 Guide](https://flaviocopes.com/es6/)
* [CPSC 310 git tutorial](https://github.com/ubccpsc/310/blob/2019jan/resources/git.md)

##### Sources

* [Harvard's visualization course (CS171)](https://www.cs171.org/)
* [dataviscourse.net (University of Utah)](http://dataviscourse.net/tutorials/lectures/lecture-git/)
* [javascripttutorial.net](https://www.javascripttutorial.net/)
