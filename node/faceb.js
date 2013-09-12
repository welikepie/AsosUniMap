var down = require("./download");
var db = require("./db.js");
var fs = down.fs;
var http = down.http;
var https = require("https");
var credentials = require('./configurables.js');
var fb = require("fbgraph");
var express = require("express");
var creds = "";
db.connection.connect();
getAuthed();
//setInterval(function(){getAuthed()}, 30000);
function getBent(){
	//console.log("get bent!");
}
function getAuthed(){
	var req = https.request({
		host : "graph.facebook.com",
		path : "/oauth/access_token?grant_type=client_credentials&client_id=" + credentials.credentials.facebook_app_id + "&client_secret=" + credentials.credentials.facebook_app_secret
	}, function(res) {
		res.on('data', function(d) {
			creds = d.toString().split("=");
			if (creds[0] == "access_token") {
				creds = creds[1];
				//console.log(creds);
				getFacebook(creds);
			} else {
				//console.log("ERROR GETTING TOKEN");
			}
		});
	});
	req.end();
	req.on('error', function(e) {
		getAccessToken();
		console.error(e);
	});

}
function getFacebook(input){
	var dataStream = JSON.parse(fs.readFileSync("tags.json")).data; //commented out is for multiple tags
	credentials.tags = dataStream;
	//console.log(input);
	fb.setAccessToken(input);
	var options = {
		timeout : 3000,
		pool : {
			maxSockets : Infinity
		},
		headers : {
			connection : "keep-alive"
		}
	};
		//console.log(credentials.tags.campaign);
		//--	asyncLoop(credentials.tags.campaign.length,function(loop,i){
		asyncLoop(credentials.tags.location.length,function(loop,i){
				//console.log(i);
		//--		console.log(credentials.tags.campaign[i]);
		console.log(credentials.tags.location[i])
		fb.search({
			//--q : credentials.tags.campaign[i].substring(1, credentials.tags.campaign[i].length),
			q : credentials.tags.location[i].substring(1, credentials.tags.location[i].length),
			type : "post",
			limit : 500,
			access_token : creds
		}, function(err, res) {
			//console.log(err);
//--			var localTag = credentials.tags.campaign[i];
			var localTag = credentials.tags.location[i];
			if(res.data!=null){
			for (var zed in res.data) {
				//console.log(res.data[zed]);
				if (res.data[zed].type == "photo" || res.data[zed].type == "status") {
					if (res.data[zed].hasOwnProperty("message")) {
						if (res.data[zed].message.indexOf(localTag) > -1) {
							console.log(res.data[zed]);
							var send = db.sendNew();
							send.hashtag = filterForHash(res.data[zed].message,credentials.tags.location);
							send.id = res.data[zed].id;
							send.text = res.data[zed].message;
							send.user = res.data[zed].from.id;
							send.name = res.data[zed].from.name;
							send.userIMG = "http://graph.facebook.com/"+res.data[zed].from.id+"/picture"; 
							send.time = res.data[zed].created_time;
							var splitId = send.id.split("_");
							send.link = "https://www.facebook.com/"+splitId[0]+"/posts/"+splitId[1];
							if (res.data[zed].type == "photo") {
								//console.log(res.data[zed]);
								send.img_large = res.data[zed].picture.substring(0, res.data[zed].picture.length - 5) + "b.jpg";
								send.img_med = res.data[zed].picture.substring(0, res.data[zed].picture.length - 5) + "a.jpg";
								send.img_small = res.data[zed].picture.substring(0, res.data[zed].picture.length - 5) + "s.jpg";
							}
							if (res.data[zed].hasOwnProperty("place")) {
								if(res.data[zed].hasOwnProperty("place")!=null){
									send.lat = res.data[zed].place.location.latitude;
									send.lon = res.data[zed].place.location.longitude;
								}
							}
							send.source = "FACEB";
							//console.log(send.hashtag);
							if(send.hashtag != ""){
								//console.log(send);
								db.connection.query('INSERT INTO content SET ? ON DUPLICATE KEY UPDATE hashtag = ?, id = ?, text = ?, user = ?, name = ?, userIMG = ?, time = ?, link = ?, img_large = ?, img_med = ?, img_small = ?, lat = ?, lon = ?', [send, send.hashtag,send.id,send.text,send.user,send.name,send.userIMG,send.time,send.link, send.img_large,send.img_med,send.img_small,send.lat,send.lon], function(err, result) {
									if(err){
										console.log(err);
									}
									console.log(result);
									//console.log(err + "," + result);
						//			loop.next();
								});
							}
							
						}
					}
				}
			}
			}
			//console.log("NEXT");
			loop.next();
		});
	},function(){
		//console.log("done!");
		getAuthed();
	})
}

function filterForHash(input, arr){
	for(var i in arr){
		if(input.indexOf(arr[i])>-1){
			return (arr[i].substring(1,arr[i].length));
		}
	}
	return "";
}

function asyncLoop(iterations, func, callback) {
    var index = 0;
    var done = false;
    var loop = {
    	current: index,
        next: function() {
            if (done) {
                return;
            }
            if (index < iterations) {
                index++;
                //console.log("INDEX"+index);
                this.current = index-1;
                //console.log("CURRENT"+this.current);
                func(loop,this.current);
            } else {
                done = true;
                callback();
            }
        },
        iteration: function() {
            return index - 1;
            current = index;
        },
        broke: function() {
            done = true;
            callback();
        }
    };
    loop.next();
    return loop;
}