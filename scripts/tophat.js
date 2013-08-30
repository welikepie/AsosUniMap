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
	"pythagoras" : function(num, num1) {
		return Math.sqrt(Math.pow(num, 2) + Math.pow(num1, 2));
	},
	"ping" : function() {
		console.log("ping!");
	},
	"getById" : function(id) {
		return document.getElementById(id);
	},

	"easyXML" : function(type, url, args, callback) {
		if (type.toLowerCase() == "get") {
			var xhReq = new XMLHttpRequest();
			xhReq.open("GET", url, true);
			xhReq.onreadystatechange = function() {
				//console.log(xhReq.status);
				if (xhReq.status != 200 && (xhReq.status <= 300 && xhReq.status >= 400)) {
					callback(JSON.stringify({
						"error" : {
							"statusCode" : xhReq.status
						},
						"responseText" : xhReq.responseText
					}));
				}
				if (xhReq.readyState == 4) {
					var serverResponse = xhReq.responseText;
					callback(serverResponse);
				}

			};
			xhReq.send();
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
	"compareBoxesCircular" : function(r1, r2) {
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

		if (parent.firstChild!=undefined || parent.firstChild!=null) {
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
