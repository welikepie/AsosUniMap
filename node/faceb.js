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

var req = https.request({
	host : "graph.facebook.com",
	path : "/oauth/access_token?grant_type=client_credentials&client_id=" + credentials.credentials.facebook_app_id + "&client_secret=" + credentials.credentials.facebook_app_secret
}, function(res) {
	res.on('data', function(d) {
		creds = d.toString().split("=");
		if (creds[0] == "access_token") {
			creds = creds[1];
			console.log(creds);
			getFacebook(creds);
		} else {
			console.log("ERROR GETTING TOKEN");
		}
	});
});
req.end();
req.on('error', function(e) {
	getAccessToken();
	console.error(e);
});

//}
function getFacebook(input) {
	console.log(input);
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
	for (var i in credentials.tags) {

		fb.search({
			q : credentials.tags[i].substring(1, credentials.tags[i].length),
			type : "post",
			limit : 500,
			access_token : creds
		}, function(err, res) {

			//console.log(res);
			var resUrl = res.paging.previous.split("?")[1].split("&");
			var localTag = "";
			for (var j in resUrl) {
				if (resUrl[j].indexOf("q=") > -1) {
					localTag = "#" + resUrl[j].split("=")[1];
					localTag = resUrl[j].split("=")[1];
					console.log(localTag);
					break;
				}
			}
			for (var zed in res.data) {
				//console.log(res.data[zed]);
				if(res.data[zed].type == "photo"|| res.data[zed].type =="status"){
				console.log(res.data[zed]);
				if(res.data[zed].hasOwnProperty("message")){
				if (res.data[zed].message.indexOf(localTag) > -1) {
					var send = db.sendNew();
					send.hashtag = localTag;
					send.id = res.data[zed].id;
					send.text = res.data[zed].message;
					send.id = res.data[zed].id;
					send.user = res.data[zed].from.id;
					send.time = res.data[zed].created_time;
					if (res.data[zed].type == "photo") {
						console.log(res.data[zed]);
						send.img_large = res.data[zed].picture.substring(0, res.data[zed].picture.length - 5) + "b.jpg";
						send.img_med = res.data[zed].picture.substring(0, res.data[zed].picture.length - 5) + "a.jpg";
						send.img_small = res.data[zed].picture.substring(0, res.data[zed].picture.length - 5) + "s.jpg";
					}
					if (res.data[zed].hasOwnProperty("place")){
						send.lat = res.data[zed].place.location.latitude;
						send.lon = res.data[zed].place.location.longitude;
					}
					send.source = "FACEB";
						db.connection.query('INSERT INTO content SET ?', send, function(err, result) {
						  console.log(err+","+result);
						});
				}
				}
			}
			}
		});
	}
}
