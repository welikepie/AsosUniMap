var maps = {
	map : "",
	boundingBox : [],
	"initialize" : function() {
		var styles = [{
			featureType : "landscape",
			stylers : [{
				visibility : "off"
			}]
		}, {
			featureType : "road",
			stylers : [{
				visibility : "off"
			}]
		}, {
			featureType : "administrative",
			elementType : "all",
			stylers : [{
				visibility : "off"
			}]
		}, {
			featureType : "poi",
			elementType : "all",
			stylers : [{
				visibility : "off"
			}]
		}, {
			featureType : "landscape",
			elementType : "labels",
			stylers : [{
				visibility : "off"
			}]
		}, {
			featureType : "transit",
			elementType : "labels",
			stylers : [{
				visibility : "off"
			}]
		}, {
			featureType : "water",
			elementType : "labels",
			stylers : [{
				visibility : "off"
			}]
		}];
		var mapOptions = {
			center : new google.maps.LatLng(54.53389810146441, 1.95556640625),
			zoom : 6,
			styles : styles,
			mapTypeId : google.maps.MapTypeId.ROADMAP,
			minZoom : 6
		};
		
		maps.map = new google.maps.Map(tpht.getById("map-canvas"), mapOptions);
		tpht.getById("map-canvas").onclick = function() {
			tpht.ping(maps.map.getCenter());
		}
		google.maps.event.addListener(maps.map, 'zoom_changed', function() {
		    var bounds = maps.map.getBounds();
		    maps.boundingBox = [bounds.ma.b,bounds.ga.d,bounds.ma.d,bounds.ga.b];
		    
		  });

		var image = 'images/looksbetter.png';
		var myLatLng = new google.maps.LatLng(49.5, -4.67);
		var beachMarker = new google.maps.Marker({
			position : myLatLng,
			map : maps.map,
			icon : image
		});
		google.maps.event.addListenerOnce(maps.map, 'idle', function(){
    // do something only the first time the map is loaded
			var bounds = maps.map.getBounds();
			maps.boundingBox = [bounds.ma.b,bounds.ga.d,bounds.ma.d,bounds.ga.b];
		console.log(maps.boundingBox);
		});
	}
}
var tags = {
	"locations" : {},
	"optionaltags" : {},
	"inBound" : [],
	"retrieve" : function() {
		var waiting;
		tpht.easyXML("get", "node/tags.json", "", function(response) {
			var ans = JSON.parse(response).data;
			if (ans.hasOwnProperty("locations")) {
				tags.locations = ans.locations;
			}
			if (ans.hasOwnProperty("optionaltags")) {
				tags.optionaltags = ans.optionaltags;
			}
			if(maps.boundingBox.length!=4){
				waiting = window.setInterval(function(){
					if(maps.boundingBox.length==4){
						tags.filterBasedOnBound();	
						clearInterval(waiting);
					}
				},500);
			}

		});
	},
	"filterBasedOnBound" : function() {
		tags.inBound = [];
		for(var i in tags.locations){
			console.log(tags.locations[i]);
			if(tags.locations[i].latitude!=null &&tags.locations[i].longitude!=null &&tags.locations[i].radius != null){
				console.log(tpht.compareBoxes(maps.boundingBox,tpht.haversine(tags.locations[i].latitude,tags.locations[i].longitude,tags.locations[i].radius)));
				//console.log(maps.boundingBox);
				//console.log(tpht.haversine(tags.locations[i].latitude,tags.locations[i].longitude,tags.locations[i].radius));
			}
		}
	}
}
