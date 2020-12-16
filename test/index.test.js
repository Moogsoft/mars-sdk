/* eslint-disable global-require */

'use strict';

const utils = require('../index');
const { Metric } = require('../Metric');
const { Event } = require('../Event');
const { DiscoveryResult } = require('../DiscoveryResult');
const { Reason } = require('../Reason');

describe('Log Methods', () => {
    let stdout;

    beforeEach(() => {
        stdout = require('test-console').stdout;
    });

    it('debug', () => {
        // Write and capture the output
        const output = stdout.inspectSync(() => {
            utils.debug('test');
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({ type: 'log', level: 'debug', msg: 'test' });
    });

    it('info', () => {
        // Write and capture the output
        const output = stdout.inspectSync(() => {
            utils.info('test');
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({ type: 'log', level: 'info', msg: 'test' });
    });

    it('warn', () => {
        // Write and capture the output
        const output = stdout.inspectSync(() => {
            utils.warn('test');
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({ type: 'log', level: 'warn', msg: 'test' });
    });

    it('error', () => {
        // Write and capture the output
        const output = stdout.inspectSync(() => {
            utils.error('test');
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({ type: 'log', level: 'error', msg: 'test' });
    });

    it('info: log object', () => {
        // Write and capture the output
        const output = stdout.inspectSync(() => {
            utils.info({ key: 'value' });
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({ type: 'log', level: 'info', msg: '{"key":"value"}' });
    });

    it('debug: log array', () => {
        // Write and capture the output
        const output = stdout.inspectSync(() => {
            utils.debug([1, 2, 3]);
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({ type: 'log', level: 'debug', msg: '[1,2,3]' });
    });
});

describe('Sender Methods', () => {
    let stdout;

    beforeEach(() => {
        stdout = require('test-console').stdout;
    });

    it('sendMetrics: single', () => {
        const metric = new Metric()
            .setMetric('metric')
            .setData(1.0)
            .setSource('localhost');

        // Write and capture
        const output = stdout.inspectSync(() => {
            utils.sendMetrics(metric);
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({ type: 'metrics', value: [{ metric: 'metric', source: 'localhost', data: 1.0 }] });
    });

    it('sendMetrics: single invalid', () => {
        const metric = new Metric()
            .setData(1.0)
            .setSource('localhost');

        // Write and capture
        const output = stdout.inspectSync(() => {
            utils.sendMetrics(metric);
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({ level: 'debug', msg: 'Received malformed metric - A string value for field `metric` is required, skipping', type: 'log' });
    });

    it('sendMetrics: batch', () => {
        const metrics = Array(2).fill().map((_, i) => new Metric()
            .setMetric('test')
            .setSource('localhost')
            .setData(i));

        const output = stdout.inspectSync(() => {
            utils.sendMetrics(metrics);
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({ type: 'metrics', value: [{ metric: 'test', source: 'localhost', data: 0 }, { metric: 'test', source: 'localhost', data: 1 }] });
    });

    it('sendMetrics: mixed batch', () => {
        const goodMetric = new Metric()
            .setMetric('good')
            .setSource('localhost')
            .setData(false);

        const badMetric = new Metric()
            .setMetric('good')
            .setSource('localhost')
            .setData('bad');

        const metrics = [goodMetric, badMetric];

        const output = stdout.inspectSync(() => {
            utils.sendMetrics(metrics);
        });

        expect(output).toStrictEqual([
            '{"type":"log","level":"debug","msg":"Received malformed metric - A Bitmask, Number, Hex String, or Boolean value for field `data` is required, skipping"}\n',
            '{"type":"metrics","value":[{"data":false,"metric":"good","source":"localhost"}]}\n',
        ]);
    });

    it('sendEvents: single', () => {
        const event = new Event()
            .setSeverity('warning')
            .setSource('test')
            .setDescription('test')
            .setCheck('test')
            .setClass('class');

        const output = stdout.inspectSync(() => {
            utils.sendEvents(event);
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({
            type: 'events',
            value: [{
                severity: 'warning', source: 'test', description: 'test', check: 'test', class: 'class',
            }],
        });
    });

    it('sendEvents: batch', () => {
        const events = Array(2).fill().map((_, i) => new Event()
            .setSeverity('warning')
            .setSource('test')
            .setDescription(`test${i}`)
            .setCheck('test'));

        const output = stdout.inspectSync(() => {
            utils.sendEvents(events);
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({
            type: 'events',
            value: [{
                severity: 'warning', source: 'test', description: 'test0', check: 'test',
            }, {
                severity: 'warning', source: 'test', description: 'test1', check: 'test',
            }],
        });
    });

    it('sendEvents: batch with invalid', () => {
        const valid = new Event().setSeverity('WARNING').setSource('test').setCheck('check')
            .setDescription('test');
        const badSev = new Event().setSeverity('bad').setSource('test').setCheck('check')
            .setDescription('test');
        const noSource = new Event().setSeverity('WARNING').setCheck('check').setDescription('test');

        const output = stdout.inspectSync(() => {
            utils.sendEvents([valid, badSev, noSource]);
        });

        const actual = output.map((val) => JSON.parse(val.trim()));

        const one = { type: 'log', level: 'debug', msg: 'Received malformed event - string `severity` must be set to one of [clear,unknown,minor,warning,major,critical], skipping' };
        const two = { type: 'log', level: 'debug', msg: 'Received malformed event - `source` must be set to a non-empty string, skipping' };
        const three = {
            type: 'events',
            value: [{
                check: 'check', description: 'test', severity: 'warning', source: 'test',
            }],
        };

        expect(actual).toStrictEqual([one, two, three]);
    });

    it('sendDiscovery: inactive', () => {
        const reason = new Reason()
            .setRecoverable(true)
            .setMsg('badness')
            .setType('unknown');

        const disco = new DiscoveryResult()
            .setActive(false)
            .setReason(reason);

        const output = stdout.inspectSync(() => {
            utils.sendDiscovery(disco);
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({ type: 'discovery', value: { active: false, reasonDetail: { msg: 'badness', recoverable: true, type: 'unknown' } } });
    });

    it('sendDiscovery: active', () => {
        const disco = new DiscoveryResult()
            .setActive(true)
            .setMoob('test');

        const output = stdout.inspectSync(() => {
            utils.sendDiscovery(disco);
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({ type: 'discovery', value: { active: true, moobs: ['test'] } });
    });

    it('sendDiscovery: invalid', () => {
        const disco = new DiscoveryResult();

        const output = stdout.inspectSync(() => {
            utils.sendDiscovery(disco);
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({ type: 'log', level: 'error', msg: 'Received malformed Discovery Result - Field `active` unset but required, cannot send' });
    });

    it('exportConfig', () => {
        const output = stdout.inspectSync(() => {
            utils.exportConfig({ hello: 'world' });
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({ type: 'config', value: { hello: 'world' } });
    });
});

describe('utilities', () => {
    it('JSONtoKv', () => {
        const json = { one: 1, two: 2, nested: { three: 3 } };

        const array = [];
        utils.JSONToKv(json, array, (_, val) => 2 * val, undefined);

        expect(array).toStrictEqual([2, 4, 6]);
    });

    it('dehumanize', () => {
        expect(utils.dehumanize('10b')).toBe('10');
        expect(utils.dehumanize('10kb')).toBe('10240');
        expect(utils.dehumanize('10mb')).toBe('10485760');
        expect(utils.dehumanize('10gb')).toBe('10737418240');
    });

    it('passFilter', () => {
        expect(utils.passFilter('hello', ['/h*/', '/\\w/'])).toBe(true);
    });

    it('isInFilters', () => {
        expect(utils.isInFilters('hello', ['/h*/', '/\\w/'])).toBe(true);
    });

    it('toHex', () => {
        expect(utils.toHex(1)).toBe('0x1');
        expect(utils.toHex(15)).toBe('0xf');
        expect(() => utils.toHex(15.1)).toThrow('toHex must be called with an integral numeric value, input value [15.1] invalid');
        expect(() => utils.toHex('test')).toThrow('toHex must be called with an integral numeric value, input value [test] invalid');
    });

    it('isHex', () => {
        expect(utils.isHex('abc')).toBe(false);
        expect(utils.isHex('0xabc')).toBe(true);
        expect(utils.isHex('0xqqq')).toBe(false);
        expect(utils.isHex('')).toBe(false);
        expect(utils.isHex(1)).toBe(false);
    });
});
