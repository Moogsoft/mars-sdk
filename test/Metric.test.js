/* eslint-disable global-require */

'use strict';

const { Metric } = require('../Metric');
const { Bitmask } = require('../Bitmask');

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

    it('should handle a special bitmask sub-validator', () => {
        const bitmask = new Bitmask();
        bitmask.validate = jest.fn();
        try {
            new Metric().setData(bitmask).validate();
        } catch (error) {
            // don't care
        }
        expect(bitmask.validate).toHaveBeenCalled();
    });

    it('validate: valid full metric', () => {
        const validMetric = new Metric()
            .setMetric('valid.metric.1')
            .setSource('localhost')
            .setData(10)
            .setDescription('A test metric')
            .setAdditionalData('Additional')
            .setTags({ banana: 'papaya' })
            .setTag('guava', 'pink')
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

    it('validate: NaN value', () => {
        const invalidMetric = new Metric()
            .setMetric('valid.metric.1')
            .setSource('localhost')
            .setData(NaN);

        expect(() => invalidMetric.validate()).toThrow('Field `data` may not be NaN');
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

    it('validate: invalid key type', () => {
        const invalidMetric = new Metric()
            .setMetric('test')
            .setData(true)
            .setKey(1.2);

        expect(() => invalidMetric.validate()).toThrow('`key` must be a string');
    });

    it('validate: invalid source type', () => {
        const invalidMetric = new Metric()
            .setMetric('test')
            .setData(true)
            .setKey('key')
            .setSource(99);

        expect(() => invalidMetric.validate()).toThrow('`source` must be a string');
    });

    it('validate: invalid time type', () => {
        const invalidMetric = new Metric()
            .setMetric('test')
            .setData(true)
            .setKey('key')
            .setSource('source')
            .setTime('time');

        expect(() => invalidMetric.validate()).toThrow('`time` must be a number');
    });

    it('validate: invalid description type', () => {
        const invalidMetric = new Metric()
            .setMetric('test')
            .setData(true)
            .setKey('key')
            .setSource('source')
            .setTime(1)
            .setDescription(2);

        expect(() => invalidMetric.validate()).toThrow('`description` must be a string');
    });

    it('validate: invalid utc_offset type', () => {
        const invalidMetric = new Metric()
            .setMetric('test')
            .setData(true)
            .setKey('key')
            .setSource('source')
            .setTime(1)
            .setDescription('desc')
            .setUtcOffset(45);

        expect(() => invalidMetric.validate()).toThrow('`utc_offset` must be a string');
    });

    it('validate: invalid unit type', () => {
        const invalidMetric = new Metric()
            .setMetric('test')
            .setData(true)
            .setKey('key')
            .setSource('source')
            .setTime(1)
            .setDescription('desc')
            .setUtcOffset('45')
            .setUnit(2);

        expect(() => invalidMetric.validate()).toThrow('`unit` must be a string');
    });

    it('validate: invalid window type', () => {
        const invalidMetric = new Metric()
            .setMetric('test')
            .setData(true)
            .setKey('key')
            .setSource('source')
            .setTime(1)
            .setDescription('desc')
            .setUtcOffset('45')
            .setUnit('ee')
            .setWindow('window');

        expect(() => invalidMetric.validate()).toThrow('`window` must be a number');
    });
});

it('should allow creation from an existing object', () => {
    const metric = {
        data: 99,
        metric: 'metric',
        source: 'source',
        key: 'key',
        // eslint-disable-next-line camelcase
        utc_offset: 'utc_offset',
        description: 'description',
        additional_data: 'additional_data',
        tags: 'tags',
        type: 'type',
        unit: 'unit',
        window: 'window',
        time: 'time',
    };
    const keys = Object.keys(metric);
    expect.assertions(keys.length);
    const m = Metric.from(metric);
    keys.forEach((key) => {
        expect(m[key]).toBe(metric[key]);
    });
});

it('should allow creation from an empty object', () => {
    const metric = {};
    const m = Metric.from(metric);
    expect(m).toEqual(metric);
});

it('should set to gauge', () => {
    const m = new Metric().gauge();
    expect(m.type).toBe('gauge');
});

it('should set a single initial tag', () => {
    const m = new Metric().setTag('foo', 'bar');
    expect(typeof m.tags).toBe('object');
});
