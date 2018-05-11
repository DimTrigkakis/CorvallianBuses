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
     infoBox : false,
     sceneModePicker : false,
     timeline : true,
     navigationHelpButton : false,
     navigationInstructionsInitiallyVisible: false,
     shouldAnimate : false
});

//////////////////////////////////////////////////////////////////////////
//Loading Imagery
//////////////////////////////////////////////////////////////////////////

var layers = viewer.scene.imageryLayers;
layers.remove(viewer.imageryLayers.get(0));

var mapLayer = layers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
    url : '//services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
}))

//////////////////////////////////////////////////////////////////////////
// Camera
//////////////////////////////////////////////////////////////////////////
var initialPosition = new Cesium.Cartesian3.fromDegrees(-123.28, 44.52, 2310.082799425431);
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

// 3d models
var scene = viewer.scene;

function create_model()
{
	var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
	    Cesium.Cartesian3.fromDegrees(-123.28, 44.579, 10.0));
	var model = scene.primitives.add(Cesium.Model.fromGltf({
	    url : '../Assets/bus2.gltf',
	    modelMatrix : modelMatrix,
	    scale : 20.0
	}));
	return [model, [0,0]];
	
}
// Update Loop
function calculate_length(x1,y1,x2,y2){
	
	return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1))
}

function point_travel(t, a, b, c, d) {
	if (t < 1.0 ) {
		return [a*t+(1-t)*c, b*t+(1-t)*d];
	}
	else
	{
		return [a*(2-t)+(t-1)*c, b*(2-t)+(t-1)*d];
	}
		
}

function time_travel(t, index) {
	// return an array of 2 values, for the position at time t (t from 0 to 2 to reverse)
	route = buses[index];

	total_length = 0;
	for (i = 0; i < route.length-1; i++) { 
		total_length += calculate_length(route[i][0],route[i][1], route[i+1][0], route[i+1][1])
	}
	
	partial_times = [];
	var loc_point = 0;
	for (i = 0; i < route.length-1; i++) {
		partial_times.push(calculate_length(route[i][0],route[i][1], route[i+1][0], route[i+1][1])/total_length)
		
	}
	var loc_point = 0;
	var proper_time = 0;
	var proper_time_next = partial_times[0];
	for (i = 0; i < route.length-1; i++) {
		
		if (t > proper_time && t < proper_time_next)
		{
			loc_point = i;
			break;
		}
		proper_time += partial_times[i]
		proper_time_next += partial_times[i+1]
	}

	var previous_time = 0;
	for (i = 0; i < loc_point; i++) {
		previous_time += partial_times[i];
	}
	
	var t_time = (t-previous_time)/partial_times[loc_point];
	
	
	
	// which part are we in?
	
	
	
	return point_travel(t_time, route[loc_point+1][0], route[loc_point+1][1], route[loc_point][0], route[loc_point][1]);
		
}
function calcAngleDegrees(x, y) {
	  return Math.atan2(y, x);
	}

var t = 0;

function busCalculation(item, index) {
	
	var prev_pos = [item[1][0], item[1][1]];
	
	// identify lengths given time, and return the proper position
	pos = time_travel(t, index)
	pos_diff = [0,0];
	if (prev_pos[0] == 0)
	{
		item[1][0] = pos[0];
		item[1][1] = pos[1];
	}
	else
	{
		pos_diff = [pos[0] - prev_pos[0], pos[1]-prev_pos[1]];
		item[1][0] = pos[0];
		item[1][1] = pos[1];
	}
	
	var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
		    Cesium.Cartesian3.fromDegrees(pos[0], pos[1], 10.0));
	t = t+0.001;
	if (t > 1) {
		t = 0
	}
	
	var ra = calcAngleDegrees(pos_diff[1],pos_diff[0])+3.1415;	
	var rb = 0;
	var rc = 0;
	item[0].modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(Cesium.Cartesian3.fromDegrees(pos[0], pos[1], 10.0), new Cesium.HeadingPitchRoll(ra, rb, rc))
	
}

viewer.clock.canAnimate = false;
viewer.clock.shouldAnimate = false;
viewer.clock.onTick.addEventListener(function(clock){
	if (bus_models.length > 0)
	{
		bus_models.forEach(busCalculation)
	}
	
});

// The shape can also be inferred:
const b = tf.tensor([[1.0, 2.0, 3.0], [10.0, 20.0, 30.0]]);



//Handle logic for bus creation
var buses = [];
var bus_models = [];
var polygon_locations = [];
var polygon_location_pairs = [];
var polygons = false;

//////////////////////////////////////////////////////////////////////////
// Toolbars
//////////////////////////////////////////////////////////////////////////
var toolbar = document.getElementById('toolbar');
function start_polygon()
{
	polygons = true;
	polygon_locations = [];
	polygon_location_pairs = [];
}
function stop_polygon()
{
	if (polygon_locations.length > 0)
	{
	polygons = false;
	polygon_locations.push(polygon_locations[0]);
	polygon_locations.push(polygon_locations[1]);
	polygon_locations.push(polygon_locations[2]);
	polygon_location_pairs.push(polygon_location_pairs[0]);
	var route = viewer.entities.add({
	    name : 'Route line',
	    polyline : {
	        positions : Cesium.Cartesian3.fromDegreesArrayHeights(polygon_locations),
	        width : 5,
	        material : new Cesium.PolylineOutlineMaterialProperty({
	            color : Cesium.Color.ORANGE,
	            outlineWidth : 2,
	            outlineColor : Cesium.Color.BLACK
	        })
	    }
	});
	var point_map = viewer.entities.add({
	    name : 'Route line',
	    point : {
	        positions : Cesium.Cartesian3.fromDegreesArrayHeights(polygon_locations),
	        width : 5,
	        
	    }
	});
	buses.push(polygon_location_pairs)
	bus_models.push(create_model())
	polygon_locations = [];
	polygon_location_pairs = [];
	}
	
	viewer.entities.remove('Blank stop')
}

//////////////////////////////////////////////////////////////////////////
// Mouse handler
//////////////////////////////////////////////////////////////////////////

var pinBuilder = new Cesium.PinBuilder();

viewer.canvas.addEventListener('click', function(e){
	if (polygons)
	{
    var mousePosition = new Cesium.Cartesian2(e.clientX, e.clientY);

    var ellipsoid = viewer.scene.globe.ellipsoid;
    var cartesian = viewer.camera.pickEllipsoid(mousePosition, ellipsoid);
    if (cartesian) {
        var cartographic = ellipsoid.cartesianToCartographic(cartesian);
        var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);
        var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);

        //alert(longitudeString + ', ' + latitudeString);
    } else {
        //alert('Globe was not picked');
    }
    
    polygon_locations.push(longitudeString)
    polygon_locations.push(latitudeString)
    polygon_locations.push(1)
    polygon_location_pairs.push([parseFloat(longitudeString),parseFloat(latitudeString)]);
    
    var bluePin = viewer.entities.add({
        name : 'Blank stop',
        position : Cesium.Cartesian3.fromDegrees(parseFloat(longitudeString),parseFloat(latitudeString)),
        billboard : {
            image : pinBuilder.fromColor(Cesium.Color.BLACK, 48).toDataURL(),
            verticalOrigin : Cesium.VerticalOrigin.BOTTOM
        }
    });
    
	}
	
}, false);

