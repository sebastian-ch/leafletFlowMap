const d3Projections = [
    d3.geoEqualEarth(),
    d3.geoAlbers(),
    d3.geoConicEqualArea(),
    d3.geoEquirectangular(),
    d3.geoNaturalEarth1()


]

var proj = d3Projections[0].scale(.5);

var projUtils = {
    project: function(latLng) {
        var point = proj([latLng.lng, latLng.lat]);
        return point ?
            new L.Point(point[0], point[1]) :
            new L.Point(0, 0);
    },

    unproject: function(point) {
        var latLng = proj.invert([point.x, point.y]);
        return new L.LatLng(latLng[1], latLng[0]);
    }
}


var proj_CRS = L.extend({}, L.CRS, {
    projection: projUtils,
    transformation: new L.Transformation(1, 0, 1, 0),
    infinite: false
});

var centers;

// create Leaflet map
var map = L.map('map', {
    zoomControl: false,
    center: [40.13, -104.28],
    zoomSnap: 0.2,
    zoom: 2,

    crs: proj_CRS,
    continuousWorld: true,
    worldCopyJump: false
});
var lineLayer = L.layerGroup();

var files = [
    'ne_110m_land.json',
    'testAll.geojson'
]

var promises = [];

files.forEach(function(url) {
    promises.push(d3.json(url))
});

Promise.all(promises).then(function(values) {
    centers = values[1]
    drawMap(values[0], values[1])


})




const processData = function(data) {
    if (data.type === 'Topology') {
        for (var key in data.objects) {
            var gjn = topojson.feature(data, data.objects[key]);
        }
        console.log('topo')
        return gjn
    } else {
        return data
    }

}


function drawMap(data, centers) {

    var gjn = L.geoJson(data, {
        style: function(feature) {
            return {
                color: '#c0b299',
                weight: 1
            }

        }

    }).addTo(map);

    var points = L.geoJson(centers, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng)
        },
        style: function(feature) {
            return {
                color: 'red',
                weight: 0
            }
        }
    }).addTo(map)

    var currentView = 'Africa_(62,192)';

    createLine('AFRICA', currentView)

    map.fitBounds(gjn.getBounds());
}

function createLine(selected, currentView) {

    lineLayer.clearLayers()
    
    console.log(selected);
    console.log(centers)
    var end;

    for (var x in centers.features) {
        if (centers.features[x].properties.LEVEL1_NAM == selected) {
            end = [centers.features[x].properties.origin_lon, centers.features[x].properties.origin_lat]
            console.log(end);

        }

    }

    for (var x in centers.features) {



        var start = [centers.features[x].properties.origin_lon, centers.features[x].properties.origin_lat]

        var polyLine = L.polyline.antPath([start, end], {
            weight: centers.features[x].properties[currentView] * 0.01,
            lineCap: 'round',
            color: '#8eac8e',
            pulseColor: 'whitesmoke',
            dashArray: [20, 50]


        }).addTo(lineLayer)

        

    }

    lineLayer.addTo(map);

    


    /* for (var x in centers.features) {

         var start = [centers.features[x].properties.origin_lon, centers.features[x].properties.origin_lat]

         console.log(centers)


         var polyLine = L.polyline.antPath([start, end], {
             weight: centers.features[x].properties[currentView] * 0.01,
             lineCap: 'square',
             color: '#8eac8e',
             pulseColor: 'whitesmoke',
             dashArray: [20,50]


         }).addTo(map)


     } */

}



function changeView(text, currentView) {
    console.log(text)
    createLine(text, currentView);
}

function changeProj() {
    //console.log(map.options.crs);
    // map.options.crs.EPSG3857;

    //map.removeLayer(gjn);

    //code applied from here: https://github.com/Leaflet/Leaflet/issues/2553


    if (map.options.crs == L.CRS.EPSG3857) {
        document.getElementById('button').innerHTML = 'change to Mercator';

        var center = map.getCenter();
        map.options.crs = proj_CRS;
        map.setView(center)
        map._resetView(map.getCenter(), map.getZoom(), true);

    } else {
        document.getElementById('button').innerHTML = 'change to EqualArea';
        var center = map.getCenter();
        map.options.crs = L.CRS.EPSG3857;
        map.setView(center)
        map._resetView(map.getCenter(), map.getZoom(), true);
        //map.addLayer(gjn);

    }

}