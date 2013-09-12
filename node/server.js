var PORT1 = 1337;
var PORT2 = 1338;

var http = require("http");
var fs = require("fs");
var url = require("url");
var util = require("util");
var EventEmitter = require("events").EventEmitter;

var host = "127.0.0.1";
var port = 1337;
var db = require("./db.js");


var idents = [];
var setTimeoutVar = 10000;
db.connection.connect();

util.puts("Version: " + process.version);
util.puts("Starting server at http://localhost:" + PORT1);

process.on("uncaughtException", function (e) {
  try {
    util.puts("Caught exception: " + e + " " + (typeof e === "object" ? e.stack : ""));
  } catch (ignore) {
  }
});

var emitter = new EventEmitter();
var history = [];
var heartbeatTimeout = 9000;
var firstId = Number(new Date());

setInterval(function () {
  emitter.emit("message");
}, heartbeatTimeout / 2);

function eventStream(request, response) {
  var parsedURL = url.parse(request.url, true);
  var lastEventId = Number(request.headers["last-event-id"]) || Number(parsedURL.query.lastEventId) || 0;

  function sendMessages() {
    lastEventId = Math.max(lastEventId, firstId);
    while (lastEventId - firstId < history.length) {
      response.write("id: " + (lastEventId + 1) + "\n" + "data: " + (history[lastEventId - firstId]).replace(/[\r\n\x00]/g, "\ndata: ") + "\n\n");
      lastEventId += 1;
    }
    response.write(":\n");
  //history = [];
  }

  response.on("close", function () {
    emitter.removeListener("message", sendMessages);
    response.end();
  });

  response.socket.setTimeout(0); // see http://contourline.wordpress.com/2011/03/30/preventing-server-timeout-in-node-js/

  var estest = parsedURL.query.estest;
  if (estest) {
    var i = estest.indexOf("\n\n");
    var headers = {};
    estest.slice(0, i).replace(/[^\n]*/g, function (line) {
      var header = line.split(":");
      if (header[0].trim() !== "") {
        headers[header[0].trim()] = header.slice(1).join(":").trim();
      }
    });
    response.writeHead(200, headers);
    var body = estest.slice(i + 2);
    body = body.replace(/<random\(\)>/g, function () {
      return Math.random();
    });
    body = body.replace(/<lastEventId\((\d+)\)>/g, function (p, increment) {
      return lastEventId + Number(increment);
    });
    body = body.split(/<delay\((\d+)\)>/);
    i = -1;
    var next = function () {
      ++i;
      if (body[i] !== "") {
        response.write(body[i]);
      }
      if (++i < body.length) {
        setTimeout(next, Number(body[i]));
      } else {
        response.end();
      }
    };
    next();
    return;
  }

  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "*"
  });

  response.write(":" + Array(2049).join(" ") + "\n"); // 2kB padding for IE
  response.write("retry: 1000\n");
  response.write("heartbeatTimeout: " + heartbeatTimeout + "\n");//!

  emitter.addListener("message", sendMessages);
  emitter.setMaxListeners(0);
  sendMessages();
}

function onRequest(request, response) {
  var parsedURL = url.parse(request.url, true);
  var query = parsedURL.query;
  var pathname = parsedURL.pathname;
  var time = "";
  var data = "";

  if (query.message) {
    time = new Date();
    data = query.message;
    response.writeHead(200, {
      "Content-Type": "text/plain"
    });
    response.end(String(firstId + history.push(data)));
    emitter.emit("message");
    return;
  }

  if (pathname === "/events") {
    eventStream(request, response);
  } else {
    var files = [
      "/example.html",
      "/nodechat.css",
      "/eventsource.js",
      "/nodechat.js",
      "/tests.html",
      "/qunit.css",
      "/qunit.js",
      "/tests.js"
    ];
    if (files.indexOf(pathname) === -1) {
      pathname = files[0];
    }
    fs.stat(__dirname + pathname, function (error, stats) {
      if (error) {
        response.writeHead(404);
        response.end();
      } else {
        var mtime = Date.parse(request.headers["if-modified-since"]) || 0;
        if (stats.mtime <= mtime) {
          response.writeHead(304);
          response.end();
        } else {
          var raw = fs.createReadStream(__dirname + pathname);
          response.writeHead(200, {
            "Content-Type": (pathname.indexOf(".js") !== -1 ? "text/javascript" : (pathname.indexOf(".css") !== -1 ? "text/css" : "text/html")),
            "Last-Modified": stats.mtime
          });
          raw.pipe(response);
        }
      }
    });
  }  
}

http.createServer(onRequest).listen(PORT1);
http.createServer(onRequest).listen(PORT2);

writEm();

function writEm() {
	console.log("start");
	var sizeArr = {};
	fs.readFile('tags.json','utf-8', function(err, result) {
		if (err) {
			console.log(err);
			writEm();
		} else {
			console.log(result);
			var results = [];
			var res = JSON.parse(result).data.location;
			for (var zedsdead in res) {
				if (res[zedsdead].length > 0) {
					results.push(res[zedsdead].replace(/#/g,""));
				}
			}
			console.log(results);
			asyncLoop(results.length, function(loop, i) {
				console.log(results[i]);
				var prepare = "SELECT id,user,name,userIMG, UNIX_TIMESTAMP(time) as time,lat,lon,text,img_small,img_med,img_large,source,hashtag,link FROM asosUniMap.content WHERE hashtag = '" + results[i] + "'";
				db.connection.query(prepare, function(err, result) {
					console.log(result.length);
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
						writeArr.length = result.length;
						writeArr.answers = result;
						var thing;
						
						sizeArr[results[i]] = result.length;
						
						try {
							thing = JSON.parse(fs.readFileSync("jsons/" + results[i] + ".json", 'utf-8')).answers;
						} catch(e) {
							thing = "";
						}
						if (JSON.parse(JSON.stringify(writeArr.answers)).length == 0 && thing.length == 0||testForEquality(thing, JSON.parse(JSON.stringify(writeArr.answers),'utf-8')) == false) {
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
										emitter.emit("message");
										history.push(JSON.stringify(writeArr));
										
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
				fs.writeFile("jsons/pre-tags.json", JSON.stringify(sizeArr), function(err) {
								if (err) {
									console.log("Error occurred writing sizes at " + new Date().getTime());
								} else {
									fs.rename("jsons/pre-tags.json", "jsons/TAGSSIZES.json",
									function() {
									});
								}
							});
				setTimeout(writEm, setTimeoutVar)
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