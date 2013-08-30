var config = {
	"minTime" : 0, //usually looks like 1376501470
	"minZoom" : 6, //minimum zoom to have.
	"startZoom" : 6, //starting zoom to have.
	"markerMinZoom" : 5
}
var maps = {
	oldInfoBox : null,
	oldBounds : null,
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
			zoom : config.startZoom,
			styles : styles,
			mapTypeId : google.maps.MapTypeId.ROADMAP,
			minZoom : config.minZoom
		};

		maps.map = new google.maps.Map(tpht.getById("map-canvas"), mapOptions);

		var image = 'images/looksbetter.png';
		var myLatLng = new google.maps.LatLng(49.5, -4.67);

		var beachMarker = new google.maps.Marker({
			position : myLatLng,
			icon : image,
			pane : "mapPane",
			enableEventPropagation : true,
			zIndex : 0,
			map : maps.map
		});
		google.maps.event.addListener(beachMarker, 'dblclick', function(event) {
			maps.map.setZoom(maps.map.getZoom() + 1);
		});
		google.maps.event.addListener(maps.map, 'zoom_changed', function() {
			var bounds = maps.map.getBounds();
			maps.boundingBox = [bounds.ma.b, bounds.ga.d, bounds.ma.d, bounds.ga.b];
			if (maps.map.getZoom() > config.minZoom) {
				beachMarker.setMap(null);
			} else {
				beachMarker.setMap(maps.map);
			}
		});
		google.maps.event.addListener(maps.map, 'center_changed', function() {
			//tpht.getById("map-canvas").onclick = function() {

			var bounds = maps.map.getBounds();
			maps.boundingBox = [bounds.ma.b, bounds.ga.d, bounds.ma.d, bounds.ga.b];
			//tags.filterBasedOnBound(true);
			//tags.update();
			//}
		});
		google.maps.event.addListenerOnce(maps.map, 'idle', function() {
			// do something only the first time the map is loaded
			var bounds = maps.map.getBounds();
			oldBounds = bounds;
			window.setInterval(function() {
				if (JSON.stringify(maps.map.getBounds()) != JSON.stringify(oldBounds)) {
					//tags.filterBasedOnBound(true);
				}
			}, 500);
			maps.boundingBox = [bounds.ma.b, bounds.ga.d, bounds.ma.d, bounds.ga.b];
			console.log(maps.boundingBox);
		});
	}
}

var mmanager = {
	"tagManager" : null,
	"markerArr" : null,
	"overMark" : [],
	"initialise" : function() {
		console.log("log");
		mmanager.tagManager = new MarkerManager(maps.map);
		for (var zed in tags.locations) {
			if (tags.locations[zed].latitude != null && tags.locations[zed].longitude != null) {
				console.log(new google.maps.LatLng(tags.locations[zed].latitude, tags.locations[zed].longitude));
				mmanager.overMark.push(
				new google.maps.Marker({
					position : new google.maps.LatLng(tags.locations[zed].latitude, tags.locations[zed].longitude),
					title : zed
				}));
			}
//			console.log(mmanager.overMark[mmanager.overMark.length-1]);
		}
		//http://google-maps-utility-library-v3.googlecode.com/svn/tags/markermanager/1.0/docs/examples.html
		//http://stackoverflow.com/questions/1538681/how-to-call-fromlatlngtodivpixel-in-google-maps-api-v3
		//http://stackoverflow.com/questions/7819209/google-map-marker-manager-v3
		this.tagManager.addMarkers(mmanager.overMark,6);
		this.tagManager.addMarkers([],5);
		mmanager.tagManager.refresh();
		console.log("refreshed");
	}
}
var tags = {
	"locations" : {},
	"optionaltags" : {}, //use optionaltags to traverse locations and get data.
	"inBound" : [],
	"tagData" : {},
	"MAPrender" : [],
	"DOMrender" : [],
	"MAPrenderOnPage" : [],
	"DOMrenderOnPage" : [],
	"markerTags" : {},
	"markerPos" : function() {
		//for(var i in tags.optionaltags){
		//	tags.markerTags[i] = {};
		//	for(var k in tags.markerTags[i]){
		//
		//	}
		//}
		console.log(tags.locations);
		console.log(tags.markerTags);
	},
	"retrieve" : function() {
		var waiting;
		tpht.easyXML("get", "node/tags.json", "", function(response) {
			var ans = JSON.parse(response).data;
			if (ans.hasOwnProperty("locations")) {
				tags.locations = ans.locations;
			}
			if (ans.hasOwnProperty("optionaltags")) {
				tags.optionaltags = ans.optionaltags;
				tpht.ping();				
			}
			if (maps.boundingBox.length != 4) {
				waiting = window.setInterval(function() {
					if (maps.boundingBox.length == 4) {
						
						tags.filterBasedOnBound(true);
						clearInterval(waiting);
						mmanager.initialise();
						
					}
				}, 500);
			}
			//tags.markerPos();

		});
	},
	"filterBasedOnBound" : function(carryOn) {
		tags.inBound = [];
		for (var i in tags.locations) {
			//console.log(tags.locations[i]);
			if (tags.locations[i].latitude != null && tags.locations[i].longitude != null) {
				if (tags.locations[i].radius == null) {
					tags.locations[i].radius = 0;
				}
				var near = tpht.compareBoxesCircular(maps.boundingBox, tpht.haversine(tags.locations[i].latitude, tags.locations[i].longitude, tags.locations[i].radius));
				if (near == true) {
					tags.inBound.push(i);
				}
			}
		}
		console.log(tags.inBound);
		if (carryOn == true || carryOn == "update") {
			tags.loadTagFiles(tags.inBound, "");
		}
	},
	"loadTagFiles" : function(arr, updater) {
		tpht.asyncLoop(arr.length, function(loop, i) {
			//		console.log("node/jsons/"+tags.inBound[t]+".json");
			tpht.easyXML("get", "node/jsons/" + tags.inBound[i] + ".json", "", function(response) {
				if (!JSON.parse(response).hasOwnProperty("error")) {
					tags.tagData[JSON.parse(response).tag] = JSON.parse(response);
				}
				console.log(tags.tagData[JSON.parse(response).tag]);
				loop.next();
			});
		}, function() {
			//console.log(tags.tagData);
			tags.gather();
		});
	},
	"gather" : function() {
		for (var i in tags.tagData) {
			console.log(tags.tagData[i]);
			var arrMake = tags.tagData[i];
			var arrTags = arrMake.tag;
			var arrAns = arrMake.answers;
			var arrTime = arrMake.time;
			for (var t in arrAns) {
				//		console.log(new Date(arrAns[t].time).getTime()/1000);
				if (new Date(arrAns[t].time).getTime() / 1000 > config.minTime) {
					if (arrAns[t].lat != null) {
						//console.log(arrAns[t]);
						arrAns[t].position = new google.maps.LatLng(arrAns[t].lat, arrAns[t].lon);
						arrAns[t].map = maps.map;
						tags.MAPrender.push(arrAns[t]);

					} else {//DOMrender, //MAPrender
						tags.DOMrender.push(arrAns[t]);
					}
				}
			}
		}
		tags.MAPrender.sort(function(a, b) {
			var aTime = new Date(a.time).getTime() / 1000;
			var bTime = new Date(b.time).getTime() / 1000;
			if (aTime > bTime) {
				return -1;
			}
			if (aTime < bTime) {
				return 1;
			}

			return 0;

		});
		tags.DOMrender.sort(function(a, b) {
			var aTime = new Date(a.time).getTime() / 1000;
			var bTime = new Date(b.time).getTime() / 1000;
			if (aTime > bTime) {
				return -1;
			}
			if (aTime < bTime) {
				return 1;
			}

			return 0;

		});

		for (var zed in tags.MAPrender) {
			tags.renderToMap(tags.MAPrender[zed]);
		}
		for (var zed in tags.DOMrender) {
			if (zed < 100) {
				tags.renderToList(tags.DOMrender[zed], false);
				//	console.log(t);
				tpht.ping();
			}
		}
		console.log(tags.DOMrender.length);
	},
	"renderToMap" : function(obj) {
		tags.MAPrenderOnPage.push(obj.id)
		var marker = new google.maps.Marker({
			position : obj.position,
			//map : obj.map,
			zIndex : 9000,
			addedInfo : obj,
			disableAutoPan : true
		});
		marker.info = new google.maps.InfoWindow({
			content : elements.info(obj),
			zIndex : 9001
		});

		google.maps.event.addListener(marker, 'click', function() {
			maps.map.panTo(marker.getPosition());
			if (maps.oldInfoBox != null) {
				maps.oldInfoBox.close();
			}
			marker.info.open(maps.map, marker);
			maps.oldInfoBox = marker.info;
		});
	},
	"renderToList" : function(obj, inb4) {
		tags.DOMrenderOnPage.push(obj.id);
		var append = tpht.getById("content");
		if (inb4 == true) {
			tpht.appendFirst(elements.list(obj), append);
		} else {
			append.appendChild(elements.list(obj));
		}
	}
}

var elements = {
	"list" : function(obj) {
		var li = tpht.createElement("li");
		tpht.setId(li, "sideBar" + obj.id);
		tpht.setClass(li, "sideBar");
		if (obj.img_small != undefined) {
			var div = tpht.createElement("img");
			tpht.setClass(div, "image");
			tpht.setAttr(div, "src", obj.img_small);
			li.appendChild(div);
		}
		var div = tpht.createElement("div");
		tpht.setText(div, "source: " + obj.source);
		li.appendChild(div);
		var div = tpht.createElement("div");
		tpht.setClass(div, "user");
		tpht.setText(div, "user: " + obj.user);
		li.appendChild(div);

		if (obj.text != undefined) {
			var div = tpht.createElement("div");
			tpht.setClass(div, "text");
			tpht.setText(div, "text: " + obj.text);
			li.appendChild(div);
		}
		var div = tpht.createElement("div");
		tpht.setClass(div, "date");
		tpht.setText(div, "date added: " + obj.time);
		li.appendChild(div);
		//console.log(li);
		return li;
	},
	"info" : function(obj) {
		var li = tpht.createElement("div");
		tpht.setId(li, "infoBox" + obj.id);
		tpht.setClass(li, "infoBox");
		if (obj.img_small != undefined) {
			var div = tpht.createElement("img");
			tpht.setClass(div, "image");
			tpht.setAttr(div, "src", obj.img_small);
			li.appendChild(div);
		}
		var div = tpht.createElement("div");
		tpht.setText(div, "source: " + obj.source);
		li.appendChild(div);
		var div = tpht.createElement("div");
		tpht.setClass(div, "user");
		tpht.setText(div, "user: " + obj.user);
		li.appendChild(div);

		if (obj.text != undefined) {
			var div = tpht.createElement("div");
			tpht.setClass(div, "text");
			tpht.setText(div, "text: " + obj.text);
			li.appendChild(div);
		}
		var div = tpht.createElement("div");
		tpht.setClass(div, "date");
		tpht.setText(div, "date added: " + obj.time);
		li.appendChild(div);
		//console.log(li);
		return li;
	}
}
