'use strict';

/**
 * @module Reason
 */

/**
 * A Reason provides insight into why discovery of a MAR failed, potentially including details on
 * how to remediate this if the reason is `recoverable`
 * @property {boolean} recoverable Is this failure recoverable with user intervention?
 * @property {String} msg A short description of why discovery failed
 * @property {String} type The type of failure, used to categorize in the UI,
 *                 such as "Missing Credentials"
 */
class Reason {
    /**
     * Constructor
     */
    constructor() {
        this.recoverable = undefined;
        this.msg = undefined;
        this.type = undefined;
    }

    /**
     * Mark whether this failure is recoverable or not
     * @param {boolean} recoverable
     */
    setRecoverable(recoverable) {
        this.recoverable = recoverable;
        return this;
    }

    /**
     * Add a message as to why discovery failed
     * @param {String} msg
     */
    setMsg(msg) {
        this.msg = msg;
        return this;
    }

    /**
     * Categorize the type of discovery failure,
     * e.g: "Missing Credentials" or "No such process found"
     * TODO: Harden this into specific types
     * @param {String} type
     */
    setType(type) {
        this.type = type;
        return this;
    }

    /**
     * Validates the fields are set correctly
     */
    validate() {
        if (this.recoverable == null) {
            throw new Error('Field `recoverable` must be set');
        }

        if (typeof this.recoverable !== 'boolean') {
            throw new Error('Field `recoverable` must be a boolean');
        }

        if (this.msg == null) {
            throw new Error('Field `msg` must be set to a string');
        }

        if (typeof this.msg !== 'string') {
            throw new Error('Field `msg` must be a string');
        }

        if (this.type == null) {
            throw new Error('Field `type` must be set to a string');
        }

        if (typeof this.type !== 'string') {
            throw new Error('Field `type` must be a string');
        }
    }
}

module.exports = {
    Reason,
};
