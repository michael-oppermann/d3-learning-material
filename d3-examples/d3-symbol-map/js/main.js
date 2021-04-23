/**
 * Load TopoJSON data of the world and the data of the world wonders
 */

Promise.all([
  d3.json('data/world-110m.json'),
  d3.csv('data/world_wonders.csv')
]).then(data => {
  data[1].forEach(d => {
    d.visitors = +d.visitors;
  })

  const geoMap = new GeoMap({ 
    parentElement: '#map'
  }, data[0], data[1]);
})
.catch(error => console.error(error));
