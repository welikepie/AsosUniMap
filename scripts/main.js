var config = {
	"minTime" : 0, //usually looks like 1376501470
	"minZoom" : 6, //minimum zoom to have.
	"startZoom" : 6, //starting zoom to have.
	"markerMinZoom" : 5,
	"lastUpdated" : 0,
	"baseURL" : "",
	"ulLimit" : 50,
	"LIBOTTOMMARGIN" : 6
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
			mapTypeId : google.maps.MapTypeId.SATELITE,
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
			console.log(maps.map.getZoom());
			var bounds = maps.map.getBounds();
			oldBounds = bounds;
			var bArr = bounds.toString().replace(/[()]/g, "").split(",");
			maps.boundingBox = [parseFloat(bArr[1]), parseFloat(bArr[0]), parseFloat(bArr[3]), parseFloat(bArr[2])];

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
			var bArr = bounds.toString().replace(/[()]/g, "").split(",");
			maps.boundingBox = [parseFloat(bArr[1]), parseFloat(bArr[0]), parseFloat(bArr[3]), parseFloat(bArr[2])];

			tags.filterBasedOnBound("doNothing");
			//tags.update();
			//}
		});
		google.maps.event.addListenerOnce(maps.map, 'idle', function() {
			// do something only the first time the map is loaded
			var bounds = maps.map.getBounds();
			oldBounds = bounds;
			var bArr = bounds.toString().replace(/[()]/g, "").split(",");
			maps.boundingBox = [parseFloat(bArr[1]), parseFloat(bArr[0]), parseFloat(bArr[3]), parseFloat(bArr[2])];

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
			oldBounds = bounds;
			var bArr = bounds.toString().replace(/[()]/g, "").split(",");
			maps.boundingBox = [parseFloat(bArr[1]), parseFloat(bArr[0]), parseFloat(bArr[3]), parseFloat(bArr[2])];
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
			//			document.getElementById("infoBox"+obj.id).getElementsByTagName("img")[0].setAttribute("src",document.getElementById(obj.id).getElementsByTagName(0).getAttribute("img-data-src"));
			if (document.getElementsByClassName("infoBox")[0].getElementsByTagName("img").length > 0) {
				document.getElementsByClassName("infoBox")[0].getElementsByTagName("img")[0].addEventListener("error", function() {
					document.getElementsByClassName("infoBox")[0].getElementsByTagName("img")[0].style.display = "none";
				});
				document.getElementsByClassName("infoBox")[0].getElementsByTagName("img")[0].setAttribute("src", document.getElementsByClassName("infoBox")[0].getElementsByTagName("img")[0].getAttribute("img-data-src"));
			}
			//mmanager.tagManager.refresh();
		});
	},
	"initialise" : function() {
		var thisMarker;
		hashContentManager = new MarkerManager(maps.map);
		for (var zed in tags.locations) {
			if (tags.locations[zed].latitude != null && tags.locations[zed].longitude != null) {
				//console.log(new google.maps.LatLng(tags.locations[zed].latitude, tags.locations[zed].longitude));
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
			//console.log(mmanager.overMark);
			mmanager.tagManager.addMarkers(mmanager.overMark, config.minZoom);
			//console.log(mmanager.tagManager);
			mmanager.tagManager.refresh();
			google.maps.event.addListener(maps.map, 'zoom_changed', function() {
				mmanager.tagManager.refresh();
			});
		});
		//console.log("refreshed");
	}
}
var tags = {
	"singleTag" : "",
	"contentInnerHeight" : 0,
	"locations" : {},
	"optionaltags" : {}, //use optionaltags to traverse locations and get data.
	"inBound" : [],
	"tagData" : {},
	"MAPrender" : [],
	"DOMrender" : [],
	"campaign" : [],
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
		tpht.easyXML("get", config.baseURL + "node/tags.json", "", function(response) {
			var ans = JSON.parse(response).data;
			if (ans.hasOwnProperty("locations")) {
				tags.locations = ans.locations;
			}
			if (ans.hasOwnProperty("optionaltags")) {
				tags.optionaltags = ans.optionaltags;
				//tpht.ping();
			}
			if (ans.hasOwnProperty("campaign")) {
				tags.campaign = ans.campaign;
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
			general.updateSinglePoint();
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
		//console.log(tags.inBound);
		var toCheck = tpht.getByClass("sideBar");
		for (var i = 0; i < toCheck.length; i++) {
			if (tags.inBound.indexOf(toCheck[i].getAttribute("data-rel-hashtag")) == -1) {
				toCheck[i].style.display = "none";
			} else {
				toCheck[i].style.display = "block";
			}
		}
		if (carryOn == true || carryOn == "update") {
			tags.loadTagFiles(tags.inBound, "");
		}
		general.updateSinglePoint();
	},
	"loadTagFiles" : function(arr, updater) {
		tpht.asyncLoop(arr.length, function(loop, i) {
			//		console.log("node/jsons/"+tags.inBound[t]+".json");
			tpht.easyXML("get", config.baseURL + "node/jsons/" + tags.inBound[i] + ".json", "", function(response) {
				//console.log(response);
				if (!JSON.parse(response).hasOwnProperty("error")) {
					tags.tagData[JSON.parse(response).tag] = JSON.parse(response);
				}
				//console.log(tags.tagData[JSON.parse(response).tag]);
				loop.next();
			});
		}, function() {
			//console.log(tags.tagData);
			config.lastUpdated = new Date().getTime();
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
						tags.DOMrender.push(arrAns[t]);
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
			if (zed < config.ulLimit) {
				tags.renderToList(tags.DOMrender[zed], false);
				tags.DOMrenderOnPage.push(obj.id);

				//console.log(document.getElementById("sideBar"+obj.id));
				//	console.log(t);
				//	tpht.ping();
			}
		}
		var iterate = document.getElementsByTagName("li");
		var carried = false;
		document.getElementById("surrounder").onscroll = function() {
			//console.log((document.getElementById("content").offsetHeight-document.getElementById("surrounder").offsetHeight) - 100);
			console.log(document.getElementById("surrounder").scrollTop);
			if (document.getElementById("surrounder").scrollTop >= (document.getElementById("content").offsetHeight - document.getElementById("surrounder").offsetHeight) - 100) {
				console.log("trigger");
				if (carried == false) {
					console.log("doing");
					carried = true;
					var longest = tags.DOMrenderOnPage.length;
					for (var zed = longest; zed < longest + (config.ulLimit); zed++) {
						if (zed < tags.DOMrender.length) {
							tags.renderToList(tags.DOMrender[zed], false);
							tags.DOMrenderOnPage.push(obj.id);
							//console.log(document.getElementById("sideBar"+obj.id));
							//	console.log(t);
							//	tpht.ping();
						}
					}
					console.log(iterate.length);
					console.log("ITERATIVE PROGRESS");
					carried = false;

				}
			}
		}
		//console.log(tags.DOMrender.length);
	},
	"listImageLoad" : function() {

		var unloaded = document.getElementsByClassName("image");
		for (var i in unloaded) {
			//console.log( typeof (unloaded[i]));
			if ( typeof (unloaded[i]) == "object") {
				//console.log(unloaded[i]);
				unloaded[i].addEventListener("error", function() {
					unloaded[i].style.display = 'none';
				});
				unloaded[i].setAttribute("src", unloaded[i].getAttribute("data-img-src"));
			}
		}

	},
	"renew" : function(arr) {
		console.log(arr.length);
		var longWay = 500;
		//		console.log(longWay);
		tpht.asyncLoop(arr.length, function(loop, i) {
			//	console.log(arr[i]);
			//		console.log(new Date(arrAns[t].time).getTime()/1000);
			//	console.log(new Date(arr[i].time).getTime() + "," + config.minTime);
			if (new Date(arr[i].time).getTime() > config.minTime) {
				if (arr[i].lat != null) {
					//console.log(arrAns[t]);
					arr[i].position = new google.maps.LatLng(arr[i].lat, arr[i].lon);
					arr[i].map = maps.map;
					tags.MAPrender.push(arr[i]);
					//shove in to thing here.

					var obj = arr[i];
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

					//	console.log(obj.position);
					tags.renderToList(arr[i], true);
					marker.setVisible(true);
					setTimeout(loop.next, Math.floor(longWay));
					//mmanager.hashContentManager.refresh();
				} else {//DOMrender, //MAPrender
					tags.renderToList(arr[i], true);
					setTimeout(loop.next, Math.floor(longWay));
				}
			}

		}, function() {
			console.log("added all!")
		});
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
		//console.log(tags.DOMrender.length);
	},

	"renderToMap" : function(obj, callback) {
		mcOptions = {
			maxZoom : 18
		};
		//var mcOptions = {gridSize: 50, maxZoom: 15};
		mmanager.hashContentManager = new MarkerClusterer(maps.map, obj, mcOptions);
		google.maps.event.addListener(mmanager.hashContentManager, 'loaded', function() {
			console.log("+++++++++++++++++++++++++++++++++");
			mmanager.hashContentManager.refresh();
		});

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
		var append = document.getElementById("content");
		var toAdd;
		if (tags.inBound.indexOf(obj.hashtag) == -1) {
			toAdd = elements.list(obj, true, inb4);
		} else {
			toAdd = elements.list(obj, false, inb4);
		}
		if (inb4 == true) {
			tpht.appendFirst(toAdd, append);
		} else {
			append.appendChild(toAdd);
		}
	}
}

var elements = {
	"list" : function(obj, hidden, notLazyLoad) {
		notLazyLoad = true;
		var li = document.createElement("li");
		li.setAttribute("id", "sideBar" + obj.id);
		if (hidden == true) {
			li.style.display = "none";
		}
		li.setAttribute("class", "sideBar");
		li.setAttribute("data-rel-hashtag", obj.hashtag.replace(/#/g, ""));
		if (obj.img_small != undefined) {
			var div = document.createElement("img");
			div.setAttribute("class", "image");
			if (obj.src == "TWTTR") {
				if (notLazyLoad == false) {
					div.setAttribute("data-img-src", "http://" + obj.img_small);
				} else {
					div.setAttribute("src", "http://" + obj.img_small);
				}
			} else {
				if (notLazyLoad == false) {
					div.setAttribute("data-img-src", obj.img_small);
				} else {
					div.setAttribute("src", obj.img_small);
				}

			}//"sideBar" + obj.id
			//div.setAttribute("onerror",)
			//			tpht.setAttr(div, "onError", tpht.setAttr(div,"style","display:none;"));

			div.addEventListener("error", function() {
				//console.log("sideBar" + obj.id);
				document.getElementById("sideBar" + obj.id).getElementsByTagName("img")[0].style.display = "none";
			})
			li.appendChild(div);
		}
		var div = document.createElement("div");
		div.textContent = "source: " + obj.source;
		li.appendChild(div);
		var div = document.createElement("div");
		div.setAttribute("class", "user");
		div.textContent = "user: " + obj.user;
		li.appendChild(div);

		if (obj.text != undefined) {
			var div = document.createElement("div");
			div.setAttribute("class", "text");
			div.textContent = "text: " + obj.text;
			li.appendChild(div);
		}
		var div = document.createElement("div");
		div.setAttribute("class", "date");
		div.textContent = "date added: " + obj.time;
		li.appendChild(div);
		//console.log(li);
		return li;
	},
	"info" : function(obj) {
		var li = document.createElement("div");
		li.setAttribute("id", "infoBox" + obj.id);
		li.setAttribute("class", "infoBox");
		if (obj.img_small != undefined) {
			var div = tpht.createElement("img");
			tpht.setClass(div, "image");
			if (obj.src == "TWTTR") {
				tpht.setAttr(div, "img-data-src", "http://" + obj.img_small);
			} else {
				tpht.setAttr(div, "img-data-src", obj.img_small);
			}//tpht.setAttr(div,"src","images/marker.png");
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
var sse = {
	"longtroll" : function(input) {
		console.log(input);
		var ins = JSON.parse(input.data);
		//console.log(ins);
		if (ins.hasOwnProperty("tag")) {
			//	tag.loadTagFiles([input]);
			//fill 'er up.
			//			tags.tagData

			var timeToBeat = 0;
			console.log(tags.tagData);

			var newPushArr = [];
			for (var inputs in ins.answers) {
				if (tags.tagData.hasOwnProperty(ins.answers[inputs].hashtag)) {
					if (new Date(ins.answers[inputs].time).getTime() > tags.tagData[ins.answers[inputs].hashtag].timestamp) {
						tags.tagData[ins.answers[inputs].hashtag].timestamp = new Date(ins.answers[inputs].time).getTime();
						newPushArr.push(ins.answers[inputs]);
					}
				} else {
					tags.tagData[ins.answers[inputs].hashtag] = {
						"answers" : [],
						"tag" : ins.answers[inputs].hashtag,
						"timestamp" : 0
					}
					newPushArr.push(ins.answers[inputs]);
				}
				//console.log(ins.answers[inputs]);
				//check time against last updated
			}
			//			console.log(newPushArr);
			if (newPushArr.length > 0) {
				tags.renew(newPushArr);
			}
		} else {
			//console.log(input.data);
		}

	}
}

var general = {
	"customModal" : function(opts){
/*	{
				"type" : "dialog",
				"message" : "<strong>Warning!</strong><p>The file is already being edited and has been since " + new Date(parseInt(response.data.timestamp, 10)) + "</p>" + "<p>If you are sure you want to edit anyways, click \"Confirm\".</p>",
				"confirm" : function() {
					commandSend("force", "post", function() {
						loadTagJSON("get", -1);
					});
				}
			});*/
	console.log(opts);
	var content = document.getElementById("modalInside");
	var textIn = document.createElement("div");
	textIn.setAttribute("id", "modalText");
	var decline = document.createElement("input");
	decline.setAttribute("type", "button");
	decline.setAttribute("class", "btn btn-large btn-danger");
	decline.setAttribute("id", "modalDeny");
	decline.setAttribute("value", "Dismiss");
	decline.onclick = function() {
		document.getElementById("modalDialogue").style.display = "none";
		document.getElementById("modalInside").innerHTML = "";
	}
	content.appendChild(decline);
	if (opts.type == "dialog") {
		console.log(opts.message);
		textIn.innerHTML = opts.message;
		var confirm = document.createElement("input");
		confirm.setAttribute("type", "button");
		confirm.setAttribute("class", "btn btn-large btn-success");
		confirm.setAttribute("id", "modalConfirm");
		confirm.setAttribute("value", "Confirm");
		confirm.onclick = function() {
			opts.confirm();
		}
		content.appendChild(confirm);
	}
	content.appendChild(textIn);
	document.getElementById("modalDialogue").style.display = "block";

},
	"updateSinglePoint" : function() {
		var extraString = "twitButton.html#type=hashtag&count=none";
		if (tags.inBound.length > 0) {
			var center = maps.map.getCenter().toString().replace(/[()]/g, "").split(",");
			var dist = [999, ""];
			for (var i in tags.inBound) {
				if (tpht.distanceBetweenPoints([parseFloat(center[0]), parseFloat(center[1])], [tags.locations[tags.inBound[i]].latitude, tags.locations[tags.inBound[i]].longitude]) < dist[0]) {
					dist[1] = "#" + tags.inBound[i];
					dist[0] = tpht.distanceBetweenPoints([parseFloat(center[0]), parseFloat(center[1])], [tags.locations[tags.inBound[i]].latitude, tags.locations[tags.inBound[i]].longitude]);
				}//latitude, longitude
			}
			tags.singleTag = dist[1];
		} else {
			tags.singleTag = "";
		}
		//		tags.locations

		/*var toAdd = tags.campaign;
		 if(tags.campaign.length>0){
		 extraString+="&hashtags=";
		 }
		 for(var i in tags.campaign){
		 if(i > 0){
		 extraString += "%2C";
		 }
		 console.log(tags.campaign[i]);
		 extraString+=tags.campaign[i].replace(/#/g,"");
		 }
		 if(tags.inBound.length == 1){
		 if(tags.campaign.length>0){
		 extraString+="%2C";
		 }
		 extraString+=tags.inBound[0];
		 }*/
		var tweet = document.getElementById("twitterButton");
		extraString = extraString+"&hashtags="+tags.singleTag.replace(/#/g,"");
		tweet.setAttribute("src", extraString);
		tweet.contentWindow.location.reload();
	}
}
