'use strict';

/**
 * A Reason provides insight into why discovery of a MAR failed, potentially including details on
 * how to remediate this if the reason is `recoverable`
 * @module Reason
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
     * Construct and return a Reason
     */
    build() {
        return {
            recoverable: this.recoverable,
            msg: this.msg,
            type: this.type,
        };
    }

    /**
     * Returns a new ReasonBuilder instance
     */
    static builder() {
        return new Reason();
    }
}

module.exports = {
    Reason,
};
