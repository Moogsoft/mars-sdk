'use strict';

/**
  * @module DiscoveryResult
  */

/**
 * A DiscoveryResult controls what MARs a collector will run, potentially also providing
 * some insight as to why a MAR is not being run as well as steps to enable it.
 * @property {Array} moobs A list of moobs to run in this MAR if multiple are supported
 * @property {Reason} reasonDetail An optional Reason as to why this MAR's discovery is negative
 * @property {boolean} active A flag indicating if this MAR should be run or not
 */
class DiscoveryResult {
    /**
     * Constructor
     */
    constructor() {
        this.moobs = undefined;
        this.reasonDetail = undefined;
        this.active = undefined;
    }

    /**
     * Add a moob to the builder
     * @param {String} moob
     */
    setMoob(moob) {
        if (moob != null) {
            if (this.moobs == null) {
                this.moobs = [moob];
            } else {
                this.moobs.push(moob);
            }
        }
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
     * Validates the discovery result for correctness
     */
    validate() {
        if (this.active == null) {
            throw new Error('Field `active` unset but required');
        }

        if (typeof this.active !== 'boolean') {
            throw new Error('Field `active` must be a boolean');
        }

        if (this.active) {
            if (this.moobs == null || this.moobs.length === 0) {
                throw new Error('No moobs provided for active DiscoveryResult, must set at least one moob with `setMoob`');
            }

            this.moobs.forEach((moob) => {
                if (moob == null) {
                    throw new Error('null moob provided for active DiscoveryResult, all moobs must be non-empty strings');
                }
                if (typeof moob !== 'string') {
                    throw new Error(`non-string moob: ${moob} for active DiscoveryResult, all moobs must be non-empty strings`);
                }

                if (!moob) {
                    throw new Error('empty moob provided for active DiscoveryResult, all moobs must be non-empty strings');
                }
            });
        }

        if (this.reasonDetail != null && this.reasonDetail.constructor.name !== 'Reason') {
            throw new Error('reason must be of type `Reason`');
        } else if (this.reasonDetail != null) {
            this.reasonDetail.validate();
        }
    }
}

module.exports = {
    DiscoveryResult,
};
