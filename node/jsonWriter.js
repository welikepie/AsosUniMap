var db = require("./db.js");
var fs = require("fs");

db.connection.connect();
writEm();
function writEm() {
	console.log("start");
	db.connection.query('SELECT DISTINCT hashtag FROM asosUniMap.content', function(err, result) {
		if (err) {
			writEm();
		} else {
			console.log(result);
			var results = [];
			for (var i in result) {
				if (result[i].hashtag.length > 0) {
					results.push(result[i].hashtag)
				};
			}
			asyncLoop(results.length, function(loop, i) {
				console.log(i);
				var prepare = "SELECT * FROM asosUniMap.content WHERE hashtag = '" + results[i] + "'";
				db.connection.query(prepare, function(err, result) {
					if (err) {
						console.log("Error occurred pulling " + results[i] + " at " + new Date().getTime());
					} else {
						var writeArr = {};
						writeArr.timestamp = new Date().getTime();
						writeArr.answers = result;
						var thing = JSON.stringify(JSON.parse(fs.readFileSync("jsons/"+results[i]+".json",'utf-8')).answers);
						//console.log(thing);
						if(JSON.stringify(writeArr.answers)!=thing){
							fs.writeFile("jsons/pre-" + results[i] + ".json", JSON.stringify(writeArr), function(err) {
								if (err) {
									console.log("Error occurred writing " + results[i] + " at " + new Date().getTime());
									//console.log(JSON.stringify(writeArr));
								} else {
									console.log("The file was saved!");
									fs.rename("jsons/pre-" + results[i] + ".json","jsons/" + results[i] + ".json",
									loop.next());
									
								}
							});
						}
						else{
							console.log("Skipped");
							loop.next();
						}
					}
				});
			}, writEm);

		}
	});
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
				setTimeout(callback,20000);
			}
		},
		iteration : function() {
			return index - 1;
			current = index;
		},
		broke : function() {
			done = true;
			setTimeout(callback,20000);

		}
	};
	loop.next();
	return loop;
}