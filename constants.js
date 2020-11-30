'use strict';

/**
 * The constants module exposes common constants used during discovery and collection.
 * @module constants
 */

const INSUFFICIENT_PRIVILEGES = 'Insufficient Privileges';
const INVALID_CREDENTIALS = 'Invalid Credentials';
const MISSING_CREDENTIALS = 'Missing Credentials';
const MISSING_PROCESS = 'Missing Process';
const MISSING_COMMAND = 'Missing Command';
const NO_HTTP_RESPONSE = 'No http(s) response';
const MISSING_CONFIG = 'Missing configuration item';
const INVALID_CONFIG = 'Invalid configuration value';
const TIMEOUT = 'Timeout';
const COUNTER = 'c';
const GAUGE = 'g';

module.exports = {
    INSUFFICIENT_PRIVILEGES,
    INVALID_CREDENTIALS,
    MISSING_CREDENTIALS,
    MISSING_COMMAND,
    MISSING_PROCESS,
    NO_HTTP_RESPONSE,
    MISSING_CONFIG,
    INVALID_CONFIG,
    TIMEOUT,
    COUNTER,
    GAUGE,
};
