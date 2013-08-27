var down = require("./download");
var fs = down.fs;
var conf = require("./configurables");
var db = require("./db.js");
Instagram = require('instagram-node-lib');
Instagram.set('client_id', conf.credentials.insta_client_id);
Instagram.set('client_secret', conf.credentials.insta_client_secret);
db.connection.connect();

var arr = [];
setInterval(function() {
	var dataStream = JSON.parse(fs.readFileSync("tags.json")).data;
	//console.log(dataStream);
	var tagArr = dataStream.campaign;
	for (var i in tagArr) {
		Instagram.tags.recent({
			name : tagArr[i].substring(1,tagArr[i].length),
			complete : function(data, pagination) {
				//console.log(data);
				//console.log(pagination);
				// data is a javascript object/array/null matching that shipped Instagram
				// when available (mostly /recent), pagination is a javascript object with the pagination information
				//console.log(pagination);
				for (var i in data) {				
					//console.log(data[i].id);
					if (arr.indexOf(data[i].id) == -1) {
						arr.push(data[i].id);
						Instagram.media.info({
							media_id : data[i].id,
							complete : function(imgData, pagination) {
								//console.log(imgData);
								var send = db.sendNew();
								send.id = imgData.id;
								send.user = imgData.user.username;
								//console.log(imgData.created_time);
								//console.log(parseInt(imgData.created_time, 10));
								send.time = db.formatDate(new Date(parseInt(imgData.created_time, 10) * 1000));
								if(imgData.caption!=null){
								send.text = imgData.caption.text;
								}
								send.hashtag = filterForHash(imgData.tags, dataStream.location);
								send.source = "INSTA";
								if (imgData.location != null) {
									send.lat = imgData.location.latitude;
									send.lon = imgData.location.longitude;
								}
								//console.log(imgData.images.standard_resolution);
								send.img_large = imgData.images.standard_resolution.url;
								send.img_small = imgData.images.thumbnail.url;
								send.img_med = imgData.images.low_resolution.url;
								//console.log(send);
								if(send.hashtag!=""){
									console.log(send);
									db.connection.query('INSERT INTO content SET ? ON DUPLICATE KEY UPDATE hashtag = ?, id = ?, text = ?, user = ?, time = ?, img_large = ?, img_med = ?, img_small = ?, lat = ?, lon = ?', [send, send.hashtag,send.id,send.text,send.user,send.time,send.img_large,send.img_med,send.img_small,send.lat,send.lon], function(err, result) {
										//console.log(err + "," + result);
									});
								}
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
								//console.log(imgData);
								//if(location!=null)
								// .user.username, .id,  .images.thumbnail, .images.low_resolution, .images.standard_resolution, INSTA, .caption.text, .created_time <- not integer. Parse it out of string first.
								/*down.download(imgData.images.low_resolution.url, "preImg/" + imgData.id + ".jpg", function() {
								 fs.rename("preImg/" + imgData.id + ".jpg", "img/" + imgData.id + ".jpg");
								 console.log("file saved and moved");
								 });*/

							}
						});
					}
				}
				//console.log(arr.length);
			}
		})
	}
}, 2000);

function filterForHash(input, arr){
	for(var i in arr){
		for(var z in input){
			console.log(arr[i].substring(1,arr[i].length).toLowerCase()+","+ input[z].toLowerCase());
			if(arr[i].substring(1,arr[i].length).toLowerCase() == input[z].toLowerCase()){
				return (arr[i].substring(1,arr[i].length));
			}
		}
		
	}
	return "";
}
