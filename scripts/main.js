"use strict";
var headingLabel = $("#header").text();
console.log(headingLabel);
var config = {
	"minTime" : 0, //usually looks like 1376501470
	"minZoom" : 6, //minimum zoom to have.
	"startZoom" : 6, //starting zoom to have.
	"markerMinZoom" : 5,
	"baseURL" : "",
	"ulLimit" : 10,
	"bandSizes" : {
		10 : 16,
		25 : 20,
		75 : 24,
		150 : 28,
		305 : 32,
		610 : 36
	},
	"sizesOfLabels" : function() {
		tpht.easyXHR("get", "node/jsons/TAGSSIZES.json", "", function(response) {
			//console.log(response);
			config.sizesOfLabels = JSON.parse(response);
		})
	}
};
var maps = {
	oldInfoBox : null,
	oldBounds : null,
	map : "",
	boundingBox : new Array(),
	"initialize" : function() {
		var styles = [{
			featureType : "all",
			stylers : [{
				visibility : "off"
			}]
		}];
		var mapOptions = {
			streetViewControl : false,
			mapTypeControl : false,
			panControl : false,
			zoomControlOptions : {
				position : google.maps.ControlPosition.LEFT_CENTER
			},
			center : new google.maps.LatLng(54.53389810146441, 1.95556640625),
			zoom : config.startZoom,
			styles : styles,
			mapTypeId : google.maps.MapTypeId.SATELITE,
			minZoom : config.minZoom
		};

		maps.map = new google.maps.Map(tpht.getById("map-canvas"), mapOptions);

		var myLatLng = new google.maps.LatLng(49.5, -4.6);

		var beachMarker = new google.maps.Marker({
			position : myLatLng,
			icon : 'images/uk.png',
			pane : "mapPane",
			zIndex : 500
		});
		beachMarker.setMap(maps.map);
		google.maps.event.addListener(beachMarker, 'dblclick', function(event) {
			maps.map.setZoom(maps.map.getZoom() + 1);
			tags.filterBasedOnBound("doNothing");
		});
		google.maps.event.addListener(maps.map, 'zoom_changed', function() {
						if (maps.map.getZoom() > config.minZoom) {
				maps.map.setOptions({
					"styles" : [{
						"featureType" : "water",
						"stylers" : [{
							"color" : "#54bec6"
						}]
					}]
				});
				if(mmanager.tagManager!=null){
				if (maps.map.getZoom() > config.minZoom + 1) {
					mmanager.tagManager.hide();
				} else {
					mmanager.tagManager.show();
				}
				}
				beachMarker.setVisible(false);
			} else {
				maps.map.setOptions({
					"styles" : [{
						featureType : "all",
						stylers : [{
							visibility : "off"
						}]
					}]
				});
				beachMarker.setVisible(true);
			}
			console.log(maps.map.getZoom());
			var bounds = maps.map.getBounds();
			maps.oldBounds = bounds;
			var bArr = bounds.toString().replace(/[()]/g, "").split(",");
			maps.boundingBox = [parseFloat(bArr[1]), parseFloat(bArr[0]), parseFloat(bArr[3]), parseFloat(bArr[2])];


			//mmanager.tagManager.refresh();
			//console.log("calling doNothing");
			tags.filterBasedOnBound("doNothing");
			//elements.fullUpdate();
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
			maps.oldBounds = bounds;
			var bArr = bounds.toString().replace(/[()]/g, "").split(",");
			maps.boundingBox = [parseFloat(bArr[1]), parseFloat(bArr[0]), parseFloat(bArr[3]), parseFloat(bArr[2])];
			//console.log(maps.map.getCenter());
			//console.log(maps.boundingBox);
		});
	}
}

var mmanager = {
	"tagManager" : null,
	"markerArr" : null,
	"hashContentManager" : null,
	"hashContentArr" : new Array(),
	"overMark" : new Array(),
	"addClickToOverHashes" : function(obj) {
		google.maps.event.addListener(obj, 'click', function() {
			
//			console.log(split);
			maps.map.panTo(	new google.maps.LatLng(	obj.location.latitude, obj.location.longitude));
			
			maps.map.setZoom(9);
			var bounds = maps.map.getBounds();
			maps.oldBounds = bounds;
			var bArr = bounds.toString().replace(/[()]/g, "").split(",");
			maps.boundingBox = [parseFloat(bArr[1]), parseFloat(bArr[0]), parseFloat(bArr[3]), parseFloat(bArr[2])];
			tags.filterBasedOnBound("doNothing");

			//	//console.log("calling");
		});
	},
	"addClickToHashes" : function(obj) {
		////console.log("added");
		google.maps.event.addListener(obj, 'click', function() {
			//console.log("click");
			//maps.map.panTo(obj.getPosition());
			if (maps.oldInfoBox != null) {
				maps.oldInfoBox.close();
			}
			obj.info.open(maps.map, obj);
			maps.oldInfoBox = obj.info;
			twttr.widgets.load();
			//console.log("loading!");
			//
			//			$('#infoBoxDisplay').parent().parent().siblings().children().first().children().addClass("labelRoot");
			$(obj.info).bind("ready", function() {
				//console.log("WAT");
			});
			//			document.getElementById("infoBox"+obj.id).getElementsByTagName("img")[0].attr("src",document.getElementById(obj.id).getElementsByTagName(0).getAttribute("data-img-src"));
			//console.log($("#infoBoxDisplay").find(".image"));
			if ($("#infoBoxDisplay").find(".image")) {

				$("#infoBoxDisplay").find(".image").first().bind("error", function() {
					$("#infoBoxDisplay").find(".image").css("display", "none");
					//console.log("ERROR!");
				});
				//$(".infoBox").first().find("img").attr("src", $(".infoBox").first().find("img").data("img-src"));
			}
			//mmanager.tagManager.refresh();
		});
	},
	"initialise" : function() {
		var thisMarker;
		//mmanager.hashContentManager = new MarkerClusterer(maps.map);
		var element = 3;
		//console.log(tags.optionaltags);
		general.refreshLabelSize();
		for (var zed in tags.locations) {

			if (tags.locations[zed].latitude != null && tags.locations[zed].longitude != null) {
				////console.log(new google.maps.LatLng(tags.locations[zed].latitude, tags.locations[zed].longitude));
				//thisMarker = new google.maps.Marker({
				var toInsert = "";
				//console.log(zed);
				//console.log(tags.optionaltags[zed]);
				if (tags.optionaltags[zed] != "" && tags.optionaltags.hasOwnProperty(zed)) {
					toInsert = tags.optionaltags[zed];
				} else {
					toInsert = "#" + zed;
				}

				var div = document.createElement("div");
				var h2 = document.createElement("h2");
				h2.innerHTML = toInsert;
				div.appendChild(h2);
				div.setAttribute("class", "begin");
				var domDiv = document.createElement("div");
				domDiv.setAttribute("class", "end");
				var addDiv = document.createElement("div");
				addDiv.appendChild(div);
				addDiv.appendChild(domDiv);
				console.log(zed);
				
				var toWrite = 32;
				if(config.bandSizes[config.sizesOfLabels[zed]]!=undefined){
					toWrite = config.bandSizes[config.sizesOfLabels[zed]] + 16;
				}
				console.log();
				thisMarker = new MarkerWithLabel({
					position : new google.maps.LatLng(tags.locations[zed].latitude + 1, tags.locations[zed].longitude-0.5),
					title : "#" + zed,
					zIndex : config.bandSizes[config.sizesOfLabels[zed]],
					labelContent : addDiv.innerHTML,
					location : tags.locations[zed],
					labelAnchor : new google.maps.Point(0, 0),
					labelClass : "size" + toWrite, // the CSS class for the label
					icon : "images/marker.png"
				});
				element++;

				//thisMarker.setVisible(false);
				mmanager.addClickToOverHashes(thisMarker);
				mmanager.overMark.push(thisMarker);
			}

			//			//console.log(mmanager.overMark[mmanager.overMark.length-1]);
		}
		mmanager.tagManager = new MarkerManager(maps.map);

		google.maps.event.addListener(mmanager.tagManager, 'loaded', function() {
			////console.log(mmanager.overMark);
			console.log(mmanager.overMark);
			mmanager.tagManager.addMarkers(mmanager.overMark, config.minZoom);
			////console.log(mmanager.tagManager);
			mmanager.tagManager.show();
			//tags.labelRefresh();
		});
		//		tags.labelRefresh();
		//console.log("refreshed");
	}
}
var tags = {
	"filtration" : "",
	"singleTag" : "", //this is the tag closest to the center which is pulled and used for FB and tweets.
	"contentInnerHeight" : 0,
	"locations" : {},
	"optionaltags" : {}, //use optionaltags to traverse locations and get data.
	"inBound" : new Array(),
	"tagData" : {},
	"MAPrender" : new Array(),
	"DOMrender" : new Array(),
	"campaign" : new Array(),
	"MAPrenderOnPage" : new Array(),
	"DOMrenderOnPage" : new Array(),
	"markerTags" : {},
	"setOrdering" : function() {
		//document.getElementsByClassName("domHash")[0].parentNode.parentNode.parentNode.style.zIndex = 650;
	},
	"inString" : function(haystack, needle) {
		if (needle == "") {
			return true;
		} else if (haystack == null) {
			return false;
		}
		//		//console.log(new RegExp(needle.toLowerCase()).test(haystack.toLowerCase()));
		return new RegExp(needle.toLowerCase()).test(haystack.toLowerCase());
		// false
	},
	"labelRefresh" : function() {
		var thing = window.setInterval(function() {
			////console.log(document.getElementsByClassName("labels"));
			var elements = $(".labels");
			if (elements.length > 0) {
				window.clearInterval(thing);
			}
		}, 100);

		//		 for(var i = 0, length = elements.length; i < length; i++) {
		//		 	//console.log(elements.item(i));
		//		 }
	},
	"markerPos" : function() {
		//for(var i in tags.optionaltags){
		//	tags.markerTags[i] = {};
		//	for(var k in tags.markerTags[i]){
		//
		//	}
		//}
		////console.log(tags.locations);
		////console.log(tags.markerTags);
	},
	"retrieve" : function() {
		var waiting;
		tpht.easyXHR("get", config.baseURL + "node/tags.json", "", function(response) {
			var ans = JSON.parse(response).data;
			if (ans.hasOwnProperty("locations")) {
				tags.locations = ans.locations;
			}
			//			//console.log(tags);
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
						tags.filterBasedOnBound(true);
						clearInterval(waiting);
					}
				}, 500);
			}
			general.updateSinglePoint();
			//console.log("filterBased");

			//tags.markerPos();

		});
	},
	"filterBasedOnBound" : function(carryOn) {
		tags.inBound = new Array();
		for (var i in tags.locations) {
			if (tags.locations[i].latitude != null && tags.locations[i].longitude != null) {
				if (tags.locations[i].radius == null) {
					tags.locations[i].radius = 0;
				}
				//console.log(maps.boundingBox);
				var near = tpht.compareBoxesRect(maps.boundingBox, tpht.haversine(tags.locations[i].latitude, tags.locations[i].longitude, tags.locations[i].radius));
				if (near == true) {
					tags.inBound.push(i);
				}
			}
		}
		//console.log(tags.inBound);
		elements.fullUpdate();

		if (carryOn == true || carryOn == "update") {
			tags.loadTagFiles(tags.inBound, "");
		}
		general.updateSinglePoint();
		//console.log("preLoadTagFiles");
	},
	"loadTagFiles" : function(arr, updater) {
		tpht.asyncLoop(arr.length, function(loop, i) {
			//		//console.log("node/jsons/"+tags.inBound[t]+".json");
			//console.log(tags.inBound);
			tpht.easyXHR("get", config.baseURL + "node/jsons/" + tags.inBound[i] + ".json", "", function(response) {
				////console.log(response);
				//console.log(response.length);
				if (!JSON.parse(response).hasOwnProperty("error")) {
					//console.log("GETTING");
					tags.tagData[JSON.parse(response).tag] = JSON.parse(response);
				}
				//console.log(tags.tagData[JSON.parse(response).tag].answers.length);
				////console.log(tags.tagData[JSON.parse(response).tag]);
				loop.next();
			});
		}, function() {
			////console.log(tags.tagData);
			//console.log("STUFFANDTHINGS");
			tags.gather();
		});
	},
	"gather" : function() {
		//		//console.log(tags.tagData);
		for (var i in tags.tagData) {
			//console.log("++++++++++++++++++++++++++++++++++++");
			//console.log(i);

			////console.log(tags.tagData[i]);
			var arrMake = tags.tagData[i];
			var arrTags = arrMake.tag;
			var arrAns = arrMake.answers;
			var arrTime = arrMake.time;

			for (var t in arrAns) {
				////console.log(JSON.stringify(arrAns[t]));
				//		//console.log(new Date(arrAns[t].time).getTime()/1000);
				////console.log(new Date());
				////console.log((new Date(arrAns[t].time).getTime() / 1000));
				//				//console.log(arrAns[t].time);
				//				//console.log(new Date(arrAns[t].time).getTime());
				if (parseInt(arrAns[t].time, 10) * 1000 >= config.minTime) {
					if (arrAns[t].lat != null) {
						//					//console.log(arrAns[t]);
						arrAns[t].position = new google.maps.LatLng(arrAns[t].lat, arrAns[t].lon);
						tags.MAPrender.push(arrAns[t]);
						tags.DOMrender.push(arrAns[t]);
					} else {//DOMrender, //MAPrender
						tags.DOMrender.push(arrAns[t]);
					}
				}
			}
		}
		tags.MAPrender.sort(function(a, b) {
			var aTime = parseInt(a.time, 10) * 1000;
			var bTime = parseInt(b.time, 10) * 1000;
			if (aTime > bTime) {
				return -1;
			}
			if (aTime < bTime) {
				return 1;
			}

			return 0;

		});
		tags.DOMrender.sort(function(a, b) {
			var aTime = parseInt(a.time, 10) * 1000;
			var bTime = parseInt(b.time, 10) * 1000;
			if (aTime > bTime) {
				return -1;
			}
			if (aTime < bTime) {
				return 1;
			}

			return 0;

		});
		//console.log("starting");
		for (var zed in tags.MAPrender) {
			var obj = tags.MAPrender[zed];
			//	//console.log(obj);
			////console.log(obj.position);
			var marker = new google.maps.Marker({
				"position" : obj.position,
				"map" : obj.map,
				"icon" : "images/mapMarker.png",
				"zIndex" : 9000,
				"disableAutoPan" : true,
				"text" : obj.text
			});
			//			console.log(marker);

			/*			marker.info = new google.maps.InfoWindow({
			"content" : elements.info(obj),
			"zIndex" : 9005
			});*/
			//			var t = new In
			marker.info = new InfoBubble({
				content : elements.info(obj),
				zIndex : 9001,
				arrowStyle : 2,
				padding : 10,
				borderWidth : 2,
				borderRadius : 0,
				arrowSize : 65,
				arrowTopSize : 20,
				//maxHeight: 270,
				minWidth : 320,
				maxWidth : 320,
				arrowPosition : 30,
				borderColor : "#22b9c8",
				backgroundColor : '#ffdf24'

			})

			mmanager.addClickToHashes(marker);
			mmanager.hashContentArr.push(marker);
		}
		tags.renderToMap(mmanager.hashContentArr);
		tags.setOrdering();
		//console.log("finishing");
		//console.log(tags.DOMrender.length);
		//console.log(tags.MAPrender.length);
		for (var zed in tags.DOMrender) {
			if (zed < config.ulLimit) {
				tags.renderToList(tags.DOMrender[zed], false);
				tags.DOMrenderOnPage.push(tags.DOMrender[zed].id);

				////console.log(document.getElementById("sideBar"+obj.id));
				//	//console.log(t);
				//	tpht.ping();
			}
			if (zed == config.ulLimit) {
				twttr.widgets.load();
			}
		}
		////console.log("rendered");
		var iterate = document.getElementsByTagName("li");
		var carried = false;
		document.getElementById("surrounder").onscroll = function() {
			////console.log((document.getElementById("content").offsetHeight-document.getElementById("surrounder").offsetHeight) - 100);
			//console.log(document.getElementById("surrounder").scrollTop);
			if (document.getElementById("surrounder").scrollTop >= (document.getElementById("content").offsetHeight - document.getElementById("surrounder").offsetHeight) - 100) {
				//console.log("trigger");
				if (carried == false) {

					//-----------------------------------------------------------------------
					//console.log("doing");
					carried = true;
					//config.U
					var pp = 0;

					var longest = tags.DOMrenderOnPage.length;
					var lengthToReach = tags.DOMrender.length;

					for (var zeds = 0; zeds < lengthToReach; zeds++) {
						console.log(tags.filtration);

						if (tags.inBound.indexOf(tags.DOMrender[zeds].hashtag) > -1) {
							tags.renderToList(tags.DOMrender[zeds], false);
							tags.DOMrender.splice(zeds, 1);
							pp++;
						} else if (tags.filtration.length > 0) {
							if (tags.inString(tags.DOMrender[zeds].text, tags.filtration)) {
								tags.renderToList(tags.DOMrender[zeds], false);
								tags.DOMrender.splice(zeds, 1);
								pp++
							}

						}
						if (pp > config.ulLimit) {
							break;
						} else if (zeds == lengthToReach - 1 - pp) {
							break;
						}
					}
					twttr.widgets.load();
					//console.log(iterate.length);
					//console.log("ITERATIVE PROGRESS");
					carried = false;
					//--------------------------------------------------------------------
				}
			}
		}
		//console.log("addedRender");
		////console.log(tags.DOMrender.length);
	},
	"listImageLoad" : function() {

		var unloaded = $(".image");
		for (var i in unloaded) {
			////console.log( typeof (unloaded[i]));
			if ( typeof (unloaded[i]) == "object") {
				////console.log(unloaded[i]);
				$(unloaded[i]).bind("error", function() {
					$("#sideBar" + obj.id).children("img")[0].css("display:none;");
				});
				$(unloaded[i]).attr("src", $(unloaded[i]).data("img-src"));
				$(unloaded[i]).removeAttr("width");
				$(unloaded[i]).removeAttr("height");
			}
		}

	},
	"renew" : function(arr) {
		////console.log(arr.length);
		var longWay = 500;
		//		//console.log(longWay);
		tpht.asyncLoop(arr.length, function(loop, i) {
			//	//console.log(arr[i]);
			//		//console.log(new Date(arrAns[t].time).getTime()/1000);

			//	//console.log(new Date(arr[i].time).getTime() + "," + config.minTime);
			if (parseInt(arr[i].time, 10) * 1000 >= config.minTime) {
				if (arr[i].lat != null) {
					////console.log(arrAns[t]);
					arr[i].position = new google.maps.LatLng(arr[i].lat, arr[i].lon);
					arr[i].map = maps.map;
					tags.MAPrender.push(arr[i]);
					////console.log(arr[i]);
					//shove in to thing here.

					var obj = arr[i];
					var marker = new google.maps.Marker({
						position : new google.maps.LatLng(arr[i].latitude, arr[i].longitude),
						map : maps.map,
						icon : "images/mapMarker.png",
						zIndex : 9000,
						text : arr[i].text,
						disableAutoPan : true
					});
					console.log(marker);
					/*marker.info = new google.maps.InfoWindow({
					content : elements.info(arr[i]),
					zIndex : 9001
					});*/
					//map marker styling
					marker.info = new InfoBubble({
						content : elements.info(arr[i]),
						zIndex : 9001,
						ShadowStyle : 3,
						padding : 10,
						arrowStyle : 2,
						borderWidth : 2,
						borderRadius : 0,
						arrowSize : 70,
						minWidth : 320,
						maxWidth : 320,
						arrowPosition : 30,
						//						maxHeight: 270,
						borderColor : "#22b9c8",
						backgroundColor : '#ffdf24'
					})
					mmanager.addClickToHashes(marker);

					//	//console.log(obj.position);
					tags.renderToList(arr[i], true);
					marker.setVisible(true);
					setTimeout(loop.next, Math.floor(longWay));
					//mmanager.hashContentManager.refresh();
				} else {//DOMrender, //MAPrender
					tags.renderToList(arr[i], true);
					setTimeout(loop.next, Math.floor(longWay));
				}
			}
			//console.log(i);
			if (i % 10 == 0 || i == arr.length - 1) {
				twttr.widgets.load();
			}
		}, function() {
			//console.log("added all!")
		});
		tags.MAPrender.sort(function(a, b) {
			var aTime = parseInt(a.time, 10) * 1000;
			var bTime = parseInt(b.time, 10) * 1000;
			if (aTime > bTime) {
				return -1;
			}
			if (aTime < bTime) {
				return 1;
			}

			return 0;

		});
		tags.DOMrender.sort(function(a, b) {
			var aTime = parseInt(a.time, 10) * 1000;
			var bTime = parseInt(b.time, 10) * 1000;
			if (aTime > bTime) {
				return -1;
			}
			if (aTime < bTime) {
				return 1;
			}

			return 0;

		});
		////console.log(tags.DOMrender.length);
	},

	"renderToMap" : function(obj) {
		//console.log("instantiationg");
		var mcOptions = {
			"maxZoom" : 18,
		};
		//console.log("instantiationg");
		try {
			if (ie == false) {
				mmanager.hashContentManager = new MarkerClusterer(maps.map, obj, mcOptions);
			}
			if (ie == true) {
				tpht.asyncLoop(obj.length, function(loop, i) {
					obj[i].setMap(maps.map);
					window.setTimeout(loop.next(), 10);
				}, function() {
				});
			}
		} catch(e) {
		}
		//console.log("markerClusterer");
		//console.log("listener");
		mmanager.initialise();
		//console.log("init");

		//tpht.lazyLoader("data-image-src");
		//	mmanager.hashContentManager = new MarkerManager(maps.map);
		//	google.maps.event.addListener(mmanager.hashContentManager, 'loaded', function() {
		////console.log("==============================");
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
		////console.log($(toAdd).children(".text").text());

		if (tags.inBound.length > 0) {
			if (tags.inBound.indexOf($(toAdd).attr("data-rel-hashtag")) == -1 || tags.inString(obj.text, tags.filtration) == false) {
				$(toAdd).css("display", "none");
			} else {
				$(toAdd).css("display", "block");
			}
		} else {
			$(toAdd).css("display", "block");
		}

		if (inb4 == true) {
			tpht.appendFirst(toAdd, append);
			//console.log($(toAdd).html());
			////console.log("MEFIRST");
		}
		else {
			append.appendChild(toAdd);
			////console.log($(toAdd).html());
			////console.log("FOUND");
		}
	}
}
var elements = {
	"fullUpdate" : function() {
		var ins = $(".sideBar");
		//console.log(ins);
		console.log(tags.inBound);
		console.log(tags.optionaltags);
		var comparator;
/*---------------------------------------------------------------------
if (mmanager.hashContentManager != null && tags.filtration.length > 0) {
	var cycleArr = mmanager.hashContentManager.getMarkers();
		if (ie == true) {
			for (var el = 0; el < hashContentArr[el].length; el++) {
				if(tags.inString(mmanager.hashContentArr[el].text, tags.filtration) == false){
					mmanager.hashContentArr[el].setVisible(false);
				}
				else{
					mmanager.hashContentArr[el].setVisible(true);
				}
			}
		}
		if (ie == false) {
			for (var el = 0; el < cycleArr.length; el++) {
				if (tags.inString(cycleArr[el].text, tags.filtration) == false) {
					cycleArr[el].setVisible(false);
				}
				else{
					cycleArr[el].setVisible(true);
				}
			}//	mmanager.hashContentManager.removeMarker(mmanager.hashContentArr[el]);
		}

}
---------------------------------------------------------------------*/

		if (maps.map.getZoom() >= 9 && tags.singleTag != "") {
			if (tags.optionaltags.hasOwnProperty(tags.singleTag)) {
				if (tags.optionaltags[tags.singleTag] != "") {
					$("#header").text(tags.optionaltags[tags.singleTag]);
				} else {
					$("#header").text(tags.singleTag);
				}
			} else {
				$("#header").text(tags.singleTag);
			}

		} else if (tags.inBound.length == 1) {
			if (tags.optionaltags.hasOwnProperty(tags.inBound[0])) {
				if (tags.optionaltags[tags.inBound[0]] != "") {
					$("#header").text(tags.optionaltags[tags.inBound[0]]);
				} else {
					$("#header").text(tags.inBound[0]);
				}
			} else {
				$("#header").text(tags.inBound[0]);
			}
		} else {
			$("#header").text(headingLabel);
		}
		console.log("GETTING HERE");
		if (ins.length > 0) {
			console.log("ins.length");
			var hidden = 0;
			var disp = 0;
			for (var i = 0; i < ins.length; i++) {
				//console.log(ins[i]);
				if (Object.prototype.hasOwnProperty.call(ins, i)) {
					var content = "";
					if ($(ins[i]).has(".textWithImg")) {
						content = $(ins[i]).has(".textWithImg").first().text();
					} else if ($(ins[i]).has(".text")) {
						content = $(ins[i]).has(".text").first().text();
					} else if ($(ins[i]).has(".e-entry-answer")) {
						content = $(ins[i]).has(".e-entry-answer").first().text();
					}
					if (tags.filtration != "") {
						if (tags.inString(content, tags.filtration) == false) {
							$(ins[i]).css("display", "none");
						} else {
							$(ins[i]).css("display", "block");
						}
					} else if (tags.inBound.length > 0) {
						if (tags.inBound.indexOf($(ins[i]).data("rel-hashtag")) == -1) {
							//console.log(tags.inBound.indexOf($(ins[i]).data("rel-hashtag")));
							//console.log(ins[i]);
							$(ins[i]).css("display", "none");
						} else {
							$(ins[i]).css("display", "block");
							disp++;
						}
					} else {
						$(ins[i]).css("display", "block");
						disp++;
					}
				}
			}
			console.log("and out the other side");
			console.log(disp);
			if (disp < 5) {
				for (var zeds in tags.DOMrender) {
					//console.log(tags.DOMrender[zeds]);
					if (disp >= 5) {
						break;
					} else if (tags.filtration.length > 0) {
						//console.log("searching");
						if (tags.DOMrender[zeds].text != null && tags.DOMrender[zeds].text.length > 0) {
							console.log(tags.inString(tags.DOMrender[zeds].text, tags.filtration));
							if (tags.inString(tags.DOMrender[zeds].text, tags.filtration) == true) {
								tags.renderToList(tags.DOMrender[zeds], false);
								tags.DOMrenderOnPage.push(tags.DOMrender[zeds].id);
								tags.DOMrender.splice(zeds, 1);
								disp++;
							}
						}
					} else if (tags.inBound.indexOf(tags.DOMrender[zeds].hashtag) > -1) {
						tags.renderToList(tags.DOMrender[zeds], true);
						tags.DOMrenderOnPage.push(tags.DOMrender[zeds].id);
						tags.DOMrender.splice(zeds, 1);
						disp++;
					}

					//					console.log(tags.DOMrender[zeds]);
					//				if(tags.DOMrender[zeds].//tags.renderToList(tags.DOMrender[zed], false);
					//tags.DOMrenderOnPage.push(obj.id);
				}
			}

		}
		twttr.widgets.load();
		//console.log("callingWidgets");
	},
	"filter" : function(input, string) {
		if (input.substring(0, 5) == "text:") {
			input = input.substring(6, input.length);
		}
		if (input.toLowerCase().indexOf(string.toLowerCase()) > -1) {
			return true;
		}
		return false;
	},
	"list" : function(obj, hidden, notLazyLoad) {
		notLazyLoad = true;
		if (obj.source == "TWTTR") {

			var insLI = document.createElement("li");
			$(insLI).attr("id", "sideBar" + obj.id);
			$(insLI).attr("class", "sideBar");
			$(insLI).attr("data-rel-hashtag", obj.hashtag.replace(/#/g, ""));
			$(insLI).attr("data-timestamp", obj.time);
			$(insLI).attr("data-rel-source", obj.src);
			if (hidden == true) {
				$(insLI).css("display", "none");
			}

			var li = document.createElement("blockquote");
			li.setAttribute("class", "twitter-tweet");
			li.setAttribute("data-conversation", "none");
			li.setAttribute("width", "290px");
			var p = document.createElement("p");
			p.innerHTML = obj.text;
			li.appendChild(p);
			if (obj.name != undefined) {
				var inText = document.createTextNode("—" + obj.name + " (@" + obj.user + ")");
			} else {
				var inText = document.createTextNode("— @" + obj.user + " (@" + obj.user + ")");
			}
			li.appendChild(inText);
			var link = document.createElement("a");
			link.setAttribute("href", "https://twitter.com/" + obj.user + "/status/" + obj.id);
			//link.setAttribute("data-datetime",new Date(obj.time).format("yyyy-MM-dd h:mm:ss"));
			li.appendChild(link);
			var lText = document.createTextNode("");
			link.appendChild(lText);
			insLI.appendChild(li);
			return insLI;
		} else if (obj.source != "TWITTR") {
			var li = document.createElement("li");
			$(li).attr("id", "sideBar" + obj.id);
			if (hidden == true) {
				$(li).css("display", "none");
			}
			$(li).attr("class", "sideBar");
			$(li).attr("data-rel-hashtag", obj.hashtag.replace(/#/g, ""));
			$(li).attr("data-timestamp", obj.time);
			$(li).attr("data-rel-source", obj.src);
			var topDiv = document.createElement("div");
			topDiv.setAttribute("class", "topDiv");
			if (obj.imgURL != "") {
				var profImg = document.createElement("img");
				profImg.setAttribute("src", obj.userIMG);
				profImg.setAttribute("class", "profileImages");
				topDiv.appendChild(profImg);
				$(profImg).bind("error", function() {
					////console.log("sideBar" + obj.id);
					$(profImg).css("display", "none");
				})
			}

			//console.log(JSON.stringify(obj));
			if (obj.name != null) {
				var str = obj.name.replace(/(^\s+|\s+$)/g, ' ');
				;
			} else {
				var str = "";
			}
			//console.log(str);
			var splitString = [str.substr(0, str.indexOf(" ")), str.substr(str.indexOf(" ") + 1)];
			// "tocirah sneab"]
			var classes = ["firstName", "lastName"];
			var domDiv = document.createElement("div");
			domDiv.setAttribute("class", "nameContainer");
			for (var i = 0; i < splitString.length; i++) {
				var addDiv = document.createElement("p");
				addDiv.setAttribute("class", classes[i]);
				var addDivText = document.createTextNode(splitString[i].toUpperCase());
				addDiv.appendChild(addDivText);
				domDiv.appendChild(addDiv);

			}
			var namesDiv = document.createElement("div");
			namesDiv.setAttribute("class", "names");
			namesDiv.appendChild(domDiv);

			if (obj.source != "FACEB") {
				var userDiv = document.createElement("p");
				userDiv.setAttribute("class", "userNameTag");
				var userDivText = document.createTextNode("@" + obj.user);
				userDiv.appendChild(userDivText);
				namesDiv.appendChild(userDiv);
			}
			topDiv.appendChild(namesDiv);

			var bottomDiv = document.createElement("div");
			bottomDiv.setAttribute("class", "bottomDiv");

			if (obj.img_small != undefined && obj.img_small != "") {
				var div = document.createElement("img");
				$(div).attr("class", "image");
				if (notLazyLoad == false) {
					$(div).attr("data-img-src", obj.img_small);
				} else {
					$(div).attr("src", obj.img_small);
				}
				//"sideBar" + obj.id
				//div.attr("onerror",)
				//			tpht.setAttr(div, "onError", tpht.setAttr(div,"style","display:none;"));
				$(div).bind("error", function() {
					////console.log("sideBar" + obj.id);
					$(div).css("display", "none");
					$("#sideBar" + obj.id).find(".textWithImg").attr("class", "text");
					console.log("ERRORED SORTED");
				})
				bottomDiv.appendChild(div);

			}

			if (obj.text != undefined) {
				var divt = document.createElement("div");
				$(divt).attr("class", "text");
				if (obj.img_small != undefined && obj.img_small != "") {
					$(divt).attr("class", "textWithImg");
				}
				$(divt).html(obj.text);
				bottomDiv.appendChild(divt);
			}
			if (obj.source == "FACEB") {
				var a = document.createElement("a");
				a.setAttribute("class", "socialLinkage");
				var splitId = obj.id.split("_");
				a.setAttribute("href", "https://www.facebook.com/" + splitId[0] + "/posts/" + splitId[1]);
				a.setAttribute("target", "_blank");
				a.appendChild(topDiv);
				a.appendChild(bottomDiv);
				li.appendChild(a);
			} else if (obj.source = "INSTA") {
				var a = document.createElement("a");
				a.setAttribute("class", "socialLinkage");
				var splitId = obj.id.split("_");
				a.setAttribute("href", obj.link);
				a.setAttribute("target", "_blank");
				a.appendChild(topDiv);
				a.appendChild(bottomDiv);
				li.appendChild(a);
			} else {
				li.appendChild(topDiv);
				li.appendChild(bottomDiv);
			}
			//		//console.log($(li).html());
			return li;
		}
	},
	"info" : function(obj) {

		/*if(obj.source == "TWTTR"){
		var insLI = document.createElement("div");
		$(insLI).attr("class","openedTweet");
		$(insLI).attr("data-rel-hashtag", obj.hashtag.replace(/#/g, ""));
		$(insLI).attr("data-timestamp", obj.time);
		$(insLI).attr("data-rel-source",obj.src);

		var li = document.createElement("blockquote");
		li.setAttribute("class","twitter-tweet");
		li.setAttribute("data-conversation","none");
		li.setAttribute("width","290px");
		var p = document.createElement("p");
		p.innerHTML = obj.text;
		li.appendChild(p);
		if(obj.name!=undefined){
		var inText = document.createTextNode("—"+ obj.name + " (@"+obj.user+")");
		}
		else{
		var inText = document.createTextNode("— @"+obj.user + " (@"+obj.user+")");
		}
		li.appendChild(inText);
		var link = document.createElement("a");
		link.setAttribute("href","https://twitter.com/"+obj.user+"/status/"+obj.id);
		//link.setAttribute("data-datetime",new Date(obj.time).format("yyyy-MM-dd h:mm:ss"));
		li.appendChild(link);
		var lText = document.createTextNode("");
		link.appendChild(lText);
		insLI.appendChild(li);
		return insLI;
		}*/

		//else if(obj.source!="TWITTR"){
		var li = document.createElement("div");
		$(li).attr("id", "infoBoxDisplay");
		$(li).attr("class", "infoBox");
		//		//console.log(JSON.stringify(obj));
		//		//console.log(obj.hashtag);
		if ( typeof obj.hashtag != "string") {
			obj.hashtag = "";
		}
		$(li).attr("data-rel-hashtag", obj.hashtag.toString().replace(/#/g, ""));
		$(li).attr("data-timestamp", obj.time);
		$(li).attr("data-rel-source", obj.src);
		var topDiv = document.createElement("div");
		topDiv.setAttribute("class", "topDiv");
		if (obj.imgURL != "") {
			var profImg = document.createElement("img");
			profImg.setAttribute("src", obj.userIMG);
			profImg.setAttribute("class", "profileImages");
			topDiv.appendChild(profImg);
			$(profImg).bind("error", function() {
				////console.log("sideBar" + obj.id);
				$(profImg).css("display", "none");
			})
		}

		////console.log(JSON.stringify(obj));
		if (obj.name != null) {
			var str = obj.name.replace(/(^\s+|\s+$)/g, ' ');
			;
		} else {
			var str = "";
		}
		////console.log(str);
		var splitString = [str.substr(0, str.indexOf(" ")), str.substr(str.indexOf(" ") + 1)];
		// "tocirah sneab"]
		var classes = ["firstName", "lastName"];
		var domDiv = document.createElement("div");
		domDiv.setAttribute("class", "nameContainer");
		for (var i = 0; i < splitString.length; i++) {
			var addDiv = document.createElement("p");
			addDiv.setAttribute("class", classes[i]);
			var addDivText = document.createTextNode(splitString[i].toUpperCase());
			addDiv.appendChild(addDivText);
			domDiv.appendChild(addDiv);

		}
		var namesDiv = document.createElement("div");
		namesDiv.setAttribute("class", "names");
		namesDiv.appendChild(domDiv);

		if (obj.source != "FACEB") {
			var userDiv = document.createElement("p");
			userDiv.setAttribute("class", "userNameTag");
			var userDivText = document.createTextNode("@" + obj.user);
			userDiv.appendChild(userDivText);
			namesDiv.appendChild(userDiv);
		}
		topDiv.appendChild(namesDiv);
		if (obj.source == "TWTTR") {
			var follow = document.createElement("a");
			follow.setAttribute("href", "https://twitter.com/" + obj.user);
			follow.setAttribute("class", "twitter-follow-button");
			//			follow.setAttribute("data-show-screen-name","false");
			follow.setAttribute("data-show-count", "false");
			var followText = document.createTextNode("Follow @" + obj.user);
			follow.appendChild(followText);
			topDiv.appendChild(follow);
		}
		var bottomDiv = document.createElement("div");
		bottomDiv.setAttribute("class", "bottomDiv");

		if (obj.img_small != undefined && obj.img_small != "") {
			var div = document.createElement("img");
			$(div).attr("class", "image");
			$(div).attr("src", obj.img_small);
			//"sideBar" + obj.id
			//div.attr("onerror",)
			//			tpht.setAttr(div, "onError", tpht.setAttr(div,"style","display:none;"));
			$(div).bind("error", function() {
				////console.log("sideBar" + obj.id);
				$(div).css("display", "none");
				$(div).parent().find(".textWithImg").first().attr("class", "text");
			})
			bottomDiv.appendChild(div);
		}

		if (obj.text != undefined) {
			var tdiv = document.createElement("div");
			$(tdiv).attr("class", "text");
			if (obj.img_small != undefined && obj.img_small != "") {
				$(tdiv).attr("class", "textWithImg");
			}
			$(tdiv).html(obj.text);
			bottomDiv.appendChild(tdiv);
		}
		if (obj.link != null && obj.link != "") {
			if (obj.source == "FACEB") {
				var a = document.createElement("a");
				a.setAttribute("class", "socialLinkage");
				var splitId = obj.id.split("_");
				a.setAttribute("href", "https://www.facebook.com/" + splitId[0] + "/posts/" + splitId[1]);
				a.setAttribute("target", "_blank");
				a.appendChild(topDiv);
				a.appendChild(bottomDiv);
				li.appendChild(a);
			} else if (obj.source == "INSTA") {
				var a = document.createElement("a");
				a.setAttribute("class", "socialLinkage");
				var splitId = obj.id.split("_");
				a.setAttribute("href", obj.link);
				a.setAttribute("target", "_blank");
				a.appendChild(topDiv);
				a.appendChild(bottomDiv);
				li.appendChild(a);
			} else if (obj.source == "TWTTR") {
				var a = document.createElement("a");
				a.setAttribute("class", "socialLinkage");
				//var splitId = obj.id.split("_");
				a.setAttribute("href", "https://twitter.com/" + obj.user + "/status/" + obj.id);
				a.setAttribute("target", "_blank");
				a.appendChild(topDiv);
				a.appendChild(bottomDiv);
				li.appendChild(a);
			}
		} else {
			li.appendChild(topDiv);
			li.appendChild(bottomDiv);
		}
		//		//console.log($(li).html());
		return li;
		//}
	}
}
var sse = {
	"longtroll" : function(input) {
		//console.log(input);
		var ins = JSON.parse(input);
		if (ins.hasOwnProperty("tag")) {
			var timeToBeat = 0;
			//console.log(tags.tagData);

			var newPushArr = new Array();
			for (var inputs in ins.answers) {
				if (tags.tagData.hasOwnProperty(ins.answers[inputs].hashtag)) {
					if (ins.answers[inputs].time * 1000 > tags.tagData[ins.answers[inputs].hashtag].timestamp) {
						tags.tagData[ins.answers[inputs].hashtag].timestamp = ins.answers[inputs].time * 1000;
						newPushArr.push(ins.answers[inputs]);
					}
				} else {
					tags.tagData[ins.answers[inputs].hashtag] = {
						"answers" : new Array(),
						"tag" : ins.answers[inputs].hashtag,
						"timestamp" : 0
					}
					newPushArr.push(ins.answers[inputs]);
				}
				////console.log(ins.answers[inputs]);
				//check time against last updated
			}
			//			//console.log(newPushArr);
			if (newPushArr.length > 0) {
				tags.renew(newPushArr);
			}
		} else {
			////console.log(input.data);
		}

	}
}

var general = {
	"refreshLabelSize" : function() {
		if ( typeof config.sizesOfLabels != "function") {
			//console.log("WORKING!!!");
			//console.log(config.sizesOfLabels);
			var max = 0;
			var maxJSON = 0;
			for (var i in config.bandSizes) {
				if (config.bandSizes.hasOwnProperty(i)) {
					if (parseInt(i, 10) > maxJSON) {
						maxJSON = parseInt(i, 10);
					}
				}
			}
			for (var i in config.sizesOfLabels) {
				if (config.sizesOfLabels.hasOwnProperty(i)) {
					//console.log(i + "," + config.sizesOfLabels[i]);
					for (var q in config.bandSizes) {
						if (config.bandSizes.hasOwnProperty(q)) {
							//console.log((config.sizesOfLabels[i] - q) + "," + q);
							if (config.sizesOfLabels[i] - q < q || config.sizesOfLabels[i] - q < 0) {
								config.sizesOfLabels[i] = q;
								break;
							}
						}
					}
				}
				if (!config.bandSizes.hasOwnProperty(config.sizesOfLabels[i])) {
					config.sizesOfLabels[i] = maxJSON.toString();
				}
			}
			////console.log(max);
			//console.log(config.sizesOfLabels);
		}
		else {
			general.refreshLabelSize();
		}
	},
	"customModal" : function(opts) {
		/*
		{
		"type" : "dialog",
		"message" : "<strong>Warning!</strong><p>The file is already being edited and has been since " + new Date(parseInt(response.data.timestamp, 10)) + "</p>" + "<p>If you are sure you want to edit anyways, click \"Confirm\".</p>",
		"confirm" : function() {
		commandSend("force", "post", function() {
		loadTagJSON("get", -1);
		});
		}
		});
		*/
		//		//console.log(opts);
		var content = document.getElementById("modalInside");
		var textIn = document.createElement("div");
		$(textIn).attr("id", "modalText");
		if (opts.type == "dialog") {
			//			//console.log(opts.message);
			textIn.innerHTML = opts.message;
			content.appendChild(textIn);
			var confirm = document.createElement("a");
			$(confirm).attr("id", "modalConfirm");
			var confText = document.createTextNode("CONFIRM");
			confirm.appendChild(confText);
			confirm.onclick = function() {
				opts.confirm();
			}
			var decline = document.createElement("a");
			$(decline).attr("id", "modalDeny");
			var inText = document.createTextNode("DISMISS");
			decline.appendChild(inText);
			decline.onclick = function() {
				$("#modalDialogue").slideUp(400, function() {
					$("#modalInside").html("")
				});
			}
			content.appendChild(confirm);
			content.appendChild(decline);

		}
		if (opts.type != "dialog") {
			textIn.innerHTML = opts.message;
			content.appendChild(textIn);

			var decline = document.createElement("a");
			$(decline).attr("id", "modalDenyButton");
			var decText = document.createTextNode("DISMISS");
			decline.appendChild(decText);
			decline.onclick = function() {
				$("#modalDialogue").slideUp(400, function() {
					$("#modalInside").html("")
				});
			}
			content.appendChild(decline);
		}
		$("#modalDialogue").slideDown();
	},
	"updateSinglePoint" : function() {
		var extraString = "twitButton.html#type=hashtag&count=none";
		if (tags.inBound.length > 0) {
			var center = maps.map.getCenter().toString().replace(/[()]/g, "").split(",");
			//console.log(center);
			var dist = [999, ""];
			for (var i in tags.inBound) {
				if (tags.inBound.hasOwnProperty(i)) {
					if (tpht.distanceBetweenPoints([parseFloat(center[0]), parseFloat(center[1])], [tags.locations[tags.inBound[i]].latitude, tags.locations[tags.inBound[i]].longitude]) < dist[0]) {
						dist[1] = "#" + tags.inBound[i];
						dist[0] = tpht.distanceBetweenPoints([parseFloat(center[0]), parseFloat(center[1])], [tags.locations[tags.inBound[i]].latitude, tags.locations[tags.inBound[i]].longitude]);
					}//latitude, longitude
				}
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
		 //console.log(tags.campaign[i]);
		 extraString+=tags.campaign[i].replace(/#/g,"");
		 }
		 if(tags.inBound.length == 1){
		 if(tags.campaign.length>0){
		 extraString+="%2C";
		 }
		 extraString+=tags.inBound[0];
		 }*/
		var tweet = document.getElementById("twitterButton");
		extraString = extraString + "&hashtags=" + tags.singleTag.replace(/#/g, "");
		$(tweet).attr("src", extraString);
		tweet.contentWindow.location.reload();
	}
}
