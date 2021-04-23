/**
 * Load TopoJSON data of the world and the data of the world wonders
 */

Promise.all([
  d3.json('data/africa.json'),
  d3.csv('data/region_population_density.csv')
]).then(data => {
  const geoData = data[0];
  const countryData = data[1];

  // Combine both datasets by adding the population density to the TopoJSON file
  geoData.objects.collection.geometries.forEach(d => {
    for (let i = 0; i < countryData.length; i++) {
      if (d.properties.name == countryData[i].region) {
        d.properties.pop_density = +countryData[i].pop_density;
      }
    }
  });

  const choroplethMap = new ChoroplethMap({ 
    parentElement: '#map'
  }, data[0]);
})
.catch(error => console.error(error));
