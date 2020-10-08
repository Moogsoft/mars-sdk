'use strict';

/**
 * Metric and associated types for producing time series data from a MAR
 * @module Metric
 */
/* eslint camelcase: ["error", {allow: ["additional_data"]}] */

/**
  * A Metric is a point of timeseries data processed and anomalized on by the collector
  * @property {Number} value The datapoint of the metric
  * @property {String} name The name of the metric
  * @property {String} source The source of the metric
  * @property {String} key [Optional] A key of the metric,
  *                 for example the specific core for a 'cpu' metric
  * @property {Number} timestamp [Optional] The timestamp of the metric,
  *                 defaults to the current time
  * @property {String} description A description of the metric
  * @property {String} timezone [Optional] The timezone of the metric,
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
        this.value = undefined;
        this.name = undefined;
        this.source = undefined;
        this.key = undefined;
        this.timestamp = undefined;
        this.description = undefined;
        this.timezone = undefined;
        this.additional_data = undefined;
        this.tags = undefined;
        this.type = undefined;
        this.unit = undefined;
        this.window = undefined;
    }

    /**
     * Sets the value of this metric
     * @param {Number} value
     */
    setValue(value) {
        this.value = value;
        return this;
    }

    /**
     * Sets the name of this metric
     * @param {String} name
     */
    setName(name) {
        this.name = name;
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
    setTimestamp(ts) {
        this.timestamp = ts;
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
     * Sets the timezone of this metric, defaults to the current timezone
     * @param {String} tz
     */
    setTimezone(tz) {
        this.timezone = tz;
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
     * Constructs and returns a Metric
     */
    build() {
        if (this.value == null) {
            throw new Error('`value` must be set in metric');
        } else if (this.name == null) {
            throw new Error('`name` must be set in metric');
        } else {
            return {
                value: this.value,
                name: this.name,
                source: this.source,
                key: this.key,
                timestamp: this.timestamp,
                description: this.description,
                timezone: this.timezone,
                additional_data: this.additional_data,
                tags: this.tags,
                type: this.type,
                unit: this.unit,
                window: this.window,
            };
        }
    }

    static builder() {
        return new Metric();
    }
}

module.exports = {
    Metric,
};
