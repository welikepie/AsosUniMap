var tpht = {
	"haversine" : function(lat, lon, rad) {
		var R = 6371;
		// earth radius in km
		var radius = rad;
		// km

		var x1 = lon - Math.toDegrees(radius / R / Math.cos(Math.toRadians(lat)));
		var x2 = lon + Math.toDegrees(radius / R / Math.cos(Math.toRadians(lat)));
		var y1 = lat + Math.toDegrees(radius / R);
		var y2 = lat - Math.toDegrees(radius / R);
		//spits out array of four things. left,top,right,bottom co-ordinates.

		return [x1, y1, x2, y2];
	},
	"distanceBetweenPoints" : function(obj1,obj2){
		return tpht.pythagoras((obj1[0]-obj2[0]),(obj1[1]-obj2[1]));
	},
	"pythagoras" : function(num, num1) {
		return Math.sqrt(Math.pow(num, 2) + Math.pow(num1, 2));
	},
	"ping" : function() {
		console.log("ping!");
	},
	"getById" : function(id) {
		return document.getElementById(id);
	},
	"partInViewport" : function(el){
		  var top = el.offsetTop;
		  var left = el.offsetLeft;
		  var width = el.offsetWidth;
		  var height = el.offsetHeight;
		
		  while(el.offsetParent) {
		    el = el.offsetParent;
		    top += el.offsetTop;
		    left += el.offsetLeft;
		  }
		
		  return (
		    top < (window.pageYOffset + window.innerHeight) &&
		    left < (window.pageXOffset + window.innerWidth) &&
		    (top + height) > window.pageYOffset &&
		    (left + width) > window.pageXOffset
		  );
		
	},
	"debounce" : function(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
},
	"allInViewport" : function(el){
		  var top = el.offsetTop;
		  var left = el.offsetLeft;
		  var width = el.offsetWidth;
		  var height = el.offsetHeight;
		
		  while(el.offsetParent) {
		    el = el.offsetParent;
		    top += el.offsetTop;
		    left += el.offsetLeft;
		  }
		
		  return (
		    top >= window.pageYOffset &&
		    left >= window.pageXOffset &&
		    (top + height) <= (window.pageYOffset + window.innerHeight) &&
		    (left + width) <= (window.pageXOffset + window.innerWidth)
		  );
		
	},
	"renderModal" : function(opts) {
/*	{
				"type" : "dialog",
				"message" : "<strong>Warning!</strong><p>The file is already being edited and has been since " + new Date(parseInt(response.data.timestamp, 10)) + "</p>" + "<p>If you are sure you want to edit anyways, click \"Confirm\".</p>",
				"confirm" : function() {
					commandSend("force", "post", function() {
						loadTagJSON("get", -1);
					});
				}
			});*/
	//console.log(opts);
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
			document.getElementById("modalDialogue").style.display = "none";
			document.getElementById("modalInside").innerHTML = "";
		}
		content.appendChild(confirm);
	}
	content.appendChild(textIn);
	document.getElementById("modalDialogue").style.display = "block";

},
	"easyXML" : function(type, url, args, callback) {
		if (type.toLowerCase() == "get") {
			var xhReq = new XMLHttpRequest();
			try {
				var err = false;
				xhReq.open("GET", url, true);
				xhReq.onreadystatechange = function() {
					if (xhReq.readyState == 4) {
						if (xhReq.status != 200) {
							err = true;
							callback(JSON.stringify({
								"error" : {
									"statusCode" : xhReq.status
								},
								"responseText" : xhReq.responseText
							}));
							return false;
						} else {
							console.log("DONE");
							console.log(err);
							var serverResponse = xhReq.responseText;
							callback(serverResponse);
						}
					}

				};
				xhReq.send();
			} catch(e) {
				callback(JSON.stringify({
					"error" : {
						"statusCode" : 9001
					},
					"responseText" : e
				}));
			}
		}
		if (type.toLowerCase() == "post") {
			console.log("post");
			var xhReq = new XMLHttpRequest();
			xhReq.open("POST", url, true);
			xhReq.onreadystatechange = function() {
				console.log(xhReq.status);
				if (xhReq.readyState != 4) {
					console.log({
						"error" : xhReq.readyState
					});
					return {
						"error" : xhReq.readyState
					};
				}
				var serverResponse = xhReq.responseText;
				callback(serverResponse);
			};
			xhReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			console.log("argument=" + JSON.stringify(args));
			xhReq.send("argument=" + JSON.stringify(args));

		}

	},
	"getByClass" : function(input) {
		return document.getElementsByClassName(input);
	},
	"getByTag" : function(select) {
		return document.getElementsByTagName(select);
	},
	"singleCompareStringArr" : function(input, arr) {
		for (var i in arr) {
			for (var z in input) {
				console.log(arr[i].substring(1, arr[i].length).toLowerCase() + "," + input[z].toLowerCase());
				if (arr[i].substring(1, arr[i].length).toLowerCase() == input[z].toLowerCase()) {
					return (arr[i]);
				}
			}

		}
		return "";
	},
	"singleCompareArrToString" : function(input, arr) {
		for (var i in arr) {
			if (input.indexOf(arr[i]) > -1) {
				return (arr[i]);
			}
		}
		return "";
	},
	"lazyLoader" : function(tagLazyIsOn) {
		var img = document.getElementsByTagName("img");
		for (var zed in img) {
			console.log( typeof (img[zed]) == "object");
			if ( typeof (img[zed]) == "object") {
				console.log(img[zed]);
				if (img[zed].hasAttribute(tagLazyIsOn)) {
					console.log("in the air like you don't care");
				}
			}
		}
	},
	"asyncLoop" : function(iterations, func, callback) {
		var index = 0;
		var done = false;
		var loop = {
			current : index,
			next : function() {
				if (done) {
					return;
				}
				if (index < iterations) {
					index++;
					//console.log("INDEX"+index);
					this.current = index - 1;
					//console.log("CURRENT"+this.current);
					func(loop, this.current);
				} else {
					done = true;
					callback();
				}
			},
			iteration : function() {
				return index - 1;
				current = index;
			},
			broke : function() {
				done = true;
				callback();

			}
		};
		loop.next();
		return loop;
	},
	"centerBox" : function(left, top, right, bottom) {
		return [(left + right) / 2, (top + bottom) / 2];
	},
	"distance1" : function(x, y) {
		var result;
		if (x >= y) {
			result = x - y;
		} else {
			result = y - x;
		}
		return result;
	},
	"compareBoxesRect" : function(r1, r2) {
		var r1Cent = tpht.centerBox(r1[0], r1[1], r1[2], r1[3]);
		var r2Cent = tpht.centerBox(r2[0], r2[1], r2[2], r2[3]);
		var totalDistX = tpht.distance1(r1Cent[0], r2Cent[0]);
		var totalDistY = tpht.distance1(r1Cent[1], r2Cent[1]);
		var r1x = tpht.distance1(r1[0], r1[2]) / 2;
		var r1y = tpht.distance1(r1[1], r1[3]) / 2;
		var r2x = tpht.distance1(r2[0], r2[2]) / 2;
		var r2y = tpht.distance1(r2[1], r2[3]) / 2;
		if ((r1x + r2x) >= totalDistX && r1y + r2y >= totalDistY) {
			return true;
		} else {
			return false;
		}
	},
	"compareBoxesCircular" : function(r1, r2) {
		//		console.log(tpht.distance1(r1[0], r1[2]) / 2+","+tpht.distance1(r2[0], r2[2]));
		var r1Range = tpht.pythagoras(tpht.distance1(r1[0], r1[2]) / 2, tpht.distance1(r1[1], r1[3]) / 2);
		var r2Range = tpht.pythagoras(tpht.distance1(r2[0], r2[2]) / 2, tpht.distance1(r2[1], r2[3]) / 2);
		var touse;
		if (r1Range > r2Range) {
			touse = r1Range;
		} else {
			touse = r2Range;
		}
		var r1Pyth = tpht.centerBox(r1[0], r1[1], r1[2], r1[3]);
		var r2Pyth = tpht.centerBox(r2[0], r2[1], r2[2], r2[3]);
		console.log("box:");
		console.log(r1);
		console.log(r1Range);
		console.log(r1Pyth);

		console.log("area:");
		console.log(r2);
		console.log(r2Range);
		console.log(r2Pyth);
		console.log("---------------------");
		console.log(tpht.distance1(r1Pyth[0], r2Pyth[0]));
		console.log(tpht.distance1(r1Pyth[1], r2Pyth[1]));
		console.log("=========");
		console.log(tpht.pythagoras(tpht.distance1(r1Pyth[0], r2Pyth[0]), tpht.distance1(r1Pyth[1], r2Pyth[1])));
		console.log(touse);
		return tpht.pythagoras(tpht.distance1(r1Pyth[0], r2Pyth[0]), tpht.distance1(r1Pyth[1], r2Pyth[1])) < touse;

	},
	"createElement" : function(element) {
		return document.createElement(element);
	},
	"setId" : function(element, id) {
		element.setAttribute("id", id);
	},
	"setClass" : function(element, clas) {
		element.setAttribute("class", clas);
	},
	"setAttr" : function(element, attr, val) {
		element.setAttribute(attr, val);
	},
	"setText" : function(element, text) {
		element.innerText = text;
	},
	"innerHtml" : function(element, html) {
		element.innerHTML = html;
	},
	"appendFirst" : function(element, parent) {

		if (parent.firstChild != undefined || parent.firstChild != null) {
			parent.insertBefore(element, parent.firstChild);
		} else {
			parent.appendChild(element);
		}
	}
}

Math.toDegrees = function(angle) {
	return angle * (180 / Math.PI);
}

Math.toRadians = function(angle) {
	return angle * (Math.PI / 180);
}
