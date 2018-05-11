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

var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
	    Cesium.Cartesian3.fromDegrees(-123.28, 44.579, 10.0));
	var model = scene.primitives.add(Cesium.Model.fromGltf({
	    url : '../Assets/bus2.gltf',
	    modelMatrix : modelMatrix,
	    scale : 20.0
	}));
	
// Update Loop

function time_travel(t, a, b, c, d) {
	if (t < 1.0 ) {
		return [a*t+(1-t)*c, b*t+(1-t)*d];
	}
	else
	{
		return [a*(2-t)+(t-1)*c, b*(2-t)+(t-1)*d];
	}
		
}
function calcAngleDegrees(x, y) {
	  return Math.atan2(y, x);
	}

var t = 0;
var prev_pos = [0,0];

viewer.clock.canAnimate = false;
viewer.clock.shouldAnimate = false;
viewer.clock.onTick.addEventListener(function(clock){
	pos = time_travel(t, -123.2640, 44.5652, -123.2799, 44.5692)
	pos_diff = [0,0];
	if (prev_pos[0] == 0)
	{
		prev_pos[0] = pos[0];
		prev_pos[1] = pos[1];
	}
	else
	{
		pos_diff = [pos[0] - prev_pos[0], pos[1]-prev_pos[1]];
		prev_pos[0] = pos[0];
		prev_pos[1] = pos[1];
	}
	var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
		    Cesium.Cartesian3.fromDegrees(pos[0], pos[1], 10.0));
	t = t+0.001;
	if (t > 2) {
		t = 0
	}
	
	var ra = calcAngleDegrees(pos_diff[0],pos_diff[1])+2.1+3.1415;	
	var rb = 0;
	var rc = 0;
	model.modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(Cesium.Cartesian3.fromDegrees(pos[0], pos[1], 10.0), new Cesium.HeadingPitchRoll(ra, rb, rc))
	
});

// The shape can also be inferred:
const b = tf.tensor([[1.0, 2.0, 3.0], [10.0, 20.0, 30.0]]);
alert(b);


//////////////////////////////////////////////////////////////////////////
// Debugging: Mouse coordinate events
//////////////////////////////////////////////////////////////////////////

/*
viewer.canvas.addEventListener('click', function(e){
    var mousePosition = new Cesium.Cartesian2(e.clientX, e.clientY);

    var ellipsoid = viewer.scene.globe.ellipsoid;
    var cartesian = viewer.camera.pickEllipsoid(mousePosition, ellipsoid);
    if (cartesian) {
        var cartographic = ellipsoid.cartesianToCartographic(cartesian);
        var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);
        var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);

        alert(longitudeString + ', ' + latitudeString);
    } else {
        alert('Globe was not picked');
    }
	
}, false);
*/
