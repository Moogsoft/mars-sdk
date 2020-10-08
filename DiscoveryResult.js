'use strict';

/**
  * A DiscoveryResult controls what MARs a collector will run, potentially also providing
  * some insight as to why a MAR is not being run as well as steps to enable it.
  * @module DiscoveryResult
  * @property {Object} moobs A list of moobs to run in this MAR if multiple are supported
  * @property {String} moob  The moob to run in this MAR
  * @property {Reason} reason An optional Reason as to why this MAR's discovery is negative
  * @property {boolean} active A flag indicating if this MAR should be run or not
  */
class DiscoveryResult {
    /**
     * Constructor for a DiscoveryResult, though usually the builder methods should be used instead
     */
    constructor() {
        this.moobs = undefined;
        this.moob = undefined;
        this.reason = undefined;
        this.active = undefined;
    }

    /**
     * Add an array of moobs to the builder
     * @param {Object} moobs An array of strings
     */
    setMoobs(moobs) {
        this.moobs = moobs;
        return this;
    }

    /**
     * Add a moob to the builder
     * @param {String} moob
     */
    setMoob(moob) {
        this.moob = moob;
        return this;
    }

    /**
     * Add a Reason to the builder as to why discovery failed
     * @param {Reason} reason
     */
    setReason(reason) {
        this.reasonDetail = reason;
        return this;
    }

    /**
     * Mark this MAR active or not
     * @param {boolean} active
     */
    setActive(active) {
        this.active = active;
        return this;
    }

    /**
     * Constructs the DiscoveryResult
     */
    build() {
        if (this.active == null) {
            throw new Error('must set `active` in DiscoveryResult');
        }

        return {
            moobs: this.moobs,
            moob: this.moob,
            active: this.active,
            reasonDetail: this.reasonDetail,
        };
    }

    /**
     * Returns a fresh builder instance for creating a DiscoveryResult
     */
    static builder() {
        return new DiscoveryResult();
    }
}

module.exports = {
    DiscoveryResult,
};
