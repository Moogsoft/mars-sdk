'use strict';

/**
 * Metric and associated types for producing time series data from a MAR
 * @module Metric
 */
/* eslint camelcase: ["error", {allow: ["additional_data"]}] */

const { isHex } = require('./index');

/**
 * Valid metric types
 */
const VALID_METRIC_TYPES = ['c', 'g', 'counter', 'gauge'];

/**
 * A Metric is a point of timeseries data processed and anomalized on by the collector
 * @property {Number} data The datapoint of the metric
 * @property {String} metric The name of the metric
 * @property {String} source The source of the metric
 * @property {String} key [Optional] A key of the metric,
 *                 for example the specific core for a 'cpu' metric
 * @property {Number} time [Optional] The timestamp of the metric,
 *                 defaults to the current time
 * @property {String} description A description of the metric
 * @property {String} utc_offset [Optional] The timezone of the metric,
 *                 defaults to the current timezone
 * @property {Object} additional_data [Optional] A mapping of additional
 *                 contextual data for this metric
 * @property {Object} tags [Optional] Tag metadata for this metric
 * @property {String} type The type of the metric, must be one of COUNTER or GAUGE
 * @property {String} unit [Optional] An optional unit for this metric
 * @property {Number} window [Optional] Sets the window of this metric for the anti-datalake
 *                 settings of the collector
 */
class Metric {
    /**
     * Constructor
     */
    constructor() {
        this.data = undefined;
        this.metric = undefined;
        this.source = undefined;
        this.key = undefined;
        // eslint-disable-next-line camelcase
        this.utc_offset = undefined;
        this.description = undefined;
        this.additional_data = undefined;
        this.tags = undefined;
        this.type = undefined;
        this.unit = undefined;
        this.window = undefined;
        this.time = undefined;
    }

    /**
     * Sets the value of this metric
     * @param {Number} data
     */
    setData(data) {
        if (typeof data === 'string') {
            const parsed = parseFloat(data);
            this.data = Number.isNaN(parsed) ? null : parsed;
        } else {
            this.data = data;
        }
        return this;
    }

    /**
     * Sets the name of this metric
     * @param {String} name
     */
    setMetric(name) {
        this.metric = name;
        return this;
    }

    /**
     * Sets the source of this metric
     * @param {String} source
     */
    setSource(source) {
        this.source = source;
        return this;
    }

    /**
     * Sets the key for this metric
     * @param {String} key
     */
    setKey(key) {
        this.key = key;
        return this;
    }

    /**
     * Sets the timestamp for this metric, defaults to the current time
     * @param {Number} ts
     */
    setTime(ts) {
        this.time = ts;
        return this;
    }

    /**
     * Sets the description this for this metric
     * @param {String} desc
     */
    setDescription(desc) {
        this.description = desc;
        return this;
    }

    /**
     * Sets the UTC offset of this metric, defaults to the current timezone's offset
     * @param {String} offset
     */
    setUtcOffset(offset) {
        // eslint-disable-next-line camelcase
        this.utc_offset = offset;
        return this;
    }

    /**
     * Sets the additional data for this metric
     * @param {Object} ad
     */
    setAdditionalData(ad) {
        this.additional_data = ad;
        return this;
    }

    /**
     * Sets the tags for this metric
     * @param {Object} tags
     */
    setTags(tags) {
        this.tags = tags;
        return this;
    }

    /**
     * Sets a tag value in the tags object
     * @param {String} key
     * @param {Object} value
     */
    setTag(key, value) {
        if (this.tags == null) {
            this.tags = {};
        }

        this.tags[key] = value;

        return this;
    }

    /**
     * Sets the type of this metric
     * @param {String} type
     */
    setType(type) {
        this.type = type;
        return this;
    }

    /**
     * Sets the unit of this metric
     * @param {String} unit
     */
    setUnit(unit) {
        this.unit = unit;
        return this;
    }

    /**
     * Sets the window for this metric
     * @param {Number} window
     */
    setWindow(window) {
        this.window = window;
        return this;
    }

    /**
     * Sets the metric type to gauge
     */
    gauge() {
        this.type = 'gauge';
        return this;
    }

    /**
     * Sets the metric type to counter
     */
    counter() {
        this.type = 'counter';
        return this;
    }

    /**
     * Validates the metric, confirming it has values for
     * required fields, and provided values are appropriately typed
     */
    validate() {
        // Validate required fields
        if (this.data && this.data.constructor.name === 'Bitmask') {
            this.data.validate();
        } else if (!['number', 'boolean'].includes(typeof this.data) && !isHex(this.data) || Number.isNaN(this.data)) {
            throw new Error('A Bitmask, Number, Hex String, or Boolean value for field `data` is required');
        }

        if (typeof this.metric !== 'string') {
            throw new Error('A string value for field `metric` is required');
        }

        // Validate optional fields
        if (this.key && typeof this.key !== 'string') {
            throw new Error('`key` must be a string');
        }

        if (this.source && typeof this.source !== 'string') {
            throw new Error('`source` must be a string');
        }

        if (this.time && typeof this.time !== 'number') {
            throw new Error('`time` must be a number');
        }

        if (this.description && typeof this.description !== 'string') {
            throw new Error('`description` must be a string');
        }

        if (this.type && !VALID_METRIC_TYPES.includes(this.type)) {
            throw new Error('`type` must be one of [`c`, `g`, `counter`, `gauge`]');
        }

        if (this.utc_offset && typeof this.utc_offset !== 'string') {
            throw new Error('`utc_offset` must be a string');
        }

        if (this.unit && typeof this.unit !== 'string') {
            throw new Error('`unit` must be a string');
        }

        if (this.window && typeof this.window !== 'number') {
            throw new Error('`window` must be a number');
        }
    }
}

module.exports = {
    Metric,
};
