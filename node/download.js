var http = require('http');
var fs = require('fs');
exports.fs = fs;
exports.http = http;
exports.download = function(url, dest, cb) {
	var file = fs.createWriteStream(dest);
	var request = http.get(url, function(response) {
		response.pipe(file);
		file.on('finish', function() {
			file.close();
			cb();
		});
	});
}