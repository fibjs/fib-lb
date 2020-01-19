const http = require('http');
const url = require('url');
const net = require('net');
const coroutine = require('coroutine');

http.timeout = 200;

let temp_urls;

function equar(a, b) {
	if (a.length !== b.length) {
		return false
	} else {
		for (let i = 0; i < a.length; i++) {
			if (a.indexOf(b[i]) == -1) {
				return false
			}
		}
		return true;
	}
}

let checkUrlsWorker = (urls, health, response, r) => {

	let _urls = [];

	coroutine.parallel(urls, function(e) {

		let _url = new net.Url(e);
		let _rs = _url.resolve(health);

		let rs;

		try {
			rs = http.get(_rs);
		} catch (f) {
			console.log("URL request timed out : ", e);
			return;
		}

		let data = rs.data || "";

		if (rs && rs.statusCode == 200 && data.toString().indexOf(response) != -1) {
			_urls.push(e);
		} else {
			console.log("Unhealthy URL : ", e);
		}
	})

	if (!equar(temp_urls, _urls)) {
		temp_urls = _urls;
		if (temp_urls.length != 0) {
			r.load(temp_urls);
			console.log("Healthy URLs have changed : ", temp_urls);
		} else {
			console.log("No URLs currently available!");
		}
	}

	console.log("CheckUrlsWorker is running, healthy URLs : ", temp_urls);
}

module.exports = params => {

	let urls, health, response;

	if (!params) {
		throw new Error("No Params");
	}

	if (!params.urls) {
		throw new Error("No URLs");
	}

	urls = params.urls;
	temp_urls = params.urls;

	response = params.response || 'true';

	health = params.health || "health";

	let r = new http.Repeater(urls);

	checkUrlsWorker(urls, health, response, r)

	setInterval(() => {
		checkUrlsWorker(urls, health, response, r)
	}, 1000 * 5);

	return r;
}