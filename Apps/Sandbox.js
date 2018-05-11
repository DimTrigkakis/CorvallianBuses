// For the Cesium workshop
// https://github.com/AnalyticalGraphicsInc/cesium-workshop

//////////////////////////////////////////////////////////////////////////
// Creating the Viewer
//////////////////////////////////////////////////////////////////////////

var viewer = new Cesium.Viewer('cesiumContainer', {
     scene3DOnly: true,
     selectionIndicator: true,
     baseLayerPicker: false,
     animation : false,
     geocoder : true,
     vrButton : true,
     homeButton : false,
     infoBox : true,
     sceneModePicker : false,
     timeline : false,
     navigationHelpButton : false,
     navigationInstructionsInitiallyVisible: false,
     shouldAnimate : false
});

//////////////////////////////////////////////////////////////////////////
// Loading Imagery
//////////////////////////////////////////////////////////////////////////
var layers = viewer.scene.imageryLayers;
layers.remove(viewer.imageryLayers.get(0));

var mapLayer = layers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
    url : '//services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
}))

layers.addImageryProvider(new Cesium.SingleTileImageryProvider({
    url : 'http://www.cityofbartlesville.org/wp-content/uploads/2015/06/world_animate-300x300.jpeg',
    rectangle : Cesium.Rectangle.fromDegrees(-68.0, 28.0, -67.0, 29.75)
}));
// Loading data

var wyoming = viewer.entities.add({
	  name : 'Random Area',
	  polygon : {
	    hierarchy : Cesium.Cartesian3.fromDegreesArray([
	    							-120.55,42.80,
	    							-119.55,42.80,
	    							-119.55,43.80,
	    							-120.55,43.80,
	    							-120.55,42.80,]),
	    height : 0,
	    material : Cesium.Color.YELLOW.withAlpha(0.2),
	    outline : true,
	    outlineColor : Cesium.Color.GREEN
	  }
	});

viewer.zoomTo(wyoming);

wyoming.polygon.extrudedHeight = 25000;

wyoming.description = '\
	<p>\
	  This random area is a random area.\
	</p>\
	<p>\
	  This random area includes random subareas where the volume\
	of each subarea is a percentage of the total volume of the entire\
	random area\
	</p>\
	<p>\
	  Source: \
	  <a style="color: WHITE"\
	    target="_blank"\
	    href="http://en.wikipedia.org/wiki/Random">Wikpedia</a>\
	</p>';

//////////////////////////////////////////////////////////////////////////
// Loading Terrain
//////////////////////////////////////////////////////////////////////////
viewer.terrainProvider = Cesium.createWorldTerrain({
    requestWaterMask : true, // required for water effects
    requestVertexNormals : true // required for terrain lighting
});
viewer.scene.globe.depthTestAgainstTerrain = true;

//////////////////////////////////////////////////////////////////////////
// Configuring the Scene
//////////////////////////////////////////////////////////////////////////

// // Enable lighting based on sun/moon positions
viewer.scene.globe.enableLighting = true;
//
// // Create an initial camera view
// var initialPosition = new Cesium.Cartesian3.fromDegrees(-73.998114468289017509, 40.674512895646692812, 2631.082799425431);
// var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(7.1077496389876024807, -31.987223091598949054, 0.025883251314954971306);
// var homeCameraView = {
//     destination : initialPosition,
//     orientation : {
//         heading : initialOrientation.heading,
//         pitch : initialOrientation.pitch,
//         roll : initialOrientation.roll
//     }
// };
// // Set the initial view
// viewer.scene.camera.setView(homeCameraView);
//
// // Add some camera flight animation options
// homeCameraView.duration = 2.0;
// homeCameraView.maximumHeight = 2000;
// homeCameraView.pitchAdjustHeight = 2000;
// homeCameraView.endTransform = Cesium.Matrix4.IDENTITY;
// // Override the default home button
// viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (e) {
//     e.cancel = true;
//     viewer.scene.camera.flyTo(homeCameraView);
// });
//
// // Set up clock and timeline.
// viewer.clock.shouldAnimate = true; // default
// viewer.clock.startTime = Cesium.JulianDate.fromIso8601("2017-07-11T16:00:00Z");
// viewer.clock.stopTime = Cesium.JulianDate.fromIso8601("2017-07-11T16:20:00Z");
// viewer.clock.currentTime = Cesium.JulianDate.fromIso8601("2017-07-11T16:00:00Z");
// viewer.clock.multiplier = 2; // sets a speedup
// viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER; // tick computation mode
// viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // loop at the end
// viewer.timeline.zoomTo(viewer.clock.startTime, viewer.clock.stopTime); // set visible range

//////////////////////////////////////////////////////////////////////////
// Loading and Styling Entity Data
//////////////////////////////////////////////////////////////////////////

// var kmlOptions = {
//     camera : viewer.scene.camera,
//     canvas : viewer.scene.canvas,
//     clampToGround : true
// };
// // Load geocache points of interest from a KML file
// // Data from : http://catalog.opendata.city/dataset/pediacities-nyc-neighborhoods/resource/91778048-3c58-449c-a3f9-365ed203e914
// var geocachePromise = Cesium.KmlDataSource.load('https://gist.githubusercontent.com/rahwang/bf8aa3a46da5197a4c3445c5f5309613/raw/04e17770dd552fd2694e2597986fd480b18b5014/sampleGeocacheLocations.kml', kmlOptions);
//
// // Add geocache billboard entities to scene and style them
// geocachePromise.then(function(dataSource) {
//     // Add the new data as entities to the viewer
//     viewer.dataSources.add(dataSource);
//
//     // Get the array of entities
//     var geocacheEntities = dataSource.entities.values;
//
//     for (var i = 0; i < geocacheEntities.length; i++) {
//         var entity = geocacheEntities[i];
//         if (Cesium.defined(entity.billboard)) {
//             // Adjust the vertical origin so pins sit on terrain
//             entity.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
//             // Disable the labels to reduce clutter
//             entity.label = undefined;
//             // Add distance display condition
//             entity.billboard.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(10.0, 20000.0);
//             // Compute latitude and longitude in degrees
//             var cartographicPosition = Cesium.Cartographic.fromCartesian(entity.position.getValue(Cesium.JulianDate.now()));
//             var latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);
//             var longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);
//             // Modify description
//             var description = '<table class="cesium-infoBox-defaultTable cesium-infoBox-defaultTable-lighter"><tbody>';
//             description += '<tr><th>' + "Latitude" + '</th><td>' + latitude + '</td></tr>';
//             description += '<tr><th>' + "Longitude" + '</th><td>' + longitude + '</td></tr>';
//             description += '</tbody></table>';
//             entity.description = description;
//         }
//     }
// });
//
// var geojsonOptions = {
//     clampToGround : true
// };
// // Load neighborhood boundaries from a GeoJson file
// // Data from : https://data.cityofnewyork.us/City-Government/Neighborhood-Tabulation-Areas/cpf4-rkhq
// var neighborhoodsPromise = Cesium.GeoJsonDataSource.load('https://gist.githubusercontent.com/rahwang/2c421916bb955ca722a4dbc8ab079c76/raw/ae8a1c5680fbd2fc6940dd3a8f941ad397bdc085/sampleNeighborhoods.geojson', geojsonOptions);
//
// // Save an new entity collection of neighborhood data
// var neighborhoods;
// neighborhoodsPromise.then(function(dataSource) {
//     // Add the new data as entities to the viewer
//     viewer.dataSources.add(dataSource);
//     neighborhoods = dataSource.entities;
//
//     // Get the array of entities
//     var neighborhoodEntities = dataSource.entities.values;
//     for (var i = 0; i < neighborhoodEntities.length; i++) {
//         var entity = neighborhoodEntities[i];
//
//         if (Cesium.defined(entity.polygon)) {
//             // Use kml neighborhood value as entity name
//             entity.name = entity.properties.neighborhood;
//             // Set the polygon material to a random, translucent color
//             entity.polygon.material = Cesium.Color.fromRandom({
//                 red : 0.1,
//                 maximumGreen : 0.5,
//                 minimumBlue : 0.5,
//                 alpha : 0.6
//             });
//             // Tells the polygon to color the terrain. ClassificationType.CESIUM_3D_TILE will color the 3D tileset, and ClassificationType.BOTH will color both the 3d tiles and terrain (BOTH is the default)
//             entity.polygon.classificationType = Cesium.ClassificationType.TERRAIN;
//             // Generate Polygon center
//             var polyPositions = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
//             var polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center;
//             polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
//             entity.position = polyCenter;
//             // Generate labels
//             entity.label = {
//                 text : entity.name,
//                 showBackground : true,
//                 scale : 0.6,
//                 horizontalOrigin : Cesium.HorizontalOrigin.CENTER,
//                 verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
//                 distanceDisplayCondition : new Cesium.DistanceDisplayCondition(10.0, 8000.0),
//                 disableDepthTestDistance : Number.POSITIVE_INFINITY
//             };
//         }
//     }
// });
//
// // Load a drone flight path from a CZML file
// var dronePromise = Cesium.CzmlDataSource.load('https://gist.githubusercontent.com/rahwang/0d1afa6f9e5aa342cb699d26851d97df/raw/5fec1c0cebc097661579143096e796a097c9b629/sampleFlight.czml');
//
// // Save a new drone model entity
// var drone;
// dronePromise.then(function(dataSource) {
//     viewer.dataSources.add(dataSource);
//     drone = dataSource.entities.values[0];
//     // Attach a 3D model
//     drone.model = {
//         uri : 'https://gist.githubusercontent.com/rahwang/9843cb77fc1c6d07c287566ed4e08ee3/raw/dc3a9ff6fc73b784519ac9371c0e2cbd3ab3dc47/CesiumDrone.gltf',
//         minimumPixelSize : 128,
//         maximumScale : 2000
//     };
//     // Add computed orientation based on sampled positions
//     drone.orientation = new Cesium.VelocityOrientationProperty(drone.position);
//
//     // Smooth path interpolation
//     drone.position.setInterpolationOptions({
//         interpolationAlgorithm : Cesium.HermitePolynomialApproximation,
//         interpolationDegree : 2
//     });
//     drone.viewFrom = new Cesium.Cartesian3(-30, 0, 0);
// });

//////////////////////////////////////////////////////////////////////////
// Load 3D Tileset
//////////////////////////////////////////////////////////////////////////

// // Load the NYC buildings tileset
// var city = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({ url: Cesium.IonResource.fromAssetId(3839) }));
//
// // Adjust the tileset height so it's not floating above terrain
// var heightOffset = -32;
// city.readyPromise.then(function(tileset) {
//     // Position tileset
//     var boundingSphere = tileset.boundingSphere;
//     var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
//     var surfacePosition = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
//     var offsetPosition = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, heightOffset);
//     var translation = Cesium.Cartesian3.subtract(offsetPosition, surfacePosition, new Cesium.Cartesian3());
//     tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
// });

//////////////////////////////////////////////////////////////////////////
// Style 3D Tileset
//////////////////////////////////////////////////////////////////////////

// // Define a white, opaque building style
// var defaultStyle = new Cesium.Cesium3DTileStyle({
//     color : "color('white')",
//     show : true
// });
//
// // Define a white, transparent building style
// var transparentStyle = new Cesium.Cesium3DTileStyle({
//     color : "color('white', 0.3)",
//     show : true
// });
//
// // Define a style in which buildings are colored by height
// var heightStyle = new Cesium.Cesium3DTileStyle({
//     color : {
//         conditions : [
//             ["${height} >= 300", "rgba(45, 0, 75, 0.5)"],
//             ["${height} >= 200", "rgb(102, 71, 151)"],
//             ["${height} >= 100", "rgb(170, 162, 204)"],
//             ["${height} >= 50", "rgb(224, 226, 238)"],
//             ["${height} >= 25", "rgb(252, 230, 200)"],
//             ["${height} >= 10", "rgb(248, 176, 87)"],
//             ["${height} >= 5", "rgb(198, 106, 11)"],
//             ["true", "rgb(127, 59, 8)"]
//         ]
//     }
// });
//
// // Set the tileset style to default
// city.style = defaultStyle;

//////////////////////////////////////////////////////////////////////////
// Custom mouse interaction for highlighting and selecting
//////////////////////////////////////////////////////////////////////////

// // If the mouse is over a point of interest, change the entity billboard scale and color
// var previousPickedEntity;
// var handler = viewer.screenSpaceEventHandler;
// handler.setInputAction(function (movement) {
//     var pickedPrimitive = viewer.scene.pick(movement.endPosition);
//     var pickedEntity = Cesium.defined(pickedPrimitive) ? pickedPrimitive.id : undefined;
//     // Unhighlight the previously picked entity
//     if (Cesium.defined(previousPickedEntity)) {
//         previousPickedEntity.billboard.scale = 1.0;
//         previousPickedEntity.billboard.color = Cesium.Color.WHITE;
//     }
//     // Highlight the currently picked entity
//     if (Cesium.defined(pickedEntity) && Cesium.defined(pickedEntity.billboard)) {
//         pickedEntity.billboard.scale = 2.0;
//         pickedEntity.billboard.color = Cesium.Color.ORANGERED;
//         previousPickedEntity = pickedEntity;
//     }
// }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

//////////////////////////////////////////////////////////////////////////
// Setup Camera Modes
//////////////////////////////////////////////////////////////////////////

// // Create a follow camera by tracking the drone entity
// viewer.trackedEntity = drone;

