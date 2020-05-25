const http = require('http');

let repeater = require("..");

let params = {
	urls: ["http://127.0.0.1:8093", "http://127.0.0.1:8092", "http://127.0.0.1:8091"],
	health: "health",
	response: 'true'
}

var httpServer = new http.Server(8081, [
	(req) => {
		req.session = {}
	}, {
		"*": repeater(params)
	}
]);

setInterval(() => {
	console.warn("Server is running", new Date());
}, 1000 * 5);

httpServer.enableCrossOrigin();

let version = process.version.split("-")[0].split('.')[1];
if (Number(version) < 29) {
	httpServer.run(() => {});
} else {
	httpServer.start();
}