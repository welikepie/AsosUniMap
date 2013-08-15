var tags = null;
var newStuff = [];

window.onload = function() {
	commandSend("start", "post", function(response) {
		console.log(response);
		loadTagJSON();
		if (response.response == true) {
			console.log(response.data.timestamp);
			renderModal({
				"type" : "dialog",
				"message" : "The file is already open and has been since " + new Date(parseInt(response.data.timestamp, 10)),
				"confirm" : function() {
					commandSend("force", "post", function() {
						loadTagJSON("get");
					});
				}
			});
		} else {
			loadTagJSON("get");
		}
	});
}
window.onbeforeunload = function() {
	commandSend("end", "post", function() {
	});
}

document.getElementById("addStuff").onclick = function() {
	//if()
	//console.log();
	renderSingle(document.getElementById("newHash").value);
	checkParity();
}
document.getElementById("save").onclick = function() {
	loadTagJSON("post");
}
var renderModal = function(opts) {
	console.log(opts);
	if (opts.type == "dialog") {
		console.log(opts.message);
	}
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
function checkParity() {
	
var lookup = {};
var found = 0;
 for (var j in newStuff) {
      lookup[newStuff[j]] = newStuff[j];
  }

  for (var i in tags) {
      if (typeof lookup[tags[i]] != 'undefined') {
          //alert('found ' + list1[i] + ' in both lists');
          //break;
          found++;
 } 
 }
 
	if(found == tags.length-1 || tags.length != newStuff.length){
	document.getElementById("save").style.display = "block";	
	}
	else{
	document.getElementById("save").style.display = "none";
	}
}

function renderSingle(ins) {
	/*<li class="hashtag">
	 <div class="hash">#</div><div class="hashlesshash">Testing</div>
	 <input type="button" class="btn btn-danger"value="&#10007">
	 </li>*/
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
	var extras = document.createElement("input");
	extras.setAttribute("type", "button");
	extras.className = "btn btn-danger";
	extras.setAttribute("value", "✗");
	extras.onclick = function() {
		this.parentNode.parentNode.removeChild(this.parentNode);
		newStuff.splice(newStuff.indexOf("#"+ins),1);
		checkParity();
	}
	input.appendChild(extras);
	document.getElementById("hashtags").appendChild(input);
	newStuff.push("#"+ins);
}

var loadTagJSON = function(type) {
	if (type == "get") {
		var xhReq = new XMLHttpRequest();
		xhReq.open("POST", "http://localhost:65/asosUniMap/node/tags.json", true);
		xhReq.onreadystatechange = function() {
			console.log(xhReq.status);
			if (xhReq.readyState != 4) {
				return;
				console.log("An error dispatching command " + input + " occurred");
			}
			var serverResponse = xhReq.responseText;
			tags = (JSON.parse(serverResponse)).data;
			console.log(tags);
			for (var i in tags) {
				renderSingle(tags[i].substring(1, tags[i].length));
			}
		};
		xhReq.send();
	}
	if (type == "post") {
		var xhReq = new XMLHttpRequest();//{"data":["#faith","#test"]} 
		xhReq.open("POST", "http://localhost:65/asosUniMap/tagAdmin/backend/writer.php", true);
		xhReq.onreadystatechange = function() {
			console.log(xhReq.status);
			if (xhReq.readyState != 4) {
				return;
				console.log("An error dispatching command " + input + " occurred");
			}
			var serverResponse = xhReq.responseText;
			tags = newStuff;
			console.log(tags);
			console.log(newStuff);
			checkParity();
		};
		xhReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		var thing = [];
		
		for(var all in newStuff){
			
			thing.push(newStuff[all].substring(1,newStuff[all].length));
		}
		console.log("data="+thing);
		xhReq.send("data="+thing);
	}
}
