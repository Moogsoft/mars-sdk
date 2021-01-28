'use strict';

const { Reason } = require('../Reason');

describe('Reason', () => {
    describe('validate', () => {
        let recoverable;
        let msg;
        let type;
        const validator = () => new Reason()
            .setRecoverable(recoverable)
            .setMsg(msg)
            .setType(type)
            .validate();
        beforeEach(() => {
            recoverable = true;
            msg = 'msg';
            type = 'type';
        });

        it('should allow a valid config', () => {
            expect(validator).not.toThrow();
        });

        it('should fail an empty a valid config', () => {
            recoverable = undefined;
            msg = undefined;
            type = undefined;
            expect(validator).toThrow();
        });

        it('should throw if recoverable is not set correctly', () => {
            recoverable = 77;
            expect(validator).toThrow('recoverable');
        });

        it('should throw if msg is not set correctly', () => {
            msg = 77;
            expect(validator).toThrow('msg');
            msg = undefined;
            expect(validator).toThrow('msg');
        });
        it('should throw if type is not set correctly', () => {
            type = 77;
            expect(validator).toThrow('type');
            type = null;
            expect(validator).toThrow('type');
        });
    });
});
