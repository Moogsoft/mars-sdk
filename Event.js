'use strict';

/**
 * Event class for sending events from a MAR
 * @module Event
 */
/* eslint camelcase: ["error", {allow: ["utc_offset","dedupe_key"]}] */

/**
  * An Event sent upstream by the collector for processing in Express,
  * goes through the Alert phase and deduplication into an Incident
  * @property {String} severity One of INDETERMINATE, MINOR, WARNING, MAJOR, CRITICAL
  * @property {String} source The source of the event, which could be something like a hostname,
  *                 a service name, etc
  * @property {String} check The check that failed to generate this event, for example "cpu load"
  * @property {String} description A description of the event
  * @property {Number} time The timestamp of the event, if omitted defaults to the current time
  * @param {String} utc_offset The UTC offset of the data, for example +01:00,
  *                 defaults to the current TZ
  * @property {String} dedupe_key [Optional] The deduplication key of this event,
  * used when processing into an Incident
  * @property {String} manager [Optional] The manager of this event
  * @property {Object} service [Optional] An array of services impacted by this event
  * @property {String} alias [Optional] An alias for this event
  * @property {String} clazz [Optional] The class of this event,
  *                 for example Storage, AWS, Network, etc
  * @property {Object} tags [Optional] Key-value pairs of metadata for the event
  */
class Event {
    /**
     * Constructor
     */

    constructor() {
        this.severity = undefined;
        this.source = undefined;
        this.check = undefined;
        this.description = undefined;
        this.time = undefined;
        this.utc_offset = undefined;
        this.dedupe_key = undefined;
        this.manager = undefined;
        this.service = undefined;
        this.alias = undefined;
        this.class = undefined;
        this.tags = undefined;
    }

    /**
     * The severity of the event, must be one of: INDETERMINANT, MINOR, WARNING, MAJOR, or CRITICAL
     * @param {String} sev
     */
    setSeverity(sev) {
        this.severity = sev;
        return this;
    }

    /**
     * The source of the event
     * @param {String} source
     */
    setSource(source) {
        this.source = source;
        return this;
    }

    /**
     * The check of the event
     * @param {String} check
     */
    setCheck(check) {
        this.check = check;
        return this;
    }

    /**
     * Add a description to the event
     * @param {String} desc
     */
    setDescription(desc) {
        this.description = desc;
        return this;
    }

    /**
     * Set the timestamp of the event, defaults to the current time
     * @param {Number} ts
     */
    setTime(ts) {
        this.time = ts;
        return this;
    }

    /**
     * Set the UTC offset for the event, such as -01:00, defaults to the current timezone offset
     * @param {String} utc
     */
    setUtcOffset(utc) {
        this.utc_offset = utc;
        return this;
    }

    /**
     * Set the dedupe key for the event
     * @param {String} dedupe
     */
    setDedupeKey(dedupe) {
        this.dedupe_key = dedupe;
        return this;
    }

    /**
     * Sets the manager for the event
     * @param {String} manager
     */
    setManager(manager) {
        this.manager = manager;
        return this;
    }

    /**
     * Sets an array of services impacted by the event
     * @param {Object} service
     */
    setService(service) {
        this.service = service;
        return this;
    }

    /**
     * Sets the alias of the event
     * @param {String} alias
     */
    setAlias(alias) {
        this.alias = alias;
        return this;
    }

    /**
     * Sets the class of the event
     * @param {String} clazz
     */
    setClass(clazz) {
        this.class = clazz;
        return this;
    }

    /**
     * Sets the tags for this event
     * @param {Object} tags
     */
    setTags(tags) {
        this.tags = tags;
        return this;
    }

    /**
     * Construct and return a new Event
     */
    build() {
        if (this.severity == null) {
            throw new Error('`severity` must be set to one of [INDETERMINANT, MINOR, WARNING, MAJOR, CRITICAL]');
        } else if (this.source == null) {
            throw new Error('`source` must be set in event');
        } else if (this.check == null) {
            throw new Error('`check` must be set in event');
        } else if (this.description == null) {
            throw new Error('`description` must be set in event');
        } else {
            return {
                severity: this.severity,
                source: this.source,
                check: this.check,
                description: this.description,
                time: this.time,
                utc_offset: this.utc_offset,
                dedupe_key: this.dedupe_key,
                manager: this.manager,
                service: this.service,
                alias: this.alias,
                class: this.class,
                tags: this.tags,
            };
        }
    }

    static builder() {
        return new Event();
    }
}

module.exports = {
    Event,
};
