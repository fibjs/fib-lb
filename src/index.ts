import http = require('http');
import url = require('url');
import net = require('net');
import coroutine = require('coroutine');

(http as any).timeout = 200;

let temp_urls: string[];

function equar(a: string[], b: string[]) {
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

type LoadBalanceParams = Parameters<typeof LoadBalance>[0]

function checkUrlsWorker (
	urls: LoadBalanceParams['urls'],
	health: LoadBalanceParams['health'],
	response: LoadBalanceParams['response'],
	r: Class_HttpRepeater
) {

	let _urls: string[] = [];

	coroutine.parallel(urls, function(e: (typeof _urls)[any]) {

		let _url = new net.Url(e);
		let _rs = _url.resolve(health);

		let rs;

		try {
			rs = http.get(_rs.toString());
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

function LoadBalance (params: {
	urls: string[],
	health?: string,
	response?: string,
}) {
	if (!params) {
		throw new Error("No Params");
	}

	const {
		urls,
		health = 'health',
		response = 'true'
	} = params

	if (!params.urls) {
		throw new Error("No URLs");
	}

	temp_urls = urls;

	const r = new http.Repeater(urls);

	checkUrlsWorker(urls, health, response, r)

	setInterval(() => {
		checkUrlsWorker(urls, health, response, r)
	}, 1000 * 5);

	return r;
}

export = LoadBalance