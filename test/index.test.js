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
});

describe('Sender Methods', () => {
    let stdout;

    beforeEach(() => {
        stdout = require('test-console').stdout;
    });

    it('sendMetrics: single', () => {
        const metric = Metric.builder()
            .setName('metric')
            .setValue(1.0)
            .setSource('localhost')
            .build();

        // Write and capture
        const output = stdout.inspectSync(() => {
            utils.sendMetrics(metric);
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({ type: 'metrics', value: [{ name: 'metric', source: 'localhost', value: 1.0 }] });
    });

    it('sendMetrics: batch', () => {
        const metrics = Array(2).fill().map((_, i) => Metric.builder()
            .setName('test')
            .setSource('localhost')
            .setValue(i)
            .build());

        const output = stdout.inspectSync(() => {
            utils.sendMetrics(metrics);
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({ type: 'metrics', value: [{ name: 'test', source: 'localhost', value: 0 }, { name: 'test', source: 'localhost', value: 1 }] });
    });

    it('sendEvents: single', () => {
        const event = Event.builder()
            .setSeverity('WARNING')
            .setSource('test')
            .setDescription('test')
            .setCheck('test')
            .build();

        const output = stdout.inspectSync(() => {
            utils.sendEvents(event);
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({
            type: 'events',
            value: [{
                severity: 'WARNING', source: 'test', description: 'test', check: 'test',
            }],
        });
    });

    it('sendEvents: batch', () => {
        const events = Array(2).fill().map((_, i) => Event.builder()
            .setSeverity('WARNING')
            .setSource('test')
            .setDescription(`test${i}`)
            .setCheck('test')
            .build());

        const output = stdout.inspectSync(() => {
            utils.sendEvents(events);
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({
            type: 'events',
            value: [{
                severity: 'WARNING', source: 'test', description: 'test0', check: 'test',
            }, {
                severity: 'WARNING', source: 'test', description: 'test1', check: 'test',
            }],
        });
    });

    it('sendDiscovery: inactive', () => {
        const reason = Reason.builder()
            .setRecoverable(true)
            .setMsg('badness')
            .setType('unknown')
            .build();

        const disco = DiscoveryResult.builder()
            .setActive(false)
            .setReason(reason)
            .build();

        const output = stdout.inspectSync(() => {
            utils.sendDiscovery(disco);
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({ type: 'discovery', value: { active: false, reasonDetail: { msg: 'badness', recoverable: true, type: 'unknown' } } });
    });

    it('sendDiscovery: active', () => {
        const disco = DiscoveryResult.builder()
            .setActive(true)
            .setMoob('test')
            .build();

        const output = stdout.inspectSync(() => {
            utils.sendDiscovery(disco);
        });

        const actual = JSON.parse(output);

        expect(actual).toStrictEqual({ type: 'discovery', value: { active: true, moob: 'test' } });
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
});
