# The mars-sdk

A library of utilities intended to make the development of collector node.js script both easier, and more robust.

The core utilities can be required and used in the simple form:

```javascript
const utils = require('@moogsoft/mars-sdk');

utils.debug('Mooo');
```
Or in the prefered deconstructed method:
```javascript
const {
    debug,
} = require('@moogsoft/mars-sdk');

debug('Mooo');
```
Extended utilities can be loaded as follows:
```javascript
const rest = require('@moogsoft/mars-sdk/rest');
const Event = require('@moogsoft/mars-sdk/Event');
```

## Utility Reference
### Core Utilities
#### Loggers
- [debug](#debug)
- [info](#info)
- [warn](#warn)
- [error](#error)
#### Discovery Utilities
- [fileExists](#fileExists)
- [canRun](#canRun)
- [hasCmd](#hasCmd)
- [procRunning](#procRunning)
- [DiscoveryResult](#discoveryresult)
- [Reason](#reason)
- [constants](#constants)
- [sendDiscovery](#sendDiscovery)
#### Configuration Utilities
- [getConfig](#getConfig)
- [getCredentials](#getCredentials)
- [exportConfig](#exportConfig)
- [getMarDir](#getMarDir)
#### Shedulers
- [registerScheduled](#registerScheduled)
- [carousel](#carousel)
#### API Object builders and formatters
- [Metric](#metric)
- [Event](#event)
- [Bitmask](#bitmask)
- [sendResult](#sendResult)
- [sendMetrics](#sendMetrics)
- [sendEvents](#sendEvents)
#### General Purpose Utilities
- [exec](#exec)
- [JSONToKv](#JSONToKv)
- [dehumanize](#dehumanize)
- [jsonParse](#jsonParse)
- [isInFilters](#isInFilters)
- [passFilter](#passFilter)
### Extended Utilities
#### REST
- [REST](#rest)

---
#### debug
```javascript
debug(string)
```
Writes a JSON formatted string to `stdout`, with a "level" key set to "debug" and the supplied string as the value for "msg", which is processed by the collector as a log message.
#### info
An "info" level log message.
See [debug](#debug) for details
#### warn
A "warn" level log message.
See [debug](#debug) for details
#### error
An "error" level log message.
See [debug](#debug) for details

#### jsonParse
```javascript
jsonParse(string)
```
A wrapper for `JSON.parse()`
- Returns: `<Object>` Parsed object
#### fileExists
```javascript
fileExists(filePath)
```
Checks to see if a given file exists
- filePath `<String>`
- Returns: `<boolean>`
#### canRun
```javascript
canRun(cmd)
```
Checks to see if a given command is executable
- cmd `<String>`
- Returns: `<boolean>`
#### hasCmd
```javascript
hasCmd(cmd)
```
Checks to see if a given command exists, and is executable by the current user
- cmd `<String>`
- Returns: `<boolean>`
#### procRunning
```javascript
procRunning(proc)
```
Checks to see if a given process/task (name) is running
- proc `<String>` Name of processes
- Returns: `<boolean>`
#### DiscoveryResult
```javascript
const DiscoveryResult = require('@moogsoft/mars-sdk/DiscoveryResult');
const result = new DiscoveryResult()
    .<setMethod(value)>
    [...]
```
An external class to generate a well formed discovery result object.
- Returns: `<Object>`
- Methods:
    - `.setMoob(moob)` *Required* (If single)
        - moob: `<String>` The Managed Object that has been enabled
    - `.setMoobs(moobs)`*Required* (If multiple)
        - moob: `<Object>` A list of Managed Objects that have been enabled (if multiple are suported)
    - `.setReason(reason)` *Optional*
        - reason: `<Object>` A well formed reason object built with the [Reason](#reason) method
    - `.setActive(active)`
        - active `<boolean>`

*Examples:*

Initialize and turn on a MAR:
```javascript
let builder = new DiscoveryResult.setMoob('system').setActive(true);
```
Disable a MAR based on subsequent logic:
```javascript
builder = builder.setActive(false);
```

#### Reason
An external class to generate a well formed Reason to be used by the `DiscoveryResult.setReason()` method
- Returns: `<Object>`
- Methods:
    - `.setRecoverable(recoverable)`
        - recoverable: `<boolean>` Is it completely undiscoverable, or should the user be prompted for miising information?
    - `.setMsg(msg)`
        - msg: `<String>` A message that will be presented to the user
    - `.setType(type)`
        - type: `<String>` A categorization of the type of discovery "failure". While this can be any string, the following categores *must* be set from the [constants](#constants) module:
            - INSUFFICIENT_PRIVILEGES
            - INVALID_CREDENTIALS
            - MISSING_CREDENTIALS
            - MISSING_PROCESS
            - MISSING_COMMAND

*Examples:*

Disable a MAR because a process was not detected:
```javascript
const {
    MISSING_PROCESS,
    MISSING_COMMAND,
}  = require('@moogsoft/mars-sdk/constants');

builder = builder.setActive(false)
    .setReason(new Reason()
        .setRecoverable(false)
        .setMsg('redis server process not found')
        .setType(MISSING_PROCESS);
```

#### constants
The constants module exposes common constants used during discovery and collection.
Available constants:

`INSUFFICIENT_PRIVILEGES`  
`INVALID_CREDENTIALS`  
`MISSING_CREDENTIALS`  
`MISSING_COMMAND`  
`MISSING_PROCESS`  
`COUNTER`  
`GAUGE`  

#### sendDiscovery
```javascript
sendDiscovery(discovery)
```
Writes a JSON string to `stdout` containing the results of the disovery, which is interpretted by the collector
- discovery `<Object>` A [well formed](#discoveryresult) "disovery" object

#### getConfig
```javascript
getConfig()
```
- Returns: `<Object>` An object containing configuration (if any) for that MAR, for that collector instance
#### getCredentials
```javascript
getCredentials()
```
- Returns: `<Object>` An object containing credentials (if any) for that MAR, for that collector instance
#### exportConfig
```javascript
exportConfig(config)
```
Writes a JSON string to `stdout` containing the config (see `getConfig()`, which is interpretted by the collector
- config `<Object>`
#### getMarDir
```javascript
getMarDir()
```
Returns the absolute path of the MAR script that is being execute. Useful for accessing external files/artifacts in the MAR
- Returns: `<String>`

#### registerScheduled'
```javascript
registerScheduled(func)
```
Takes a function and calls if if the first input argument is the functions name.
Useful when calling separate functions on different schedules for a scheduled collector.
- func: `<function>` A collector function that generates events/metrics

#### carousel'
```javascript
carousel(interval, func, args)
```
Takes an interval, function of arity 1, and a list of arguments to pass to a function.
Calls the function with each argument in turn, spreading the calls across the supplied interval. (A form of load balancer).
e.g: If the interval is 10s, and there are 10 args, the function will be executed every second.
- interval: `<Number>` Time interval in ms
- func: `<Function>` The function to be executed
- args: `<Array>` The list of arguments

#### Metric
An "extended" class to generate a well formed Metric to be used by the [sendMetrics()]($sendmetrics) method
- Returns: `<Object>`
- Methods:
    - `.setData(data)`
        - data: `<Number>` a time series value to be observed
    - `.setMetric(metric)`
        - metric: `<String>` The name of the metric or "check". (e.g: NetworkIO)
    - `.setSource(source)`
        - source: `<String>` the unique name, or "namespace" of the resource the metric is associated with
    - `.setKey(key)`
        - key: `<String>` A sub key of the resource (e.g: the network interface)
    - `.setTime(ts)`
        - ts: `<unixtime>` A unix timestamp in ms. The collector will provide on if not set
    - `.setDescription(desc)`
        - desc: `<String>` A description of the metric
    - `.setUtcOffset(offset)`
        - offset: `<String>` utc_offset The timezone of the metric, defaults to the current timezone
    - `.setAdditionalData(ad)`
        - ad: `<Object>` Any addition JSON metadata that is not suited for tags, but might be useful for upstream processing or for a user
    - `.setTags(tags)`
        - tags: `<Object>` An object, containing a list/array of key:value pairs
    - `.setType(ad)`
        - type: `<String>` The metric type, one of either `counter` or `gauge`, defaulting to gauge
    - `.setUnit(unit)`
        - unit: `<String>` The metric unit. e.g: `%`, `+` (non-negative), or a unit like `kb`. Used by the UI for chart treatment
    - `.setWindow(window)`
        - window: `<Number>` The window value
    - `.gauge()`
        - Sets the metric `type` to gauge
    - `.counter()`
        - Sets the metric `type` to counter

*Example*
```javascript
const Metric = require('@moogsoft/mars-sdk/Metric');

const metric = new Metric()
    .setMetric('duration')
    .setSource(`${jname}-${stage.name}`)
    .setData(stage.durationMillis)
    .setTime(stage.startTimeMillis)
    .setTags({ job: job.id })
    .setAdditionalData({
        status: stage.status,
        href: encodeURI(stage._links.self.href),
    });
```
#### Event
An "extended" class to generate a well formed Event to be used by the [sendEvents()]($sendevents) method
- Returns: `<Object>`
- Methods:
    - `.setSeverity(severity)`
        - severity: `<String>` OR `<Number>` Can be one of the following

        | enum | String | Notes |
        | ---- | ------ | ----- |
        | `0` | `CLEAR` | Clears a (mandatory) preceding event severity |
        | `1` | `UNKNOWN` | The severity cannot be determined, usually indicates a problem, or unrecognized event |
        | `2` | `WARNING` | |
        | `3` | `MINOR` | |
        | `4` | `MAJOR` | |
        | `5` | `CRITICAL` | |
    - `.setSource(source)`
        - source: `<String>` the unique name, or "namespace" of the resource the metric is associated with
    - `.setCheck(check)`
        - check `<String>`  The check that failed to generate this event, for example "cpu load"
    - `.setDescription(description)`
        - description `<String>` A description of the event
    - `.setTime(time)`
        - time: `<unixtime>`  The timestamp of the event in s, if omitted defaults to the current time
    - `.setUtcOffset(utc_offset)`
        - utc_offset: `<String>`  The UTC offset of the data, for example +01:00, defaults to the current TZ
    - `.setDedupeKey(dedupe_key)`
        - dedupe_key: `<String>` [Optional] The deduplication key of this event, used when processing into an Incident
    - `.setManager(manager)`
        - manager: `<String>` [Optional] The manager of this event
    - `.setService(service)`
        - service: `<String>` [Optional] An array of services impacted by this event
    - `.setAlias(alias)`
        - alias: `<String>` [Optional] An alias for this event
    - `.setClass(clazz)`
        - clazz: `<String>` [Optional] The class of this event, for example Storage, AWS, Network, etc
    - `.setTags(tags)`
        - tags: `<Object>` [Optional] Key-value pairs of metadata for the event
    - `.from(object)`
        - object: `<Object>` Create an Event from an  object. The source object is expected to have the same property names as the Event. Missing properties will be ignored (left as the default undefined). 
            - severity 
            - source 
            - check 
            - description 
            - time 
            - utc_offset 
            - dedupe_key 
            - manager 
            - service 
            - alias 
            - class
            - tags

#### Bitmask
An "extended" class to generate a well formed Bitmask metric to be used by the [sendMetrics()]($sendmetrics) method
- Returns: `<Object>`
- Methods:
    - `.setKeys(keys)`
        - keys: `<Array>` An array of strings, represnting the keys, or lables of the binary representation
    - `.setValues(values)`
        - values: `<Array>` An array of boolean values (corresponding to the keys)
    - `.addValue(key, value)`
        Appends a key-value pair to the `value` array

#### sendResult
```javascript
sendResult(result)
```
Writes a JSON string to `stdout` returning a *SINGLE* datum, which is interpretted by the collector
- result `<Object>` A [well formed](#metric) "Metric" object
#### sendMetrics
```javascript
sendMetrics(metrics)
```
Writes a JSON string to `stdout` returning a batch of metrics, which is interpretted by the collector
- metrics `<Array>` An array of [well formed](#metric) "Metric" objects
#### sendEvents
```javascript
sendEvents(events)
```
Writes a JSON string to `stdout` returning a batch of events, which is interpretted by the collector
- events `<Array>` An array of [well formed](#event) "Event" objects

#### exec
```javascript
exec(cmd, args)
```
Executes a shell process
- cmd: `<String>` A command in the the collector execution path, or an absolute path
- args: `<Array>` An array of arguments to the `cmd`
- Returns: `<Object>`:
    - status: `<Number>` shell return value
    - stdout: `<String>` Text that was written to `stdout`
    - stderr: `<String>` Text that was written to `stderr`

#### JSONToKv
```javascript
JSONToKv(object, array, func)
```
Builds an array of key-value pairs from nested JSON/BSON, by "flattening" the nested structure, concatenating the keys with an underscore
- object: `<Object>` The JSON object to be converted
- array: `<Array>` The array to hold the resulting key:value pairs
- func: `<Function>` A function to format the key:value pairs

*Example:*
```javascript
function buildMetric(n, v) {
    const name = String(n).split(' ').join('_');
    let built = new Metric.setName(name).setValue(v);
    return built;
}

const mongoStat = [];
JSONToKv(info, mongoStat, buildMetric);
```

#### dehumanize
```javascript
dehumanize(string)
```
Normalise (de-humanize) a value that may have been generatied in "human" readable form.  * Takes an input like "10Mb", "5 Kb" or "12.3Kb" and returns
a numeric value in bytes
- Returns: `<Number`
- string `<String>` The string to convert. e.g: `1 Kb` will return 1024

#### jsonParse
```javascript
jsonParse(string)
```
A wrappper for JSON.parse with error handling
- Returns: `<Object>`
- string: Input JSON as a string

#### isInFilters
```javascript
isInFilters(item, filterList)
```
A filter utility that evaluates against lists of strings or regex
- Returns: `<Boolean>`
- item `<String>` The string we're looking for
- filterList `<Array>` An array of regular expressions or stringto test
*Example*
```javascript
mongoStat.filter((m) => passFilter(m.name, filters)).forEach((m) => {
    filteredMongoStat.push(m);
});
```
Where the filter list is:
```json
"filters": [
    "text",
    "/regex\\s/",
    "!/inverseRegex/"
]
```

#### passFilter
```javascript
passFilter(item, flist)
```
A basic, but very quick exclusion filter
- Returns: `<Boolean>`
- item `<String>` The string we're looking for
- flist `<Array>` An array of regular expressions to test, matching items will be filtered (dropped)
Where the filter regex is of the following format:
```json
"filters": [
    "'^tcmalloc'",
    "'foo'"
]
```


#### REST
```javascript
head(url, params, httpOptions)
post(url, params, httpOptions)
get(url, params, httpOptions)
```
The REST module provides wrappers for the `HEAD`, `POST` and `GET` HTTP(S) requests, and returns the resulting content (if any),
or a detailed error. Additionally timing is done at various stages, enabling the requests to be used as a basic synthetic test.

- Returns: `<Object>`
- url: `<String>` A URL, containing the protocol
- params: `<Object>` OR `<String>` Query parameters, or post data. In most circumstances, the object will be appropriate, but a string
    can be accepted for instances where the query parameters have to be URI encoded
- httpOptions: `<Object>` HTTP Options

##### Return Object:

|Key|Type|Description|
|---|----|-----------|
| `exception` |  `<String>` | Any non HTTP error | |
| `status_code` |  `<String>` | HTTP status code (if available) |
| `body` |  `<String>` | HTTP response body |
| `roundTripTime` |  `<Number>` | Round trip from request initiation to full body received |
| `responseTime` |  `<Number>` | HTTP Header received |
| `errorTime` |  `<Number>` | Time to detect / receive fatal error |
| `dnsTime` |  `<Number>` | DNS lookup time from socket library |
| `connectTime` |  `<Number>` | Connect time from socket library |
| `certValidTo` | `<String>` | Certificate expiry as a string |
| `certValidToMs` |  `<Number>` | Certificate valid time remaining |
| `headers` | `<Object>` | HTTP headers |

*Example:*

A simple synthetic test, using the `Boolean` detector for string validation, and `Adaptive` detector for Round Trip Time
```javascript
const target = {
    "url":"http://example.com",
    "host": "example.com",
    "validString": "Example",
};

async function checkUrl(target) {
    const { url } = target;

    const request = async () => {
        const metrics = [];
        const result = await rest.get(url, {});
        let success = result.status_code === 200;

        //
        // If the request returned 200, move on to string validation
        //
        if (success) {
            const page = result.body.toString();
            if (page.match(target.validString) === null) {
                success = false;
                result.exception = `Validation string not found: '${target.validString}'`;
            }
        }

        const {
            roundTripTime,
            responseTime,
            errorTime,
            dnsTime,
            connectTime,
            certValidTo,
            certValidToMs,
        } = result;

        //
        // Build the RTT metric
        //
        const rttMetric = new Metric()
            .setMetric('roundTripTime')
            .setSource(target.host)
            .setData(roundTripTime)
            .setAdditionalData({
                responseTime,
                errorTime,
                dnsTime,
                connectTime,
                certValidTo,
                certValidToMs,
            });
        metrics.push(rttMetric);

        //
        // Build the status metric
        //
        const statusMetric = new Metric()
            .setMetric('urlcheck')
            .setSource(target.host)
            .setData(success)
            .setAdditionalData({
                exception: result.exception,
                status_code: result.status_code,
            });
        metrics.push(statusMetric);
        sendMetrics(metrics);
    };
    request();
}
```
