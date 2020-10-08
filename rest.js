'use strict';

/**
 * Module that provides URL synthetic test capability
 *
 * Requires a validly formatted URL starting with HTTP pr HTTPS
 *
 * Uses Node HTTP and HTTPS libraries: refer to these for valid HTTP options.
 *
 * Will use the start of the URL (HTTP or HTTPS) to decide wchich library to use
 *
 * Exposes functionality such as:
 *   - Calculate roundtrip time in ms for an HTTP request
 *   - Check HTTP code on response
 *   - Report SSL errors
 *   - Identify transport errors (handshake, timeout, dns, etc)
 *
 * returns:
 *   const resultDetails = {
 *      exception: '',               // any non HTTP error
 *      status_code: '',             // HTTP status code (if available)
 *      body: '',                    // HTTP response body
 *      roundTripTime: Number(),     // round trip from request initiation t ofull body received
 *      responseTime: Number(),      // HTTP Header received
 *      errorTime: Number(),         // time to detect / receive fatal error
 *      dnsTime: Number(),           // DNS lookup time from socket library
 *      connectTime: Number(),       // connect time from socket library
 *      certValidTo '',              // Certificate expiry as a string
 *      certValidToMs: Number(),     // Certificate valid time remaining
 *      headers: {},                 // HTTP headers
 *  };
 *
 */

/**
 * HTTP Request library
 */
const https = require('https');
const http = require('http');

function log(msg, level) {
    process.stdout.write(`${JSON.stringify({ type: 'log', level, msg })}\n`);
}

function buildUrl(uri, params) {
    const locator = new URL(uri);
    let searchString = '';

    // extract any params built into the given URI
    const searchParams = new URLSearchParams(locator.search);

    // add the given params to the extracted URL params.
    if (params) {
        if (typeof params === 'object') {
            Object.keys(params).forEach((property) => {
                searchParams.set(property, params[property]);
            });
        } else {
            // Unless it's a string
            searchString = params;
        }
    }

    let tempUrl;
    // If we have searchParams, add them to the url
    if (searchParams && searchParams.toString().length !== 0) {
        locator.search = searchParams.toString();
        tempUrl = locator.toString();
    } else if (searchString) {
        // Unless params is a string
        tempUrl = `${locator.toString()}?${searchString}`;
    } else {
        tempUrl = locator.toString();
    }

    // final formatted URL
    const result = new URL(tempUrl);
    return result;
}

function performRequest(requestProtocol, fullUrl, httpOptions, method) {
    // setup initial http options object for request
    let options = {
        method,
        uri: fullUrl,
        requestCert: true,
    };

    // over write and add http options from the caller
    if (httpOptions) {
        options = Object.assign(httpOptions, options);
    }

    // resullts holder to return after populated.
    const resultDetails = {
        exception: '',
        status_code: Number(),
        body: '',
        roundTripTime: Number(),
        responseTime: Number(),
        errorTime: Number(),
        dnsTime: Number(),
        connectTime: Number(),
        headers: {},
    };
    // start the clock
    const startTime = new Date().getTime();

    // execute the request and build the result with a Promise
    const fullRequest = new Promise((resolve) => {
        const httpRequest = requestProtocol.request(fullUrl.toString(), options, (response) => {
            // response time
            const responseTime = (new Date().getTime() - startTime) / 1000;
            resultDetails.responseTime = responseTime;
            // status code
            resultDetails.status_code = response.statusCode;
            log(`status: ${response.statusCode} headers: ${JSON.stringify(response.headers)}`, 'debug');
            // for the body
            const accumulator = [];

            response.on('data', (chunk) => {
                accumulator.push(chunk);
            });
            response.on('end', () => {
                // If it's tls, add in the cert expiry date
                if (typeof response.connection.getPeerCertificate === 'function') {
                    resultDetails.certValidTo = response.connection.getPeerCertificate().valid_to;
                    resultDetails.certValidToMs = Date.parse(resultDetails.certValidTo);
                }
                const roundTripTime = (new Date().getTime() - startTime) / 1000;
                resultDetails.roundTripTime = roundTripTime;
                const fullBody = Buffer.concat(accumulator);
                resultDetails.body = fullBody;
                resultDetails.headers = response.headers;
                resolve(resultDetails);
            });
        });
        // request proccesing
        httpRequest.on('error', (e) => {
            const roundTripTime = (new Date().getTime() - startTime) / 1000;
            const errorTime = roundTripTime;
            log(JSON.stringify(e), 'warn');
            resultDetails.roundTripTime = roundTripTime;
            resultDetails.errorTime = errorTime;
            resultDetails.status_code = false;
            resultDetails.exception = e;
            resolve(resultDetails);
        });
        httpRequest.on('socket', (socket) => {
            socket.on('lookup', () => {
                const dnsTime = (new Date().getTime() - startTime) / 1000;
                resultDetails.dnsTime = dnsTime;
            });
            socket.on('connect', () => {
                const connectTime = (new Date().getTime() - startTime) / 1000;
                resultDetails.connectTime = connectTime;
            });
        });
        httpRequest.end();
    }).catch((e) => { log(e, 'warn'); });

    return fullRequest;
}

function performHttpsRequest(fullUrl, httpOptions, method) {
    log(`HTTPS ${fullUrl.toString()}`, 'debug');
    return performRequest(https, fullUrl, httpOptions, method);
}

function performHttpRequest(fullUrl, httpOptions, method) {
    log(`HTTP ${fullUrl.toString()}`, 'debug');
    return performRequest(http, fullUrl, httpOptions, method);
}

/**
 * Performs a HEAD request
 */
function head(uri, params, httpOptions) {
    const fullUrl = buildUrl(uri, params);
    let ret;
    if (fullUrl && fullUrl.toString().startsWith('https')) {
        ret = performHttpsRequest(fullUrl, httpOptions, 'HEAD');
    } else {
        ret = performHttpRequest(fullUrl, httpOptions, 'HEAD');
    }
    return ret;
}

/**
 * Performs a POST request
 */
function post(uri, params, httpOptions) {
    const fullUrl = buildUrl(uri, params);
    let ret;
    if (fullUrl && fullUrl.toString().startsWith('https')) {
        ret = performHttpsRequest(fullUrl, httpOptions, 'POST');
    } else {
        ret = performHttpRequest(fullUrl, httpOptions, 'POST');
    }
    return ret;
}

/**
 * Performs a GET request
 */
function get(uri, params, httpOptions) {
    const fullUrl = buildUrl(uri, params);
    let ret;
    if (fullUrl && fullUrl.toString().startsWith('https')) {
        ret = performHttpsRequest(fullUrl, httpOptions, 'GET');
    } else {
        ret = performHttpRequest(fullUrl, httpOptions, 'GET');
    }
    return ret;
}

/**
 * Export our functions
 */
module.exports = {
    head,
    post,
    get,
    buildUrl, // exposed for unit testing.
};
