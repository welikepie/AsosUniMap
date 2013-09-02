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
			zIndex : 8999,
			map : maps.map
		});
		google.maps.event.addListener(beachMarker, 'dblclick', function(event) {
			maps.map.setZoom(maps.map.getZoom() + 1);
			tags.filterBasedOnBound("doNothing");
		});
		google.maps.event.addListener(maps.map, 'zoom_changed', function() {
			var bounds = maps.map.getBounds();
			maps.boundingBox = [bounds.ma.b, bounds.ga.d, bounds.ma.d, bounds.ga.b];
			if (maps.map.getZoom() > config.minZoom) {
				if (maps.map.getZoom() > config.minZoom + 1) {
					mmanager.tagManager.hide();
				} else {
					mmanager.tagManager.show();
				}
				beachMarker.setVisible(false);
			} else {

				beachMarker.setVisible(true);
			}
			mmanager.tagManager.refresh();
			console.log("calling doNothing");
			tags.filterBasedOnBound("doNothing");
		});
		google.maps.event.addListener(maps.map, 'dragend', function() {
			//tpht.getById("map-canvas").onclick = function() {

			var bounds = maps.map.getBounds();
			maps.boundingBox = [bounds.ma.b, bounds.ga.d, bounds.ma.d, bounds.ga.b];
			tags.filterBasedOnBound("doNothing");
			//tags.update();
			//}
		});
		google.maps.event.addListenerOnce(maps.map, 'idle', function() {
			// do something only the first time the map is loaded
			var bounds = maps.map.getBounds();
			oldBounds = bounds;
			maps.boundingBox = [bounds.ma.b, bounds.ga.d, bounds.ma.d, bounds.ga.b];
			console.log(maps.boundingBox);
		});
	}
}

var mmanager = {
	"tagManager" : null,
	"markerArr" : null,
	"hashContentManager" : null,
	"hashContentArr" : [],
	"overMark" : [],
	"addClickToOverHashes" : function(obj) {
		google.maps.event.addListener(obj, 'click', function() {
			maps.map.panTo(obj.getPosition());
			maps.map.setZoom(9);
					
			
			var bounds = maps.map.getBounds();
			maps.boundingBox = [bounds.ma.b, bounds.ga.d, bounds.ma.d, bounds.ga.b]
			tags.filterBasedOnBound("doNothing");
		
		//	console.log("calling");
		});
	},
	"addClickToHashes" : function(obj) {
		console.log("added");
		google.maps.event.addListener(obj, 'click', function() {
			console.log("click");
			maps.map.panTo(obj.getPosition());
			if (maps.oldInfoBox != null) {
				maps.oldInfoBox.close();
			}
			obj.info.open(maps.map, obj);
			maps.oldInfoBox = obj.info;
			//mmanager.tagManager.refresh();
		});
	},
	"initialise" : function() {
		var thisMarker;
		hashContentManager = new MarkerManager(maps.map);
		for (var zed in tags.locations) {
			if (tags.locations[zed].latitude != null && tags.locations[zed].longitude != null) {
				console.log(new google.maps.LatLng(tags.locations[zed].latitude, tags.locations[zed].longitude));
				//thisMarker = new google.maps.Marker({
				thisMarker = new MarkerWithLabel({
					position : new google.maps.LatLng(tags.locations[zed].latitude, tags.locations[zed].longitude),
					title : "#" + zed,
					zIndex : 9010,
					labelContent : "<h2>#" + zed + "</h2>",
					labelAnchor : new google.maps.Point(22, 25),
					labelClass : "labels", // the CSS class for the label
					icon : "images/marker.png"
				});
				//thisMarker.setVisible(false);
				mmanager.addClickToOverHashes(thisMarker);
				mmanager.overMark.push(thisMarker);
			}
			//			console.log(mmanager.overMark[mmanager.overMark.length-1]);
		}
		mmanager.tagManager = new MarkerManager(maps.map);
		google.maps.event.addListener(mmanager.tagManager, 'loaded', function() {
			mmanager.tagManager.addMarkers(mmanager.overMark, config.minZoom);
			mmanager.tagManager.refresh();
			google.maps.event.addListener(maps.map, 'zoom_changed', function() {
				mmanager.tagManager.refresh();
			});
		});
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
		//console.log(tags.locations);
		//console.log(tags.markerTags);
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
				//tpht.ping();
			}
			if (maps.boundingBox.length != 4) {
				waiting = window.setInterval(function() {
					if (maps.boundingBox.length == 4) {
						mmanager.initialise();
						tags.filterBasedOnBound(true);
						clearInterval(waiting);
					}
				}, 500);
			}
			//tags.markerPos();

		});
	},
	"filterBasedOnBound" : function(carryOn) {
		
		tags.inBound = [];
		for (var i in tags.locations) {
			if (tags.locations[i].latitude != null && tags.locations[i].longitude != null) {
				if (tags.locations[i].radius == null) {
					tags.locations[i].radius = 0;
				}
				var near = tpht.compareBoxesRect(maps.boundingBox, tpht.haversine(tags.locations[i].latitude, tags.locations[i].longitude, tags.locations[i].radius));
				if (near == true) {
					tags.inBound.push(i);
				}
			}
		}
		console.log(tags.inBound);
		console.log(maps.map.getBounds());
		var toCheck = tpht.getByClass("sideBar");
		for(var i = 0; i < toCheck.length; i++){
			if(tags.inBound.indexOf(toCheck[i].getAttribute("data-rel-hashtag"))==-1){
				toCheck[i].style.display="none";
			}
			else{
				toCheck[i].style.display="block";
			}
		}
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
				//console.log(tags.tagData[JSON.parse(response).tag]);
				loop.next();
			});
		}, function() {
			//console.log(tags.tagData);
			tags.gather();
		});
	},
	"gather" : function() {
		for (var i in tags.tagData) {
			//console.log(tags.tagData[i]);
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
			var obj = tags.MAPrender[zed];
			var marker = new google.maps.Marker({
				position : obj.position,
				map : obj.map,
				zIndex : 9000,
				addedInfo : obj,
				disableAutoPan : true
			});
			marker.info = new google.maps.InfoWindow({
				content : elements.info(obj),
				zIndex : 9001
			});
			mmanager.addClickToHashes(marker);

			mmanager.hashContentArr.push(marker);
		}
		tags.renderToMap(mmanager.hashContentArr);

		for (var zed in tags.DOMrender) {
			if (zed < 100) {
				tags.renderToList(tags.DOMrender[zed], false);
				//	console.log(t);
				//	tpht.ping();
			}
		}
		//console.log(tags.DOMrender.length);
	},
	"renderToMap" : function(obj) {
		mcOptions = {};
		//var mcOptions = {gridSize: 50, maxZoom: 15};
		mmanager.hashContentManager = new MarkerClusterer(maps.map, obj, mcOptions);
		google.maps.event.addListener(mmanager.hashContentManager, 'loaded', function() {
			mmanager.tagManager.refresh();
		})
		//tpht.lazyLoader("data-image-src");
		//	mmanager.hashContentManager = new MarkerManager(maps.map);
		//	google.maps.event.addListener(mmanager.hashContentManager, 'loaded', function() {
		//console.log("==============================");
		//			mmanager.tagManager.addMarkers(obj, config.minZoom);
		//		mmanager.tagManager.refresh();
		//	});
		//tags.MAPrenderOnPage.push(obj.id);
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
		tpht.setAttr(li, "data-rel-hashtag", obj.hashtag.replace(/#/g, ""));
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
			//tpht.setAttr(div,"src","images/marker.png");
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
