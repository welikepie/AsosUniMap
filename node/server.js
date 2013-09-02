var fs = require("fs");
var http = require('http');
var sys = require('sys');
var events = require('events');
var db = require("./db.js");

var host = "127.0.0.1";
var port = 1337;
var express = require("express");
var app = express();
var idents = [];
var setTimeoutVar = 20000;
db.connection.connect();

app.use(app.router);
//use both root and other routes below
app.use(express.static(__dirname + "/../"));
//use static files in ROOT/public folder
app.get('/events', function(req, res) {
	idents.push({
		"request" : req,
		"response" : res
	});
	sendSSE(req, res);
});
function sendSSE(req, res) {
	res.writeHead(200, {
		'Content-Type' : 'text/event-stream',
		'Cache-Control' : 'no-cache',
		'Connection' : 'keep-alive'
	});
	constructSSE(res, new Date().getTime(), "{\"status\":\"Connected!\"}");
}

function broadSSE(req, res, data) {
	constructSSE(res, new Date().getTime(), data);
}

function constructSSE(res, id, data) {
	res.write('id: ' + id + '\n');
	res.write("data: " + data + '\n\n');
}

app.listen(port, host);
writEm(idents);

function writEm(listOfListeners) {
	console.log("start");
	db.connection.query('SELECT DISTINCT hashtag FROM asosUniMap.content', function(err, result) {
		if (err) {
			console.log(err);
			writEm(listOfListeners);
		} else {
			//console.log(result);
			var results = [];
			for (var zedsdead in result) {
				if (result[zedsdead].hashtag.length > 0) {
					results.push(result[zedsdead].hashtag);
				}
			}
			asyncLoop(results.length, function(loop, i) {
				console.log(results[i]);
				var prepare = "SELECT * FROM asosUniMap.content WHERE hashtag = '" + results[i] + "'";
				db.connection.query(prepare, function(err, result) {
					if (err) {
						console.log("Error occurred pulling " + results[i] + " at " + new Date().getTime());
						loop.next();
					} else {
						var writeArr = {};
						if (results[i].indexOf("#" > -1)) {
							results[i] = results[i].replace(/#/g, "");
						}
						writeArr.tag = results[i];
						writeArr.timestamp = new Date().getTime();
						writeArr.answers = result;
						var thing;
						try {
							thing = JSON.parse(fs.readFileSync("jsons/" + results[i] + ".json", 'utf-8')).answers;
						} catch(e) {
							thing = "";
						}
						//console.log(thing);
						if (testForEquality(thing, JSON.parse(JSON.stringify(writeArr.answers),'utf-8')) == false) {
							//console.log(writeArr);
							fs.writeFile("jsons/pre-" + results[i] + ".json", JSON.stringify(writeArr), function(err) {
								if (err) {
									console.log("Error occurred writing " + results[i] + " at " + new Date().getTime());
									//console.log(JSON.stringify(writeArr));
								} else {
									fs.rename("jsons/pre-" + results[i] + ".json", "jsons/" + results[i] + ".json",
									//idents.length, req,res
									
									function() {
										console.log("written");
										for (var zeds in listOfListeners) {
											broadSSE(listOfListeners[zeds].request, listOfListeners[zeds].response, JSON.stringify(writeArr));
										}
										loop.next();
									});

								}
							});
						} else {
							loop.next();
						}
					}
				});
			}, function() {
				setTimeout(writEm(listOfListeners), setTimeoutVar)
			});
		}
	});
}

function testForEquality(t1, t2) {
	//t1 == most recent file
	//t2 == pull from DB
	var id1 = [];
	var id2 = [];

	for (var z in t1) {
		id1.push(t1[z].id.replace(/\s/g,"").toString());
	}
	for (var z in t2) {
		id2.push(t2[z].id.replace(/\s/g,"").toString());
	}

	for (var zeds in id2) {
		var found = false;
		var id2id = id2[zeds];
		for (var why in id1) {
			var id1id = id1[why];
			if (id2id == id1id) {
				found = true;
			}
		}
		if (found == false) {
			console.log(id2[zeds]);
			return false;
		}
	}
	return true;
}

function asyncLoop(iterations, func, callback) {
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
				setTimeout(callback, setTimeoutVar);
			}
		},
		iteration : function() {
			return index - 1;
			current = index;
		},
		broke : function() {
			done = true;
			setTimeout(callback, 20000);

		}
	};
	loop.next();
	return loop;
}