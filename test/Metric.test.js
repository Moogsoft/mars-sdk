/* eslint-disable global-require */

'use strict';

const { Metric } = require('../Metric');

describe('Validation Method', () => {
    it('setData: numeric string', () => {
        const validMetric = new Metric()
            .setData('10.05')
            .setMetric('valid.metric')
            .setSource('jest');

        expect(validMetric.data).toBe(10.05);
        expect(() => validMetric.validate()).not.toThrow();
    });

    it('setData: invalid string', () => {
        const validMetric = new Metric()
            .setData('string')
            .setMetric('valid.metric')
            .setSource('jest');

        expect(validMetric.data).toBe(null);
        expect(() => validMetric.validate()).toThrow('A Bitmask, Number, Hex String, or Boolean value for field `data` is required');
    });

    it('validate: valid full metric', () => {
        const validMetric = new Metric()
            .setMetric('valid.metric.1')
            .setSource('localhost')
            .setData(10)
            .setDescription('A test metric')
            .setKey('disk1')
            .setTime(1602650044)
            .setUtcOffset('pst')
            .setUnit('mb')
            .setWindow(100)
            .counter();

        expect(() => validMetric.validate()).not.toThrow();
    });

    it('validate: valid partial metric', () => {
        const validMetric = new Metric()
            .setMetric('valid.metric.1')
            .setSource('localhost')
            .setData(true);

        expect(() => validMetric.validate()).not.toThrow();
    });

    it('validate: invalid metric value', () => {
        const invalidMetric = new Metric()
            .setMetric('valid.metric.1')
            .setSource('localhost')
            .setData('bad');

        expect(() => invalidMetric.validate()).toThrow('A Bitmask, Number, Hex String, or Boolean value for field `data` is required');
    });

    it('validate: missing metric name', () => {
        const invalidMetric = new Metric()
            .setSource('localhost')
            .setData(true);

        expect(() => invalidMetric.validate()).toThrow('A string value for field `metric` is required');
    });

    it('validate: hex string', () => {
        const validMetric = new Metric()
            .setMetric('valid.metric.1')
            .setSource('localhost')
            .setData('0xFF')
            .setDescription('A test metric')
            .setKey('disk1')
            .setTime(1602650044)
            .setUtcOffset('pst')
            .setUnit('mb')
            .setWindow(100)
            .counter();

        expect(() => validMetric.validate()).not.toThrow();
    });

    it('validate: invalid metric type', () => {
        const invalidMetric = new Metric()
            .setMetric('test')
            .setSource('localhost')
            .setData(true)
            .setType('aldsf');

        expect(() => invalidMetric.validate()).toThrow('`type` must be one of [`c`, `g`, `counter`, `gauge`]');
    });
});
