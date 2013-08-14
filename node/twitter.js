var down = require("./download");
var db = require("./db.js");
var twitter = require('ntwitter');
var fs = down.fs;
var credentials = require('./configurables.js');
var t = new twitter({
	consumer_key : credentials.credentials.consumer_key,
	consumer_secret : credentials.credentials.consumer_secret,
	access_token_key : credentials.credentials.access_token_key,
	access_token_secret : credentials.credentials.access_token_secret
});
db.connection.connect();
//db order //screen_name,id_str,if(.coordinates!=null, .coordinates.coordinates[0] = lon,.coordinates.coordinates[1] = lat  ), TWITTR, text, created_at, .entities.media[0].media_url, 
t.stream('statuses/filter', 
{track:credentials.tags}
, function(stream) {
	stream.on('data', function(tweet) {
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
		send.time = db.formatDate(new Date(tweet.created_at));
		send.text = tweet.text;
		send.source = "TWTTR";
		send.hashtag = filterForHash(tweet.text);
		if(tweet.coordinates!=null){
		send.lat =  tweet.coordinates.coordinates[1];
		send.lon =  tweet.coordinates.coordinates[0];
		}
		if(tweet.entities.hasOwnProperty("media")){
			if (tweet.entities.media.length > 0) {
				send.img_small = tweet.entities.media[0].display_url;
				send.img_med = tweet.entities.media[0].display_url;
				send.img_large = tweet.entities.media[0].display_url;		
			}
		}
		//console.log(send);
		db.connection.query('INSERT INTO content SET ?', send, function(err, result) {
  console.log(err+","+result);
});
	});
});

function filterForHash(input){
	var arr = credentials.tags;
	for(var i in arr){
		if(input.toLowerCase().indexOf(arr[i].toLowerCase()) > -1){
			return(arr[i]);
		}
	}
}
