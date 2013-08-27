var tags = [[],[]];
var newStuff = [[], []];
//0 is campaign name, 1 is location.
// to add another group, add array to newStuff, take care of extra index throughout code starting from loading. Including saving.
var divNames = ["render", "location"];
var divSelected = "location";
window.onload = function() {
	commandSend("start", "post", function(response) {
		console.log(response);
		//loadTagJSON();
		if (response.response == true) {
			console.log(response.data.timestamp);
			renderModal({
				"type" : "dialog",
				"message" : "<strong>Warning!</strong><p>The file is already being edited and has been since " + new Date(parseInt(response.data.timestamp, 10)) + "</p>" + "<p>If you are sure you want to edit anyways, click \"Confirm\".</p>",
				"confirm" : function() {
					commandSend("force", "post", function() {
						loadTagJSON("get", -1);
					});
				}
			});
		} else {
			loadTagJSON("get", -1);
		}
	});
	/*commandSend("force", "post", function() {
	 loadTagJSON("get");
	 });*/
}
window.onbeforeunload = function() {
	commandSend("end", "post", function() {
	});
}
document.getElementById("JS-camp").onclick = function() {
	document.getElementById("JS-camp").className = "btn btn-small btn-info";
	document.getElementById("JS-loc").className = "btn btn-small";
	document.getElementById("location").style.display = "none";
	document.getElementById("render").style.display = "block";
	divSelected = "render";
}
document.getElementById("JS-loc").onclick = function() {
	document.getElementById("JS-camp").className = "btn btn-small";
	document.getElementById("JS-loc").className = "btn btn-small btn-info";
	document.getElementById("location").style.display = "block";
	document.getElementById("render").style.display = "none";
	divSelected = "location";
}

document.getElementById("addStuff").onclick = function() {
	var found = false;
	for (var i in newStuff[0]) {
		console.log("#" + document.getElementById("newHash").value.toLowerCase() + "," + newStuff[0][i].toLowerCase());
		if ("#" + document.getElementById("newHash").value.toLowerCase() == newStuff[0][i].toLowerCase()) {
			found = true;
			break;
		}
	}
	if (found == true || document.getElementById("newHash").value.length == 0) {
		document.getElementById("JS-AlreadyAdded").style.display = "block";
	} else {
		document.getElementById("JS-AlreadyAdded").style.display = "none";
		renderSingle(document.getElementById("newHash").value, 0);
		checkParity(0);
	}
}
document.getElementById("LaddStuff").onclick = function() {
	var found = false;
	for (var i in newStuff[1]) {
		console.log("#" + document.getElementById("LnewHash").value.toLowerCase() + "," + newStuff[1][i].toLowerCase());
		if ("#" + document.getElementById("LnewHash").value.toLowerCase() == newStuff[1][i].toLowerCase()) {
			found = true;
			break;
		}
	}
	if (found == true || document.getElementById("LnewHash").value.length == 0) {
		document.getElementById("JS-LAlreadyAdded").style.display = "block";
	} else {
		document.getElementById("JS-LAlreadyAdded").style.display = "none";
		renderSingle(document.getElementById("LnewHash").value, 1);
		checkParity(1);
	}
}
document.getElementById("save").onclick = function() {
	document.getElementById("save").innerHTML = "saving";
	loadTagJSON("post", 0);
}
document.getElementById("Lsave").onclick = function() {
	document.getElementById("Lsave").innerHTML = "saving";
	loadTagJSON("post", 1);
}
var renderModal = function(opts) {
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
			document.getElementById("modalDialogue").style.display = "none";
			document.getElementById("modalInside").innerHTML = "";
		}
		content.appendChild(confirm);
	}
	content.appendChild(textIn);
	document.getElementById("modalDialogue").style.display = "block";

}
var commandSend = function(input, type, callback) {
	var xhReq = new XMLHttpRequest();
	xhReq.open("POST", "http://localhost:65/asosUniMap/tagAdmin/backend/verify.php", true);
	xhReq.onreadystatechange = function() {
		console.log(xhReq.status);
		if (xhReq.readyState != 4) {
			return;
			console.log("An error dispatching command " + input + " occurred");
		}
		var serverResponse = xhReq.responseText;
		callback(JSON.parse(serverResponse));
	};
	if (type == "post") {
		xhReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	}
	xhReq.send("command=" + input);
}
function checkParity(appendIndex) {

	console.log(tags[appendIndex]);
	console.log(newStuff[appendIndex]);

	var lookup = {};
	var found = 0;
	for (var j in newStuff[appendIndex]) {
		lookup[newStuff[appendIndex][j]] = newStuff[appendIndex][j];
	}

	for (var i in tags[appendIndex]) {
		if ( typeof lookup[tags[appendIndex][i]] != 'undefined') {
			found++;
		}
	}
	if (found == tags[appendIndex].length - 1 || tags[appendIndex].length != newStuff[appendIndex].length) {
		if (appendIndex == 0) {
			document.getElementById("save").innerHTML = "save";
			document.getElementById("save").style.display = "block";
		}
		if (appendIndex == 1) {
			document.getElementById("Lsave").innerHTML = "save";
			document.getElementById("Lsave").style.display = "block";
		}
	} else {
		if (appendIndex == 0) {
			document.getElementById("save").style.display = "none";
			document.getElementById("newHash").value = "";
		}
		if(appendIndex == 1){
			document.getElementById("Lsave").style.display = "none";
			document.getElementById("LnewHash").value = "";
		}
	}
}

function renderSingle(ins, appendIndex) {
	var input = document.createElement("li");
	input.className = "hashtag";
	input.id = ins;
	var extras = document.createElement("div");
	extras.className = "hash";
	extras.innerText = "#";
	input.appendChild(extras);
	var extras = document.createElement("div");
	extras.className = "hashlesshash";
	extras.innerText = ins;
	input.appendChild(extras);
	if(appendIndex == 1){
		var lats = document.createElement("label");
		lats.textContent = "Lat: ";
		lats.setAttribute("class","hashLabel");
		lats.setAttribute("for",ins+"lat");
		input.appendChild(lats);
		var lats = document.createElement("input");
		lats.setAttribute("type","number");
		lats.setAttribute("step","any");
		lats.setAttribute("min",-90);
		lats.setAttribute("max",90);
		lats.setAttribute("class","hashCoord");
		lats.setAttribute("id",ins+"lat");
		input.appendChild(lats);
		var lats = document.createElement("label");
		lats.textContent = "Lon: ";
		lats.setAttribute("class","hashLabel");
		lats.setAttribute("for",ins+"lon");
		input.appendChild(lats);
		var lats = document.createElement("input");
		lats.setAttribute("type","number");
		lats.setAttribute("step","any");
		lats.setAttribute("min",-180);
		lats.setAttribute("max",180);
		lats.setAttribute("class","hashCoord");
		lats.setAttribute("id",ins+"lon");
		input.appendChild(lats);
		var lats = document.createElement("label");
		lats.textContent = "Range: ";
		lats.setAttribute("class","hashRangeLabel");
		lats.setAttribute("for",ins+"range");
		input.appendChild(lats);
		var lats = document.createElement("input")
		lats.setAttribute("type","number");
		lats.setAttribute("step","any");
		lats.setAttribute("min",0);
		lats.setAttribute("id",ins+"range");
		lats.setAttribute("class","distRange");
		input.appendChild(lats);
		var lats = document.createElement("div");
		lats.setAttribute("class","coordDisplay");
		lats.setAttribute("id",ins+"coords");
		input.appendChild(lats);
	}
	var extras = document.createElement("input");
	extras.setAttribute("type", "button");
	extras.className = "btn btn-danger";
	extras.setAttribute("value", "✗");
	extras.onclick = function() {
		this.parentNode.parentNode.removeChild(this.parentNode);
		//TESTING divNames
		console.log(newStuff[divNames.indexOf(divSelected)].indexOf("#" + ins));
		console.log(newStuff[divNames.indexOf(divSelected)]);
		newStuff[divNames.indexOf(divSelected)].splice(newStuff[divNames.indexOf(divSelected)].indexOf("#" + ins), 1);
		console.log(newStuff[divNames.indexOf(divSelected)]);
		checkParity(divNames.indexOf(divSelected));
	}
	input.appendChild(extras);
	if (appendIndex == 0) {
		document.getElementById("hashtags").appendChild(input);
		document.getElementById("newHash").value = "";
	}
	if (appendIndex == 1) {
		document.getElementById("Lhashtags").appendChild(input);
		document.getElementById("LnewHash").value = "";
	}
	console.log("pushing to new");
	console.log(appendIndex);
	console.log(newStuff[appendIndex]);
	newStuff[appendIndex].push("#" + ins);
}

var loadTagJSON = function(type, appendIndex) {
	if (type == "get") {
		var xhReq = new XMLHttpRequest();
		xhReq.open("POST", "http://localhost:65/asosUniMap/node/tags.json", true);
		xhReq.onreadystatechange = function() {
			console.log(xhReq.status);
			if (xhReq.readyState != 4) {
				console.log("An error dispatching command occurred with status code " + xhReq.readyState);
				return;
			}
			var serverResponse = xhReq.responseText;
			tags[0] = (JSON.parse(serverResponse)).data.campaign;
			tags[1] = (JSON.parse(serverResponse)).data.location;
			console.log(tags);
			for (var i in tags[0]) {
				renderSingle(tags[0][i].substring(1, tags[0][i].length), 0);
			}
			for (var i in tags[1]) {
				renderSingle(tags[1][i].substring(1, tags[1][i].length), 1);
			}
		};
		xhReq.send();
	}
	if (type == "post") {
		var xhReq = new XMLHttpRequest();
		xhReq.open("POST", "http://localhost:65/asosUniMap/tagAdmin/backend/writer.php", true);
		xhReq.onreadystatechange = function() {
			console.log(xhReq.status);
			if (xhReq.readyState != 4) {
				return;
				console.log("An error dispatching command " + input + " occurred");
			}
			var serverResponse = xhReq.responseText;
			tags[appendIndex] = uniqueArr(newStuff[appendIndex]);
			console.log(tags[appendIndex]);
			//console.log(newStuff);
			console.log(serverResponse);
			console.log("post request received");
			checkParity(appendIndex);
		};
		xhReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		var thing = [];
		for (var all in newStuff[appendIndex]) {
			thing.push(newStuff[appendIndex][all].substring(1, newStuff[appendIndex][all].length));
		}
		if (appendIndex == 0) {
			console.log("campaign=" + thing);
			xhReq.send("campaign=" + thing);
		}
		if (appendIndex == 1) {
			console.log("location=" + thing);
			xhReq.send("location=" + thing);
		}

	}
}
function uniqueArr(arr) {
	var distinctArr = [];
	for (var zed in arr) {
		if (distinctArr.indexOf(arr[zed]) < 0) {
			distinctArr.push(arr[zed]);
		}
	}
	return distinctArr;
}
