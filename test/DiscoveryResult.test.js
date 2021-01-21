'use strict';

const { DiscoveryResult } = require('../DiscoveryResult');
const { Reason } = require('../Reason');

describe('DiscoveryResult', () => {
    describe('validate', () => {
        let moob;
        let reason;
        let active;
        const validator = () => new DiscoveryResult()
            .setMoob(moob)
            .setReason(reason)
            .setActive(active)
            .validate();
        beforeEach(() => {
            moob = 'moob';
            reason = new Reason();
            reason.validate = jest.fn();
            active = true;
        });

        it('should allow a valid config', () => {
            expect(validator).not.toThrow();
        });

        it('should fail an empty a valid config', () => {
            moob = undefined;
            reason = undefined;
            active = undefined;
            expect(validator).toThrow();
        });

        it('should throw if active is not set correctly', () => {
            active = 77;
            expect(validator).toThrow('active');
            active = undefined;
            expect(validator).toThrow('active');
        });

        it('should throw if moobs are not set correctly', () => {
            moob = null;
            expect(validator).toThrow('No moobs provided for active DiscoveryResult');
            moob = 99;
            expect(validator).toThrow('non-string moob');
        });

        it('should throw if type is not set correctly', () => {
            reason = 77;
            expect(validator).toThrow('reason');
        });
    });
});
