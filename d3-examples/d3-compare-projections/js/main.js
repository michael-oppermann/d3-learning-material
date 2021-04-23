/**
 * Load geo data
 */
d3.json('data/canada_provinces.topo.json')
  .then(data => {
    // Mercator projection
    const geoMap1 = new GeoMap({ 
      parentElement: '#mercator',
      projection: d3.geoMercator()
    }, data);

    // Lambert conformal conic projection
    // See: https://observablehq.com/@bryik/statscans-most-common-map-projection
    // We need to rotate the globe. You can often find specifications for popular projections
    // and world regions somewhere on the internet or you tweak the parameters to get a satisfying result.
    const geoMap2 = new GeoMap({ 
      parentElement: '#lambert',
      projection: d3.geoConicConformal()
          .parallels([49, 77])
          .rotate([91.86667, 0])
    }, data);
  })
  .catch(error => console.error(error));