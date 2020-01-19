# fib-loadbalancer

## Introduction

Load balance module for fibjs.

## Installation

```shell
npm install fib-loadbalancer
```
or
```shell
fibjs --install fib-loadbalancer
```

## Example

```javascript
...
const http = require('http');
let repeater = require('fib-loadbalancer');

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
...
```

## Precautions

In params, urls is a required parameter, health and response are optional parameters. Health default is 'health', if the route provided by the user for health check is not 'health', the health parameter of the specified route needs to be filled in. Response default is 'true', if the response provided by the user for health check is not 'true', the response parameter of the specified route needs to be filled in.

[example code](./examples/index.js)