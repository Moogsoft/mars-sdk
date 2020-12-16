'use strict';

/**
 * Helper functions for our MARs
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const constants = fs.constants || fs;

const isWindows = process.platform.toLowerCase() === 'win32';
const isLinux = process.platform.toLowerCase() === 'linux';
const isMacOS = process.platform.toLowerCase() === 'darwin';

// Our cached config object
let MOOG_CREDS_AND_CONFIG = null;

/**
 * Logging commands, they all wrap messages in markers that we can
 * disambiguate on the collector side to log out at certain levels
 */

/**
 * Logs a message to be consumed by the collector
 *
 * @param {String} level level to log at
 * @param {String} msg message to be logged
 */
function log(level, msg) {
    let message = msg;
    if (typeof msg !== 'string') {
        message = JSON.stringify(msg);
    }
    process.stdout.write(`${JSON.stringify({ type: 'log', level, msg: message })}\n`);
}

/**
 * Info
 */
function info(msg) {
    log('info', msg);
}

/**
 * Debug
 */
function debug(msg) {
    log('debug', msg);
}

/**
 * Warn
 */
function warn(msg) {
    log('warn', msg);
}

/**
 * Error
 */
function error(msg) {
    log('error', msg);
}

// Helper functions

function jsonParse(value) {
    try {
        return JSON.parse(value);
    } catch (e) {
        return value;
    }
}

/**
 * Checks if a file exists
 */
function fileExists(commandName) {
    try {
        fs.accessSync(commandName, constants.F_OK);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Checks if we can exec a file
 */
function canRun(cmd) {
    try {
        fs.accessSync(cmd, constants.F_OK || constants.X_OK);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Checks if a command exists and is runnable by the current user
 */
function hasCmd(cmd) {
    if (!fileExists(cmd)) {
        let cmdString = '';
        if (isWindows) {
            cmdString = `WHERE ${cmd} >NUL 2>&1`;
        } else {
            cmdString = `command -v ${cmd} 2>/dev/null && { echo >&1 ${cmd}; exit 0; }`;
        }
        try {
            return !!execSync(cmdString);
        } catch (e) {
            return false;
        }
    }
    return canRun(cmd);
}

/**
 * Checks if a process/task exists and is running
 */
function procRunning(proc) {
    let procString = '';
    if (isWindows) {
        const p = `${proc.replace(/\.exe/, '')}.exe`;
        procString = `TASKLIST /FI "STATUS eq RUNNING" |FIND "${p}" >NUL 2>&1`;
    } else {
        procString = `pgrep ${proc}`;
    }
    try {
        return !!execSync(procString);
    } catch (e) {
        return false;
    }
}

/**
 * Executes a function and returns a map of stdout, stderr, and the status
 */
function exec(cmd, args) {
    const { stdout, stderr, status } = spawnSync(cmd, args, { shell: true });

    return {
        status,
        stdout: stdout.toString(),
        stderr: stderr.toString(),
    };
}

/**
 * Converts the input number to a hex string prefixed with 0x
 * @param {Number} num -- the input value
 * @return {String} the hex string
 */
function toHex(num) {
    if (!Number.isInteger(num)) {
        throw new Error(`toHex must be called with an integral numeric value, input value [${num}] invalid`);
    } else {
        return `0x${num.toString(16)}`;
    }
}

/**
 * Checks if the input string is a hex string prefixed with 0x
 * @param {String} input - the input string
 * @return {boolean} true iff the string represents a hex string prefixed with 0x
 */
function isHex(input) {
    if (typeof input !== 'string') {
        return false;
    }

    // Now that we know it's a string, validate the prefix
    if (!input.startsWith('0x')) {
        return false;
    }

    const stripped = input.substring(2);
    const parsed = parseInt(stripped, 16);

    return parsed.toString(16) === stripped;
}

/**
 * Gets the config sent from the collector and parses it as JSON
 */
function getConfig() {
    if (MOOG_CREDS_AND_CONFIG === null) {
        // eslint-disable-next-line no-underscore-dangle
        if (process.stdin._readableState.highWaterMark > 0) {
            const buf = fs.readFileSync(process.stdin.fd, 'utf8');
            try {
                MOOG_CREDS_AND_CONFIG = JSON.parse(buf.toString());
            } catch (e) {
                warn('Unable to parse collector config via stdin');
            }
        }
    }
    if (
        MOOG_CREDS_AND_CONFIG === null
        || !MOOG_CREDS_AND_CONFIG.config
        || !(typeof MOOG_CREDS_AND_CONFIG.config === 'object')
    ) {
        return {};
    }
    return MOOG_CREDS_AND_CONFIG.config;
}

/**
 * Gets the credentials sent from the collector and parses it as JSON
 */
function getCredentials() {
    if (MOOG_CREDS_AND_CONFIG === null) {
        // eslint-disable-next-line no-underscore-dangle
        if (process.stdin._readableState.highWaterMark > 0) {
            const buf = fs.readFileSync(process.stdin.fd, 'utf8');
            try {
                MOOG_CREDS_AND_CONFIG = JSON.parse(buf.toString());
            } catch (e) {
                warn('Unable to parse collector config via stdin');
            }
        }
    }
    if (
        MOOG_CREDS_AND_CONFIG === null
        || !MOOG_CREDS_AND_CONFIG.credentials
        || !(typeof MOOG_CREDS_AND_CONFIG.credentials === 'object')
    ) {
        return {};
    }
    return MOOG_CREDS_AND_CONFIG.credentials;
}

/**
 * Exports our config back to the env var, which is then read and
 * persisted by the collector after execution
 */
function exportConfig(conf) {
    if (typeof conf === 'undefined' || conf === null) {
        debug('Received null conf, skipping');
    } else {
        const payload = {
            type: 'config',
            value: jsonParse(conf),
        };
        process.stdout.write(`${JSON.stringify(payload)}\n`);
    }
}

/**
 * Takes a function and calls if if the first input argument is the functions name
 * Useful when calling separate functions on different schedules for a scheduled collector
 */
function registerScheduled(func) {
    if (process.argv[2] === func.name) {
        // Shift over our command line args to the
        // user function doesn't need to be aware of shifting
        process.argv.splice(2, 1);

        // Off we go
        func();
        process.exit();
    }
}

/**
 * Marks our special return value, anything returned by this function
 * will be handled as data by the collector
 */
function sendResult(datum) {
    if (typeof datum === 'undefined' || datum === null) {
        debug('Received null datum, skipping');
    } else {
        const payload = {
            type: 'result',
            value: jsonParse(datum),
        };
        process.stdout.write(`${JSON.stringify(payload)}\n`);
    }
}

/**
 * Marks the return value as a discovery result
 */
function sendDiscovery(discovery) {
    // Do some validation
    if (typeof discovery === 'undefined' || discovery === null) {
        debug('Received null discovery result');
    } else if (discovery.constructor.name !== 'DiscoveryResult') {
        error(`Recieved invalid data in \`sendDiscovery\`, value must be a \`DiscoveryResult\` but received: ${typeof discovery}`);
    } else {
        // Validate the result
        try {
            discovery.validate();

            const payload = {
                type: 'discovery',
                value: jsonParse(discovery),
            };
            process.stdout.write(`${JSON.stringify(payload)}\n`);
        } catch (e) {
            error(`Received malformed Discovery Result - ${e.message}, cannot send`);
        }
    }
}

/**
 * Marks the return value as batch of metrics
 */
function sendMetrics(metrics) {
    // Do some validation
    if (typeof metrics === 'undefined' || metrics === null) {
        debug('Received null metrics, skipping');
    } else {
        let value = jsonParse(metrics);
        if (!Array.isArray(value)) value = [value];

        value = value.filter((m) => {
            try {
                if (m.constructor.name !== 'Metric') {
                    debug('Received element that was not a `Metric`, skipping it');
                    return false;
                }
                m.validate();
                return true;
            } catch (e) {
                debug(`Received malformed metric - ${e.message}, skipping`);
                return false;
            }
        });

        const payload = {
            type: 'metrics',
            value,
        };

        if (payload.value.length > 0) {
            process.stdout.write(`${JSON.stringify(payload)}\n`);
        }
    }
}

function sendEvents(events) {
    // Do some validation
    if (typeof events === 'undefined' || events === null) {
        debug('Received null events, skipping');
    } else {
        let value = jsonParse(events);
        if (!Array.isArray(value)) value = [value];

        value = value.filter((e) => {
            try {
                if (e.constructor.name !== 'Event') {
                    debug('Received element that was not an `Event`, skipping it');
                    return false;
                }

                e.validate();
                return true;
            } catch (err) {
                debug(`Received malformed event - ${err.message}, skipping`);
                return false;
            }
        });

        const payload = {
            type: 'events',
            value,
        };

        process.stdout.write(`${JSON.stringify(payload)}\n`);
    }
}

/**
 * JSONToKv - Builds an array of key-value pairs from nested JSON/BSON
 *
 * @param {Object} - A nested object of keys and values
 * @param {Object} - The array to be populated with KV pairs
 * @param {Function} - A function to format the key/value pairs
 * @param {String} - (Optional) the last key processed (for iteration)
 *
 */
function JSONToKv(object, array, func, lkey) {
    const keys = Object.keys(object);
    const lastkey = typeof lkey !== 'undefined' ? lkey : '';

    keys.forEach((element) => {
        if (typeof object[element] === 'string' && object[element] === '$numberlong') {
            array.push(func(element, object[element]));
        } else {
            const newkey = lastkey !== '' ? `${lastkey}_${element}` : element;

            if (typeof object[element] === 'number') {
                array.push(func(newkey, object[element]));
            }

            if (typeof object[element] === 'object') {
                JSONToKv(object[element], array, func, newkey);
            }
        }
    });
}

/**
 * Normalise/de-humanize a value
 *
 * Takes an input like "10Mb", "5 Kb" or "12.3Kb" and returns
 * a numeric value in bytes
 *
 * @param {string} str - The input string to format
 */
function dehumanize(humanStr) {
    const str = humanStr.replace(/ps/, '');
    const suf = str.replace(/[. 0-9]/g, '');
    let val = parseFloat(str.replace(/[^0-9.]/g, ''));

    switch (suf.toLowerCase()) {
        default:
        case 'b':
        case 'bi':
        case 'bytes':
            break;
        case 'k':
        case 'kb':
        case 'ki':
        case 'kib':
            val *= 1024;
            break;
        case 'm':
        case 'mb':
        case 'mi':
        case 'mib':
            val = val * 1024 * 1024;
            break;
        case 'g':
        case 'gb':
        case 'gi':
        case 'gib':
            val = val * 1024 * 1024 * 1024;
            break;
    }
    return val.toFixed();
}

/**
 * Takes an interval, function of arity 1, and a list of arguments to pass to the function
 * Calls the function with each argument in turn, spreading the calls across the supplied interval
 */
function carousel(interval, func, args) {
    // First do some checking
    if (typeof args === 'undefined' || args.length === 0) {
        error(`Supplied invalid args to \`carousel\`: ${args}`);
    } else if (typeof interval === 'undefined' || typeof interval !== 'number' || interval <= 0) {
        error(`Supplied invalid interval for \`carousel\`: ${interval}`);
    } else if (typeof func === 'undefined') {
        error('Supplied undefined function to `carousel`');
    } else {
        // Go for it
        const chunk = interval / args.length;
        let idx = 0;

        const callback = () => {
            func(args[idx]);
            idx = (idx + 1) % args.length;
        };

        setInterval(callback, chunk);
    }
}

/**
 * Filter based on an array of regex
 *
 * @param {string} item - The namespacestring we're testing
 * @param {array} flist - The array containing the list of regex's
 */
function passFilter(item, flist) {
    let ret = true;
    if (flist.length > 0) {
        if (item.search(flist.join('|')) >= 0) ret = false;
    }
    return ret;
}

/**
 * Filter based on an array of regex
 *
 * @param {string} item - The namespacestring we're testing
 * @param {array} flist - The array containing the list of strings or regex's
 * @returns {boolean}
 */
function isInFilters(item, filters) {
    // Return true if the item
    // is either an equality match or
    // a regex match in the filters.

    if (!Array.isArray(filters)) {
        return false;
    }

    const inFilters = false;

    for (let fIdx = 0; fIdx < filters.length; fIdx += 1) {
        const filter = filters[fIdx];
        if (/^(!)?\/.*\/$/.test(filter)) {
            const filterExtract = /^(?:!)?\/(.*)\/$/.exec(filter);
            try {
                const filterRe = new RegExp(filterExtract[1]);
                if (/^!/.test(filter)) {
                    // Testing for a not match
                    if (!filterRe.test(item)) {
                        debug(`${item} matches regex !${filterRe}`);
                        return true;
                    }
                    debug(`${item} excluded by not regex !${filterRe}`);
                } else if (filterRe.test(item)) {
                    debug(`${item} matches regex ${filterRe}`);
                    return true;
                } else {
                    debug(`${item} does not match regex ${filterRe}`);
                }
            } catch (e) {
                warn(`Failed to construct a regular expression from ${filterExtract[1]} ${e}`);
            }
        } else if (item === filter) {
            debug(`${item} has equality with ${filter}`);
            return true;
        }
    }
    return inFilters;
}

/**
 * Return the current MAR directory the collector was found in
 */
function getMarDir() {
    return path.dirname(process.argv[1]);
}

/**
 * Export our functions
 */
module.exports = {
    isWindows,
    isLinux,
    isMacOS,
    toHex,
    isHex,
    hasCmd,
    procRunning,
    exec,
    debug,
    info,
    warn,
    error,
    sendResult,
    sendDiscovery,
    sendMetrics,
    sendEvents,
    getConfig,
    getCredentials,
    exportConfig,
    registerScheduled,
    JSONToKv,
    dehumanize,
    carousel,
    passFilter,
    isInFilters,
    getMarDir,
};
