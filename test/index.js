var test = require('test');
var assert = test.assert;
var http = require('http');
const coroutine = require('coroutine');
var lb = require('../lib/index.js');
test.setup();

function runServer(port) {
	return new http.Server(port, {
		'/health': (req) => {
			console.notice("server health");
			req.response.write('true');
		}
	});
}

describe('fib-lb test', () => {

	it('export test', () => {

		let params = {};

		assert.throws(() => {
			lb()
		});

		assert.throws(() => {
			lb(params)
		});


		params.urls = ["http://127.0.0.1:8093", "http://127.0.0.1:8092", "http://127.0.0.1:8091"];
		params.health = "health";
		params.response = 'true';

		let r = new http.Repeater(params.urls);

		assert.typeOf(lb(params), typeof r);

	});

	it('checkUrlsWorker test', () => {

		var svr1 = runServer(8091);
		var svr6 = runServer(8096);
		var svr3 = new http.Server(8093, {
			'/health': (req) => {
				console.notice("server health");
				req.response.statusCode = 404;
				req.response.write('true');
			}
		});

		var svr4 = new http.Server(8094, {
			'/health': (req) => {
				console.notice("server health");
				req.response.write('false');
			}
		});

		svr1.start();
		svr6.start();
		svr3.start();
		svr4.start();

		let params = {
			urls: ["http://127.0.0.1:8093", "http://127.0.0.1:8091", "http://127.0.0.1:8092", "http://127.0.0.1:8096", "http://127.0.0.1:8095", "http://127.0.0.1:8094"],
			health: "health",
			response: 'true'
		}

		let r = lb(params);

		assert.deepEqual(r.urls.sort(), ["http://127.0.0.1:8091/", "http://127.0.0.1:8096/"]);

		coroutine.sleep(1000 * 3);

		svr1.stop();
		svr6.stop();

		var svr2 = runServer(8092);
		var svr5 = runServer(8095);

		svr2.start();
		svr5.start();

		coroutine.sleep(1000 * 3);

		assert.deepEqual(r.urls.sort(), ["http://127.0.0.1:8091/", "http://127.0.0.1:8092/", "http://127.0.0.1:8095/", "http://127.0.0.1:8096/"]);

	});

});

test.run(console.INFO);
process.exit();