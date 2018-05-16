var viewer = new Cesium.Viewer('cesiumContainer', {
    terrainExaggeration : 0.0,
    terrainProvider: Cesium.createWorldTerrain()
});
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MzlmNmExYy02M2Y1LTRlYjMtYTQzYi03NDU2ZWFjMDljNDYiLCJpZCI6ODgzLCJpYXQiOjE1MjYyNTQ2ODd9.XZDQ2ZKFlpsAvg_K7puN6dy-fSTTBEEIbFw9sfjH_vM';

//Remove default base layer
viewer.imageryLayers.remove(viewer.imageryLayers.get(0));

// Add Sentinel-2 imagery
viewer.imageryLayers.addImageryProvider(new Cesium.IonImageryProvider({ assetId : 3954 }));

//Enable depth testing so things behind the terrain disappear.
viewer.scene.globe.depthTestAgainstTerrain = true;

//Enable lighting based on sun/moon positions
viewer.scene.globe.enableLighting = true;

//Create an initial camera view
var initialPosition = new Cesium.Cartesian3.fromDegrees(-73.998114468289017509, 40.674512895646692812, 2631.082799425431);
var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(7.1077496389876024807, -31.987223091598949054, 0.025883251314954971306);
var homeCameraView = {
    destination : initialPosition,
    orientation : {
        heading : initialOrientation.heading,
        pitch : initialOrientation.pitch,
        roll : initialOrientation.roll
    }
};
// Set the initial view
viewer.scene.camera.setView(homeCameraView);

//Add some camera flight animation options
homeCameraView.duration = 2.0;
homeCameraView.maximumHeight = 2000;
homeCameraView.pitchAdjustHeight = 2000;
homeCameraView.endTransform = Cesium.Matrix4.IDENTITY;
// Override the default home button
viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (e) {
    e.cancel = true;
    viewer.scene.camera.flyTo(homeCameraView);
});

//Set up clock and timeline.
viewer.clock.shouldAnimate = true; // make the animation play when the viewer starts
viewer.clock.startTime = Cesium.JulianDate.fromIso8601("2017-07-11T16:00:00Z");
viewer.clock.stopTime = Cesium.JulianDate.fromIso8601("2017-07-11T16:20:00Z");
viewer.clock.currentTime = Cesium.JulianDate.fromIso8601("2017-07-11T16:00:00Z");
viewer.clock.multiplier = 2; // sets a speedup
viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER; // tick computation mode
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // loop at the end
viewer.timeline.zoomTo(viewer.clock.startTime, viewer.clock.stopTime); // set visible range

var kmlOptions = {
	    camera : viewer.scene.camera,
	    canvas : viewer.scene.canvas,
	    clampToGround : true
	};
// Load geocache points of interest from a KML file
// Data from : http://catalog.opendata.city/dataset/pediacities-nyc-neighborhoods/resource/91778048-3c58-449c-a3f9-365ed203e914
var geocachePromise = Cesium.KmlDataSource.load('../Source/SampleData/sampleGeocacheLocations.kml', kmlOptions);

//Add geocache billboard entities to scene and style them
geocachePromise.then(function(dataSource) {
    // Add the new data as entities to the viewer
    viewer.dataSources.add(dataSource);

    // Get the array of entities
    var geocacheEntities = dataSource.entities.values;

    for (var i = 0; i < geocacheEntities.length; i++) {
        var entity = geocacheEntities[i];
        if (Cesium.defined(entity.billboard)) {
        	  // Adjust the vertical origin so pins sit on terrain
        	  entity.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
        	  // Disable the labels to reduce clutter
        	  entity.label = undefined;
        	  // Add distance display condition
        	  entity.billboard.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(10.0, 20000.0);
        	  
        	  var cartographicPosition = Cesium.Cartographic.fromCartesian(entity.position.getValue(Cesium.JulianDate.now()));
        	  var longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);
        	  var latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);
        	  // Modify description
        	  // Modify description
        	  var description = '<table class="cesium-infoBox-defaultTable cesium-infoBox-defaultTable-lighter"><tbody>' +
        	      '<tr><th>' + "Longitude" + '</th><td>' + longitude.toFixed(5) + '</td></tr>' +
        	      '<tr><th>' + "Latitude" + '</th><td>' + latitude.toFixed(5) + '</td></tr>' +
        	      '</tbody></table>';
        	  entity.description = description;
        	}
    }
});


var geojsonOptions = {
	    clampToGround : true
	};
	// Load neighborhood boundaries from KML file
	var neighborhoodsPromise = Cesium.GeoJsonDataSource.load('../Source/SampleData/sampleNeighborhoods.geojson', geojsonOptions);

	// Save an new entity collection of neighborhood data
	var neighborhoods;
	neighborhoodsPromise.then(function(dataSource) {
	    // Add the new data as entities to the viewer
	    viewer.dataSources.add(dataSource);
	    neighborhoods = dataSource.entities;

	    // Get the array of entities
	    var neighborhoodEntities = dataSource.entities.values;
	    for (var i = 0; i < neighborhoodEntities.length; i++) {
	        var entity = neighborhoodEntities[i];

	        if (Cesium.defined(entity.polygon)) {
	            // entity styling code here

	        	entity.name = entity.properties.neighborhood;
	        	entity.polygon.material = Cesium.Color.fromRandom({
	        	    red : 0.1,
	        	    maximumGreen : 0.5,
	        	    minimumBlue : 0.5,
	        	    alpha : 0.6
	        	});

	        	entity.polygon.classificationType = Cesium.ClassificationType.TERRAIN;
	        	var polyPositions = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
	        	var polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center;
	        	polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
	        	entity.position = polyCenter;
	        	// Generate labels
	        	entity.label = {
	        	    text : entity.name,
	        	    showBackground : true,
	        	    scale : 0.6,
	        	    horizontalOrigin : Cesium.HorizontalOrigin.CENTER,
	        	    verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
	        	    distanceDisplayCondition : new Cesium.DistanceDisplayCondition(10.0, 8000.0),
	        	    disableDepthTestDistance : 100.0
	        	};
	        }
	    }
	    
	    
});
	
var dronePromise = Cesium.CzmlDataSource.load('../Source/SampleData/SampleFlight.czml');


var drone;
dronePromise.then(function(dataSource) {
    viewer.dataSources.add(dataSource);
    // Get the entity using the id defined in the CZML data
    drone = dataSource.entities.getById('Aircraft/Aircraft1');
    // Attach a 3D model
    drone.model = {
        uri : '../Source/SampleData/Models/CesiumDrone.gltf',
        minimumPixelSize : 128,
        maximumScale : 1000,
        silhouetteColor : Cesium.Color.WHITE,
        silhouetteSize : 2
    };

	  //Add computed orientation based on sampled positions
	  drone.orientation = new Cesium.VelocityOrientationProperty(drone.position);
	
	  //Smooth path interpolation
	  drone.position.setInterpolationOptions({
	      interpolationDegree : 3,
	      interpolationAlgorithm : Cesium.HermitePolynomialApproximation
	  });
});


//Load the NYC buildings tileset

var city = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({ url:'../Source/SampleData/NewYork/NewYork/tileset.json'}));

//Adjust the tileset height so its not floating above terrain
var heightOffset = 0;
city.readyPromise.then(function(tileset) {
    // Position tileset
    var boundingSphere = tileset.boundingSphere;
    var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
    var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
    var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, heightOffset);
    var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
});

var defaultStyle = new Cesium.Cesium3DTileStyle({
    color : "color('white')",
    show : true
});

city.style = defaultStyle;

var transparentStyle = new Cesium.Cesium3DTileStyle({
    color : "color('white', 0.96)",
    show : true
});

city.style = transparentStyle;

var heightStyle = new Cesium.Cesium3DTileStyle({
    color : {
        conditions : [
            ["${height} >= 300", "rgba(45, 0, 75, 0.5)"],
            ["${height} >= 200", "rgb(102, 71, 151)"],
            ["${height} >= 100", "rgb(170, 162, 204)"],
            ["${height} >= 50", "rgb(224, 226, 238)"],
            ["${height} >= 25", "rgb(252, 230, 200)"],
            ["${height} >= 10", "rgb(248, 176, 87)"],
            ["${height} >= 5", "rgb(198, 106, 11)"],
            ["true", "rgb(127, 59, 8)"]
        ]
    }
});


city.style = heightStyle;

var tileStyle = document.getElementById('tileStyle');
function set3DTileStyle() {
    var selectedStyle = tileStyle.options[tileStyle.selectedIndex].value;
    if (selectedStyle === 'none') {
        city.style = defaultStyle;
    } else if (selectedStyle === 'height') {
        city.style = heightStyle;
    } else if (selectedStyle === 'transparent') {
        city.style = transparentStyle;
    }
}

tileStyle.addEventListener('change', set3DTileStyle);

var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction(function(movement) {
	
    var pickedPrimitive = viewer.scene.pick(movement.endPosition);
    var pickedEntity = (Cesium.defined(pickedPrimitive)) ? pickedPrimitive.id : undefined;
    // Highlight the currently picked entity
    if (Cesium.defined(pickedEntity) && Cesium.defined(pickedEntity.billboard)) {
        pickedEntity.billboard.scale = 2.0;
        pickedEntity.billboard.color = Cesium.Color.BLACK;
    }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

function setViewMode() {
    if (droneModeElement.checked) {
        viewer.trackedEntity = drone;
    } else {
        viewer.trackedEntity = undefined;
        viewer.scene.camera.flyTo(homeCameraView);
    }
}

var freeModeElement = document.getElementById('freeMode');
var droneModeElement = document.getElementById('droneMode');

// Create a follow camera by tracking the drone entity
function setViewMode() {
    if (droneModeElement.checked) {
        viewer.trackedEntity = drone;
    } else {
        viewer.trackedEntity = undefined;
        viewer.scene.camera.flyTo(homeCameraView);
    }
}

freeModeElement.addEventListener('change', setViewMode);
droneModeElement.addEventListener('change', setViewMode);

viewer.trackedEntityChanged.addEventListener(function() {
    if (viewer.trackedEntity === drone) {
        freeModeElement.checked = false;
        droneModeElement.checked = true;
    }
});

var neighborhoodsElement =  document.getElementById('neighborhoods');

neighborhoodsElement.addEventListener('change', function (e) {
    neighborhoods.show = e.target.checked;
});

var shadowsElement = document.getElementById('shadows');

shadowsElement.addEventListener('change', function (e) {
    viewer.shadows = e.target.checked;
});

//Finally, wait for the initial city to be ready before removing the loading indicator.
var loadingIndicator = document.getElementById('loadingIndicator');
loadingIndicator.style.display = 'block';
city.readyPromise.then(function () {
    loadingIndicator.style.display = 'none';
});