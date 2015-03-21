var http = require('http');
var url = require('url');
var fs = require('fs');
var Downloader = require('./downloader');

var server = http.createServer(function(req, res) {
	var page = url.parse(req.url).pathname;
	var files = {
		"test" : "./test",
	};
	if(page == '/download') {
		Downloader.run(files, req, res);
	} else if (page == '/js') {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.write(fs.readFileSync("./downloader-client.js"));
		res.end();
	} else {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.write(fs.readFileSync("./index.html"));
		res.end();
	}
});

server.listen(8080);
