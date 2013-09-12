var down = require("./download");
var db = require("./db.js");
var twitter = require('ntwitter');
var fs = down.fs;
var credentials = require('./configurables.js');
var t;
db.connection.connect();
var taggeth = JSON.parse(fs.readFileSync("tags.json"));
credentials.tags = taggeth.data;
//console.log(credentials.tags.campaign);
//console.log("thing");
//console.log( typeof (t));
t = new twitter({
	consumer_key : credentials.credentials.consumer_key,
	consumer_secret : credentials.credentials.consumer_secret,
	access_token_key : credentials.credentials.access_token_key,
	access_token_secret : credentials.credentials.access_token_secret
});
//db order //screen_name,id_str,if(.coordinates!=null, .coordinates.coordinates[0] = lon,.coordinates.coordinates[1] = lat  ), TWITTR, text, created_at, .entities.media[0].media_url,
startStream();
function startStream() {
	console.log("streaming");
	console.log(credentials.tags.location);
	t.stream('statuses/filter', {
		//track : credentials.tags.campaign
		track : credentials.tags.location
	}, function(stream) {
		stream.on('data', function(tweet,err) {
			console.log(err);
			console.log(tweet);
			if(tweet.hasOwnProperty("disconnect")){
				startStream();
				}else{
			if (filterForHash(tweet.text) != false) {
				var send = db.sendNew();
				/*
				`id` VARCHAR(30) NOT NULL ,
				`user` VARCHAR(45) NULL ,
				`time` TIMESTAMP NOT NULL ,
				`lat` DECIMAL(9,6) NULL ,
				`lon` DECIMAL(9,6) NULL ,
				`text` TEXT NULL ,
				`img_small` VARCHAR(200) NULL ,
				`img_med` VARCHAR(200) NULL ,
				`img_large` VARCHAR(200) NULL ,
				`source` VARCHAR(5) NULL ,
				* */
				//console.log(tweet.bounding_box);
				send.id = tweet.id_str;
				send.user = tweet.user.screen_name;
				send.name = tweet.user.name;
				send.userIMG = tweet.user.profile_image_url;
				send.time = db.formatDate(new Date(tweet.created_at));
				send.link = "https://twitter.com/"+send.user+"/statuses/"+send.id
				send.text = tweet.text;
				send.source = "TWTTR";
				send.hashtag = filterForHash(tweet.text);
				if (tweet.coordinates != null) {
					send.lat = tweet.coordinates.coordinates[1];
					send.lon = tweet.coordinates.coordinates[0];
				}
				if (tweet.entities.hasOwnProperty("media")) {
					if (tweet.entities.media.length > 0) {
						send.img_small = tweet.entities.media[0].media_url;
						send.img_med = tweet.entities.media[0].media_url;
						send.img_large = tweet.entities.media[0].media_url;
					}
				}
				//console.log(send);
				if (send.hashtag != "") {
					db.connection.query('INSERT INTO content SET ? ON DUPLICATE KEY UPDATE hashtag = ?, id = ?, text = ?, user = ?,name = ?, userIMG = ?, time = ?, link = ?, img_large = ?, img_med = ?, img_small = ?, lat = ?, lon = ?', [send, send.hashtag, send.id, send.text, send.user, send.name, send.userIMG, send.time, send.link, send.img_large, send.img_med, send.img_small, send.lat, send.lon], function(err, result) {
						if (err != null) {
							//					console.log(err);
							console.log(result);
						}
					});
				}
			}
		}
		});
	});

}

function filterForHash(input) {
	//console.log(input);
	var arr = credentials.tags.location;
	for (var i in arr) {
		console.log(arr[i]);
		if (input.toLowerCase().indexOf(arr[i].toLowerCase()) > -1) {
			return (arr[i].substring(1, arr[i].length));
		}
	}
	return "";
}
