/* eslint-disable global-require */

'use strict';

const { Bitmask } = require('../Bitmask');

describe('Validation Method', () => {
    it('validate: valid bitmask', () => {
        const validBitmask = new Bitmask()
            .setKeys(['key1', 'key2'])
            .setValues([true, true]);

        expect(() => validBitmask.validate()).not.toThrow();
    });

    it('validate: missing keys', () => {
        const validBitmask = new Bitmask()
            .setValues([true, true]);

        expect(() => validBitmask.validate()).toThrow('A Bitmask `value` object must contain `keys` and `values` lists of equal length');
    });

    it('validate: invalid values', () => {
        const validBitmask = new Bitmask()
            .addValue('key', true)
            .addValue('key2', 10);

        expect(() => validBitmask.validate()).toThrow('Bitmask `values` must be booleans');
    });
});
