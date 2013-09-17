var mysql = require('mysql');
exports.mysql = mysql;
exports.connection = mysql.createConnection({
  host     : 'dev.welikepie.com',
  user     : 'alex',
  password : 'Sannevanwel1j',
  database : 'asosUniMap',
  charset:'UTF8_GENERAL_CI'
/*host: "localhost",
user: "root",
password: "alpine",
database: "asosUniMap",
charset: "UTF8_GENERAL_CI"*/
});
exports.formatDate = function(date1) {
var t = new Date(date1);
var YYYY = t.getFullYear();
var MM = ((t.getMonth() + 1 < 10) ? '0' : '') + (t.getMonth() + 1);
var DD = ((t.getDate() < 10) ? '0' : '') + t.getDate();
var HH = ((t.getHours() < 10) ? '0' : '') + t.getHours();
var mm = ((t.getMinutes() < 10) ? '0' : '') + t.getMinutes();
var ss = ((t.getSeconds() < 10) ? '0' : '') + t.getSeconds();
return YYYY+'-'+MM+'-'+DD+' '+HH+':'+mm+':'+ss;
};
exports.send = {
	id:null,
	user:null,
	time:new Date().getTime(),
	lat:null,
	lon:null,
	text:null,
	img_small:null,
	img_med:null,
	img_large:null,
	source : null,
	hashtag : null
};
exports.sendNew = function(){
	return {
	id:null,
	user:null,
	time:new Date().getTime(),
	lat:null,
	lon:null,
	text:null,
	img_small:null,
	img_med:null,
	img_large:null,
	source : null,
	hashtag : null
};
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