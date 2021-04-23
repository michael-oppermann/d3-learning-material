# V. Geographic Maps

#### Learning Objectives

In this tutorial we want to show you how to convert geographical data to screen coordinates, in order to create interactive maps. These maps can show specific regions, countries or whole continents. You will learn how to render geographic data as paths, how to assign colors, and how to visualize data points on top of a base map. We will also introduce the JS library Leaflet which can be used to create interactive tile maps and can be further enhanced with superimposed D3 layers.

#### Tutorial Outline

1. [Mapping Geographic Data](#mapping-geo-data)
2. [Symbol Maps](#symbol-maps)
3. [Choropleth Maps](#choropleth-maps)
4. [Interactive Maps with Leaflet](#leaflet)


## 1. <a name="mapping-geo-data">Mapping Geographic Data</a> 
### GeoJSON

GeoJSON is a JSON-based standard for encoding a variety of geographic data structures. We need the data (e.g., country boundaries, points of interests) in a proper format to generate visualizations of geographic data. Web browsers and especially D3 are not able to render traditional shapefiles, which are used by experts in geographic information systems (GIS). Therefore, GeoJSON has been established as a common way to store this information for use in web browsers.

*Example:*

```javascript
{
	"type" : "FeatureCollection",
	"features" : [
		{
		  "type": "Feature",
		  "geometry": {
		    "type": "Point",
		    "coordinates": [51.507351, -0.127758]
		  },
		  "properties": {
		    "name": "London"
		  }
		},
		{
			...
		}
	]
}
```

In this example we have a feature which represents a single geographical point. The coordinates of the point are specified as an array with longitude and latitude values (`[-0.127758, 51.507351]`). In GeoJSON the first element indicates the longitude, the second element the latitude value.

In many more cases, GeoJSON files contain complex polygon data that represent the boundaries of multiple regions or countries instead of a plain list of points:

```javascript
"geometry": {
	"type": "MultiPolygon",
	"coordinates": [[[[-131.602021,55.117982],
		[-131.569159,55.28229],[-131.355558,55.183705],
		[-131.38842,55.01392],[-131.645836,55.035827], ...
    ]]]
}
```

Depending on the resolution of the dataset, each feature will include more or less longitude/latitude pairs. As you can imagine, the size of a GeoJSON file becomes tremendously high if you store the boundaries of a whole continent in high resolution.

### TopoJSON

[TopoJSON](https://github.com/topojson/topojson) is an extension of GeoJSON that encodes topology. Lines and polygons are represented as sequences of arcs rather than sequences of coordinates. For example, contiguous polygons, such as countries or census tracts, have shared borders whose coordinates are duplicated in GeoJSON. TopoJSON addresses this issue (besides other improvements) so that the generated geographical data is substantially more compact than GeoJSON and results in a file size reduction of roughly 80%.

Depending on your needs, you will probably find appropriate TopoJSON files online. You can also generate custom TopoJSON files from various formats with the TopoJSON command-line tool.

**While our data can be stored more efficiently in TopoJSON, we must convert it back to GeoJSON to display it with D3 in a web browser.**

We can use the TopJSON JS library for this conversion: [https://unpkg.com/topojson@3.0.2/dist/topojson.js](https://unpkg.com/topojson@3.0.2/dist/topojson.js).

In addition to the GeoJSON conversion, the JS library provides further methods, for example, to get the neighbors of objects or to combine multiple regions (*topojson.mesh()*).


### Geographic projections

Drawing a geographical map requires the mapping of geographical coordinates (longitude, latitude) to screen coordinates (x, y). The mathematical functions to map the 3D surface geometry of the Earth to 2D maps are called projection methods.

D3 already includes a large set of [geo projections](https://github.com/d3/d3-geo).

![D3 projections](images/d3_projections.png?raw=true "D3 projections")

All projections of a sphere on a 2D plane necessarily distort the surface in some way and, depending on the type of map and geo data, a specific projection is more or less suitable.

Different projection methods have different characteristics (e.g., distance, direction, shape, area) and show different levels of distortion.

You can take a look at the [documentation](https://github.com/d3/d3-geo#projections), [observable notebooks](https://observablehq.com/collection/@d3/d3-geo-projection), or [Jason Davies' examples](https://jasondavies.com/maps/) to see different geo projections.


### Workflow to implement a geo map with D3

We will use Canadian provinces stored in a TopoJSON file as an example.

The following code defines a *Mercator* projection function, which is commonly used but known to over-exaggerate the size of landmasses near the poles.

```js
const projection = d3.geoMercator().fitSize([width, height], geoJsonData);
```

The `fitExtent()` method defines the scale and translate of the projection so that the geometry (i.e., loaded data) fits within the SVG area or given bounding box.

The projection can be further customized by using parameters like `scale()`, `center()`, `rotate()`, `clipAngle()`. Unfortunately, depending on the region you want to visualize and the projection you choose, you may need to tweak various parameters. This is often done in a trial and error approach as we will show in the second example later.

The path generator takes the projected 2D geometry from the last step and formats it appropriately for SVG. Or in other words, the generator maps the GeoJSON coordinates to SVG paths by using the projection function.

```js
const geoPath = d3.geoPath().projection(projection);
```

After defining the SVG area, the projection and the path generator, we can load the TopoJSON data, convert it to GeoJSON and finally map it to SVG paths.

```javascript
// Load shapes of Canadian provinces (TopoJSON)
d3.json('canada_provinces.topo.json').then(data => {
	// Convert TopoJSON to GeoJSON
	const provinces = topojson.feature(data, data.objects.provinces)
	
	// Initialize projection and path generator
	const projection = d3.geoMercator().fitSize([width, height], provinces);
	const geoPath = d3.geoPath().projection(projection);
	
	// Render the map by using the path generator
	const geoPath = d3.select('svg').selectAll('.geo-path')
        .data(provinces.features)
      .join('path')
        .attr('class', 'geo-path')
        .attr('d', geoPath);
});
```

![Canada mercator projection](images/canada_mercator.png?raw=true "Canada mercator projection")

The accessor for the specific object you want to extract (e.g. `data.objects.provinces`) is always dependent on your TopoJSON data and you need to check the documentation of the data provider or inspect the file with a JSON viewer to get the names of the desired attributes.

Some TopoJSON files, for example covering the U.S., contain geographical data for *counties* and *states*. That we means we could use `data.objects.states` or use `data.objects.counties` and map data at a more granular county level.

For some regions, the boundaries might not be clearly visible if we just draw the shapes of those regions. An alternative solution is to explicitly draw the borders (e.g., of Canadian provinces) on top of our existing map. For that we can use [topojson.mesh](https://github.com/topojson/topojson-client/blob/master/README.md#mesh) to extract separating lines between regions from the TopoJSON data. In addition, we could apply custom styles to the region boundaries.

```js
const geoBoundaryPath = d3.select('svg').selectAll('.geo-boundary-path')
        .data([topojson.mesh(data, data.objects.provinces)])
      .join('path')
        .attr('class', 'geo-boundary-path')
        .attr('d', geoPath);
```

See our example on [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-compare-projections) that shows the Mercator projection and the Lambert conformal conic projection side by side. The Lambert projection is commonly used to visualize Canada's provinces and is recommended by [Statistics Canada](https://www150.statcan.gc.ca/n1/pub/92-195-x/2011001/other-autre/mapproj-projcarte/m-c-eng.htm).


[![Codesandbox Compare Map Projections](images/codesandbox_d3-compare-projections.png?raw=true "Codesandbox Compare Map Projections")](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-compare-projections)


## 2. <a name="symbol-maps">Symbol Maps</a>

You have seen how to draw a vector map with D3 but we are currently not encoding any data besides the geography. In the next step, we will create a symbol map that shows the *New Seven World Wonders* with the circle size indicating the average number of visitors. The result looks like this:

![Symbol Map](images/symbol-map.png?raw=true "Symbol Map")

1. **Load data**

	We load two datasets: a TopoJSON file of the world and a CSV file with the coordinates of the world wonders and their average visitor numbers.
	
	In order to load multiple files, we can use JS [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) (`Promise.all()`). The two datasets are stored in the data array.
	
	```js
	Promise.all([
		d3.json('data/world-110m.json'),
		d3.csv('data/world_wonders.csv')
	]).then(data => {
		// Convert string to number
	 	data[1].forEach(d => {
	   		d.visitors = +d.visitors;
	  	});
		
		// Initialize GeoMap class and pass the two datasets
		const geoMap = new GeoMap({ 
	   		parentElement: '#map'
		}, data[0], data[1]);
	})
	```
	&nbsp;
	
	
2. **Initialize projection and path generator**
	
	We chose an equirectangular projection (`d3.geoEquirectangular()`) which maps meridians to vertical straight lines of constant spacing and is often used for world maps. After initializing the projection, we define the scale and orientation. We also crop Antarctica because it takes up a lot of space but is not relevant for our data and type of analysis. As previously mentioned, the positioning of a projection takes some practice and is often done through multiple *trial and error* steps until you are satisfied with the result. You can also look up blogs or source codes of D3 maps that are posted online, as we did for this example ([Making a map using D3.js](https://medium.com/@andybarefoot/making-a-map-using-d3-js-8aa3637304ee)):
	
	```js
	const projection = d3.geoEquirectangular()
       .center([0, 15]) 				// set centre to further North
       .scale([width/(2*Math.PI)]) 		// scale to fit size of svg group
       .translate([width/2, height/2]); // ensure centered within svg group
   ```
   
   Then we can use the projection in our path generator:
   
   ```js
   const geoPath = d3.geoPath().projection(projection);
   ```
 	&nbsp;
 	
3. **Initialize scale for circle symbols** 

	We want to position a circle at the location of each world wonder and use the circle size as an indicator for the average number of visitors. 
	
	The easiest option to change the size of an SVG `<circle>` element with D3 is to use the radius (`r`) attribute. However, using a linear scale for the radius would be a mistake becaues it's visual representation is not accurate. The area of the circle (that users perceive) grows quadratically despite a linear increase of the radius (*A = π r²*). You can read more about this issue and see examples in this [blog post](https://bl.ocks.org/guilhermesimoes/e6356aa90a16163a6f917f53600a2b4a).
	
	A simple method to counteract this problem is to use a square root function (`d3.scaleSqrt()`).
	
	```js
	const symbolScale = d3.scaleSqrt()
		.range([4, 25])
		.domain(d3.extent(data, d => d.visitors));
	```
	&nbsp;
	
4. **Draw world map**
	
	We draw the shapes of the countries that are stored in TopoJSON format in the variable `geoData`.
	
	```js
	const countries = topojson.feature(geoData, geoData.objects.countries).features;
	const geoPath = chart.selectAll('.geo-path')
   		.data(countries)
   	  .join('path')
       .attr('class', 'geo-path')
       .attr('d', geoPath);
	```
	
	We use the `topjson.mesh()` to extract the country borders and draw them explictly on top which makes them more precise than just using the country shapes.
	
	```js
	const countryBorders = topojson.mesh(geoData, geoData.objects.countries);
    const geoBoundaryPath = chart.selectAll('.geo-boundary-path')
        .data([countryBorders])
      .join('path')
        .attr('class', 'geo-boundary-path')
        .attr('d', geoPath);
	```
	&nbsp;
	
5. **Draw circle symbols**
	
	We use our second dataset (`data`) and append a circle symbol for each row. Similar to the previous code snippets, we use `.join()` which is a short-cut for the D3 enter-update-exit pattern. Thus, we could easily add a filter or other interactive components and just call this code (i.e. `updateVis()`) with new data repeatedly.
	
	The most important part is the conversion of geo coordinates (latitude, longitude) to pixel coordinates on the screen. We call our `projection()` function with the geo coordinates and it returns the x- and y-values that correspond to our chosen projection method.
	
	```js
	const geoSymbols = chart.selectAll('.geo-symbol')
        .data(data)
      .join('circle')
        .attr('class', 'geo-symbol')
        .attr('r', d => symbolScale(d.visitors))
        .attr('cx', d => projection([d.lon,d.lat])[0])
        .attr('cy', d => projection([d.lon,d.lat])[1]);
	```
	
	We have access to specific x/y coordinates to position the symbols but sometimes we just have the outlines of a region, such as a country, and need to show the symbol in the middle. For those cases, we can use the D3 function [d3.geoCentroid()](https://github.com/d3/d3-geo#geoCentroid) to get the geographic center of a GeoJSON feature.
	
	&nbsp;
	
6. **Add text labels to all symbols**
	
	We want to show the name of each world wonder right above the symbol. This code is very similar to the circles and we only need to adjust the attributes.
	
	```js
	const geoSymbolLabels = chart.selectAll('.geo-label')
        .data(data)
      .join('text')
        .attr('class', 'geo-label')
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .attr('x', d => projection([d.lon,d.lat])[0])
        .attr('y', d => (projection([d.lon,d.lat])[1] - symbolScale(d.visitors) - 8))
        .text(d => d.name);
	```
	
	Instead of implementing a separate legend, we just create labels for two world wonders (with the minimum and maximum number of visitors):
	
	```js
	data.forEach(d => {
      d.showLabel = (d.name == 'Chichen Itza') || (d.name == 'Great Wall')
    });
	```
	
	We position the visitor labels below the circles:
	
	```js
	const geoSymbolVisitorLabels = chart.selectAll('.geo-visitor-label')
        .data(data)
      .join('text')
        .filter(d => d.showLabel)
        .attr('class', 'geo-visitor-label')
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .attr('x', d => projection([d.lon,d.lat])[0])
        .attr('y', d => (projection([d.lon,d.lat])[1] + symbolScale(d.visitors) + 12))
        .text(d => `${d.visitors} mio. visitors`)
	```
	&nbsp;
	
7. **Bind tooltips to symbols**
	
	In the last step, we bind tooltips to the symbols to show the visitor count when users hover over the circle.
	
	We add a placeholder in the HTML file `<div id="tooltip"></div>` and style it in CSS. Then we use D3 to listen to events and display the tooltip accordingly:
	
	```js
	const tooltipPadding = 10;
	geoSymbols
        .on('mousemove', (event,d) => {
          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', `${event.pageX + tooltipPadding}px`)   
            .style('top', `${event.pageY + tooltipPadding}px`)
            .html(`
              <div class="tooltip-title">${d.name}</div>
              <div>${d.country}&nbsp; | &nbsp;${d.visitors} mio. visitors</div>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });
   ```	

See the full example on [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-symbol-map).

[![Codesandbox Symbol Map](images/codesandbox_d3-symbol-map.png?raw=true "Codesandbox Symbol Map")](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-symbol-map)

&nbsp;

## 3. <a name="choropleth-maps">Choropleth Maps</a>

Besides symbol maps, a common technique to visualize geographic data is to create a choropleth map where regions are *coloured* or *patterned* based on the variable of interest. Choropleth maps have some perceptual limitations that you should keep in mind:

* The most effective visual variable is used for geographic data
* The visual significance of a coloured map may not correspond to the effects in the data ("lie factor"). A larger but equally colored region appears more important than a smaller one.
* The colour palette choice has a huge influence on the result.

You can read more about these issues in this [blog post](vis4.net/blog/posts/choropleth-maps/).

In the following, we will highlight the main differences for implementing a choropleth map compared to the previous symbol map example. Our goal is to create a choropleth map that shows the population density per square km for African countries.

1. **Load data**

	We load two datasets: a TopoJSON file of the African continent (`geoData`) and a CSV file with population density estimates of all countries in 2020 (`countryData`). This time, we add the population density as an additional attribute to the TopoJSON features, so that we don't need to handle two datasets.
	
	```js
	geoData.objects.collection.geometries.forEach(d => {
		for (let i = 0; i < countryData.length; i++) {
			if (d.properties.name == countryData[i].region) {
				d.properties.pop_density = +countryData[i].pop_density;
			}
		}
  });
	```
	&nbsp;
2. **Initialize projection and define scale**

	We use the Mercator projection and scale it to fit all countries within the SVG area.
	
	```js
	const projection = d3.geoMercator();
  	const geoPath = d3.geoPath().projection(projection)
  	 
	// Convert compressed TopoJSON to GeoJSON format
	const countries = topojson.feature(data, data.objects.collection)
	
	// Scale of projection
  	projection.fitSize([width, height], countries);
  	```
	&nbsp;
3. **Initialize colour scale and stripe pattern**
	
	We use a colour scale that linearly interpolates colours between light and dark blue.
	
	```js
	// Get min and max values
	const popDensityExtent = d3.extent(data.objects.collection.geometries, d => d.properties.pop_density);
	
	// Initialize scale
	const colorScale = d3.scaleLinear()
        .range(['#cfe2f2', '#0d306b'])
        .domain(popDensityExtent)
        .interpolate(d3.interpolateHcl);
	```
	
	For some countries we don't have any data available and we want to show this visually by using a diagonal stripe pattern. You can create your own SVG patterns but there are also many open source examples, that we can use, such as this [D3 pattern gallery](https://iros.github.io/patternfills/sample_d3.html). From this page, we copied the following SVG pattern ("lightstripe") into our HTML file:
	
	```html
	<svg height="5" width="5" xmlns="http://www.w3.org/2000/svg" version="1.1">
		<defs>
			<pattern id="lightstripe" patternUnits="userSpaceOnUse" width="5" height="5">
				<image xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc1JyBoZWlnaHQ9JzUnPgogIDxyZWN0IHdpZHRoPSc1JyBoZWlnaHQ9JzUnIGZpbGw9J3doaXRlJy8+CiAgPHBhdGggZD0nTTAgNUw1IDBaTTYgNEw0IDZaTS0xIDFMMSAtMVonIHN0cm9rZT0nIzg4OCcgc3Ryb2tlLXdpZHRoPScxJy8+Cjwvc3ZnPg==" x="0" y="0" width="5" height="5"></image>
			</pattern>
		</defs>
	</svg>
	```
	&nbsp;
4. **Draw the choropleth map**
	
	We append the shape path of each country. For the `fill` attribute we distinguish between the colour scale or the stripe pattern. We apply the pattern by using the string `url(#lightstripe)`. "lightstripe" is the same ID that we used in the pattern specification (`<pattern id="lightstripe" ...`)
	
	```js
	const countryPath = chart.selectAll('.country')
        .data(countries.features)
      .join('path')
        .attr('class', 'country')
        .attr('d', geoPath)
        .attr('fill', d => {
          if (d.properties.pop_density) {
            return colorScale(d.properties.pop_density);
          } else {
            return 'url(#lightstripe)';
          }
        }); 
	```

See the full example on [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-choropleth-map).

[![Codesandbox Choropleth Map](images/codesandbox_d3-choropleth-map.png?raw=true "Codesandbox Choropleth Map")](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/d3-choropleth-map)

## 4. <a name="leaflet">Interactive Maps with Leaflet</a>

We can add interactive components to a D3 vector map, such as tooltips or [zooming and panning](https://bl.ocks.org/d3noob/8498ab07f1beb8da0509cd8640452291), but the functionality is limited and the information density is usually not comparable to *interactive tile maps*, with Google Maps being the most prominent example. For many cases, a basic vector map is appropriate because we do not want to have additional layers or information that distracts from the actual data we need to communicate or analyze. 

For some tasks, an interactive, zoomable map may be beneficial. For example, in our case study [Vancouver Bike Sharing](todo), we visualize bikeways and available bikes/slots at docking stations. In this specific scenario, it is helpful for users to zoom in and out to see roads, terrain, etc. at different levels of granularity. We can also use the geo location to automatically zoom in and show the nearest bike sharing stations.

In the following, we will provide a brief overview of [Leaflet](https://leafletjs.com/) which is an open-source alternative to Google Maps. In our [case study](todo), we will guide you through an implementation that visualizes live data from an API using a Leaflet map. 


### Leaflet

Leaflet is a lightweight JavaScript library for mobile-friendly interactive maps. It is open source, which means that there are no costs or dependencies for incorporating it into your visualization. Leaflet works across all major browsers, can be extended with many different plugins, and the implementation is straight-forward. The library provides a technical basis that is comparable to Google Maps, which means that most users are already familiar with it.

Downloads, tutorials & documentations: [leafletjs.com](https://leafletjs.com/)

#### Workflow to create a Leaflet map

* Download [Leaflet](https://leafletjs.com/) and include the JS and CSS files.
* Create a parent HTML container for the map, such as
	
	```html
	<div id="my-map"></div>
	```
	
* Specify the size of the map container
	
	```css
	#my-map { width: 100%; height: 500px; }
	```
* Initialize the map object

	```js
	const map = L.map('my-map').setView([40.712784, -74.005941], 13);
	```
	
	* `[40.712784, -74.005941]` corresponds to the geographical center of the map (`[latitdue, longitude]`). In this example we have specfied the center to be in New York City.
	* If you want to know the latitude-longitude pair of a specific city or address you can use a web service, for instance: [latlong.net](https://www.latlong.net/).
	* Additionaly, we have defined a default zoom-level (13).

* After adding a tile layer we can see our interactive map

	```js
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
	```
	
	In this code snippet, the URL `http://{s}.tile.osm.org/{z}/{x}/{y}.png` is particularly important. Leaflet provides only the *infrastructure* but it does not contain any map imagery. For this reason, the data - called *tiles* - must be implemented by map data providers. That means that we have to choose a provider and specify the source of the map tiles (see URL).
	
	A list of many tile layer examples (that work with Leaflet) is available on this webpage: [leaflet-extras.github.io/leaflet-providers/preview/](https://leaflet-extras.github.io/leaflet-providers/preview/)
	
	Some of the map providers (e.g., OpenStreetMap, Stamen) made their data completely available for free, while others require the registration of an API key (Google, MapBox, ...) and charge fees after exceeding a specific limit.

	![Tile Providers](images/map_tile_providers.png?raw=true "Tile Providers")

* We can add a marker with the following line of code:
	
	```js
	const marker = L.marker([40.713008, -74.013169]).addTo(map);
	```
	
	The array (`[40.713008, -74.013169]`) refers again to a latitude-longitude pair, in our example to the position of the *One World Trade Center*. You have many more options. For example, you can bind a popup to a marker:
	
	```js
	const popupContent =  `<strong>One World Trade Center</strong><br>New York City`;
	
	// Create a marker and bind a popup with a particular HTML content
	const marker = L.marker([40.713008, -74.013169])
		.bindPopup(popupContent)
		.addTo(map);
	```
	
See the result and the full source code on [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/leaflet-basic-map).

[![Codesandbox Leaflet Basic Map](images/codesandbox_leaflet-basic-map.png?raw=true "Codesandbox Leaflet Basic Map")](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/leaflet-basic-map)


#### LayerGroups

Leaflet provides some features to organize markers and other objects that we would like to draw. Basically, it is a layering concept, which means that each marker, circle, polygon etc. is a single layer. These layers can be grouped into *LayerGroups* which makes the handling of these objects easier.

Suppose we want to create an interactive map for a hotel in New York City. We want to show the hotel location, the most popular sights, the nearest subway stations and so on. Now, we could create several LayerGroups for these elements. The advantage of this additional step is, that it is much easier to filter or highlight objects (e.g. show only sights).

```js
// Add empty layer groups for the markers / map objects
const nySights = L.layerGroup().addTo(map);
const subwayStations = L.layerGroup().addTo(map);
```

```js
// Create marker
const centralPark = L.marker([40.771133,-73.974187]).bindPopup('Central Park');

// Add marker to layer group
nySights.addLayer(centralPark);
```

We have a sights layer that combines these markers into one layer and we can add or remove it from the map in one single operation.

#### Circles, lines, and polygons

Besides markers, you can easily add other things to your map, including circles, lines and polygons.

Adding a circle is similar to drawing markers but you need a radius (units in meters) and you can specify some additional visual attributes:

```js
const circle = L.circle([40.762188, -73.971606], {
    color: 'steelblue',
    fillColor: '#ccc',
    fillOpacity: 0.7,
    radius: 500
}).addTo(map);
```

This piece of code creates a circle, centered at the *Four Seasons New York* with a radius of 500 meters.

![Leaflet Map 2](images/leaflet-map-2.png?raw=true "Leaflet Map 2")

We can add a polygon similarly and just need to specify the corner points as a list of latitude-longitude pairs:

```js
const polygon = L.polygon(
	[
	    [40.728328, -74.002868],
	    [40.721937, -74.005443],
	    [40.718961, -74.001280],
	    [40.725287, -73.995916]
	],
	{ 
		color: 'red',
		fillOpacity: 0.7,
		weight: 3
	}
).addTo(map);
```

We can bind popups to these objects too:

```js
polygon.bindPopup("SoHo, Manhattan");
```

This was just a small example to help you get started with Leaflet. The library provides many more features and allows you to create powerful applications, especially if it is linked to D3 or other visualization components.

![Leaflet Map 3](images/leaflet-map-3.png?raw=true "Leaflet Map 3")

#### GeoJSON layer

Leaflet has also built-in methods to support GeoJSON objects. You are already familiar with this special JSON format. GeoJSON support becomes very important if you want to draw complex shapes or many objects on a map.

After loading the GeoJSON objects (usually external files) we can add them to the map through a GeoJSON layer:

```js
L.geoJson(geojsonFeature).addTo(map);
```

Leaflet automatically detects the features and maps them to circles, lines, polygons etc on the map. In this example we have loaded a GeoJSON file with the five boroughs of New York City:


The library provides also a method to style individual features of the GeoJSON layer. You can assign a callback function to the option `style` which styles individual features based on their properties.

```js
const boroughs = L.geoJson(data, {
	style: styleBorough,
	color: '#767ba7',
	weight: 2,
	fillOpacity: 0.4,
}).addTo(map);

function styleBorough(feature) {
	console.log(feature);
}
```

If you want to add popups to each feature of a GeoJSON layer, you have to loop through them too. Similar to `style`, Leaflet provides the option `onEachFeature` that gets called on each feature before adding it to the map.

See the full example on [codesandbox](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/leaflet-geojson-layer).

[![Codesandbox Leaflet GeoJSON Layer](images/codesandbox_leaflet-geojson-layer.png?raw=true "Codesandbox Leaflet GeoJSON Layer")](https://githubbox.com/UBC-InfoVis/2021-436V-examples/tree/master/leaflet-geojson-layer)

---

*Sources:*

* [Harvard's visualization course (CS171)](https://www.cs171.org/)