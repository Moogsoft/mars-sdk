/* eslint-disable global-require */

'use strict';

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const { Metric } = require('../Metric');
const { Event } = require('../Event');
const { DiscoveryResult } = require('../DiscoveryResult');
const { Reason } = require('../Reason');

const utils = require('../index');

jest.mock('path', () => ({
    dirname: jest.fn(),
}));

jest.mock('fs', () => ({
    constants: {
        F_OK: 'F_OK',
        X_OK: 'X_OK',
        R_OK: 'R_OK',
    },
    accessSync: jest.fn(),
    readFileSync: jest.fn(),
}));

afterEach(() => {
    jest.resetAllMocks();
});

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

        events.push('ignored');

        const output = stdout.inspectSync(() => {
            utils.sendEvents(events);
        });

        const actual = JSON.parse(output[1]);

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

    it('sendEvents: empty', () => {
        const output = stdout.inspectSync(() => {
            utils.sendEvents();
        });

        const actual = JSON.parse(output);

        expect(actual.msg).toMatch('Received null events, skipping');
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
    describe('hasCmd', () => {
        let execSpy;
        beforeEach(() => {
            execSpy = jest.spyOn(childProcess, 'execSync').mockImplementation(() => true);
        });

        it('should check if user can run an existing file', () => {
            expect(utils.hasCmd('guava')).toBe(true);
            fs.accessSync
                .mockImplementationOnce(() => true)
                .mockImplementationOnce(() => {
                    throw new Error();
                });
            expect(utils.hasCmd('pineapple')).toBe(false);
        });

        it('should build a *nix command', () => {
            fs.accessSync.mockImplementationOnce(() => {
                throw new Error();
            });
            utils.hasCmd('papaya');
            expect(execSpy).toHaveBeenCalledWith('command -v papaya 2>/dev/null && { echo >&1 papaya; exit 0; }');
        });

        it('should failover', () => {
            fs.accessSync.mockImplementationOnce(() => {
                throw new Error();
            });
            execSpy.mockImplementationOnce(() => {
                throw new Error();
            });
            expect(utils.procRunning('banana')).toBe(false);
        });
    });

    describe('procRunning', () => {
        let execSpy;
        beforeEach(() => {
            execSpy = jest.spyOn(childProcess, 'execSync').mockImplementation(() => true);
        });

        it('should get *nix processes', () => {
            utils.procRunning('passionfruit');
            expect(execSpy).toHaveBeenCalledWith('pgrep passionfruit');
        });

        it('should failover', () => {
            execSpy.mockImplementation(() => false);
            expect(utils.procRunning('banana')).toBe(false);
        });
    });

    it.todo('exec, but testing anything in child_process is a pain');

    it('JSONtoKv', () => {
        const json = {
            one: 1, two: 2, nested: { three: 3 }, string: '$numberlong',
        };

        const array = [];
        utils.JSONToKv(json, array, (_, val) => 2 + val, undefined);

        expect(array).toStrictEqual([3, 4, 5, '2$numberlong']);
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

    describe('isInFilters', () => {
        let originalWrite;
        beforeEach(() => {
            originalWrite = process.stdout.write;
            process.stdout.write = jest.fn(); // shhhh
        });
        afterEach(() => {
            process.stdout.write = originalWrite;
        });
        it('should match a simple filter', () => {
            expect(utils.isInFilters('hello', ['/h*/', '/\\w/'])).toBe(true);
        });
        it('should match a not filter', () => {
            expect(utils.isInFilters('hello', ['!/banana/'])).toBe(true);
        });
        it('should match when the filter is identical to the item', () => {
            expect(utils.isInFilters('hello', ['hello'])).toBe(true);
        });
        it('should not match if no filters are provided', () => {
            expect(utils.isInFilters('hello', [])).toBe(false);
        });
        it('should not match if filters are not an array', () => {
            expect(utils.isInFilters('hello', '/h*/')).toBe(false);
        });
    });

    describe('carousel', () => {
        let stdout;
        beforeEach(() => {
            stdout = require('test-console').stdout;
            jest.useFakeTimers();
        });

        it('checks that args are the right type', () => {
            const output = stdout.inspectSync(() => {
                utils.carousel();
            });
            expect(setInterval).not.toHaveBeenCalled();
            expect(JSON.parse(output[0]).msg).toMatch('Supplied invalid args');
        });

        it('checks that interval is the right type', () => {
            const output = stdout.inspectSync(() => {
                utils.carousel(undefined, undefined, ['foo']);
            });
            expect(setInterval).not.toHaveBeenCalled();
            expect(JSON.parse(output[0]).msg).toMatch('Supplied invalid interval');
        });

        it('checks that func is the right type', () => {
            const output = stdout.inspectSync(() => {
                utils.carousel(100, undefined, ['foo']);
            });
            expect(setInterval).not.toHaveBeenCalled();
            expect(JSON.parse(output[0]).msg).toMatch('Supplied undefined function');
        });

        it('should call func with each arg over the interval', () => {
            const func = jest.fn();
            utils.carousel(100, func, ['foo', 'bar']);
            expect(setInterval).toHaveBeenCalledTimes(1);
            jest.runOnlyPendingTimers();
            expect(func).toHaveBeenCalledWith('foo');
            jest.runOnlyPendingTimers();
            expect(func).toHaveBeenCalledWith('bar');
        });
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

    it('getMarDir', () => {
        utils.getMarDir();
        expect(path.dirname).toHaveBeenCalled();
    });

    describe('getConfig', () => {
        // testing MOOG_CREDS_AND_CONFIG is *very* difficult, mostly due to the fact that it's
        // really not the best practice to use the module system as a cache. For now, let's test the
        // more complicated path.
        it.todo('should get config via stdin');
        it('should get config via conf file if no valid stdin is present', () => {
            path.dirname.mockReturnValue('mardir');
            fs.readFileSync.mockReturnValue('foo');
            const res = utils.getConfig('banana');
            expect(fs.readFileSync).toHaveBeenCalledWith('mardir/config/banana.conf', 'utf8');
            expect(res).toEqual('foo');
        });
    });

    it('getCredentials', () => {
        fs.readFileSync.mockReturnValue(JSON.stringify({ credentials: { obj: 'creds' }, config: { obj: 'config' } }));
        const creds = utils.getCredentials();
        expect(creds).toEqual({ obj: 'creds' });
    });

    it('registerScheduled', () => {
        const func = jest.fn();
        const exitSpy = jest.spyOn(process, 'exit').mockReturnValue();
        process.argv.push('mockConstructor');
        utils.registerScheduled(func);
        expect(func).toHaveBeenCalled();
        expect(exitSpy).toHaveBeenCalled();
        exitSpy.mockRestore();
    });

    it('sendResult', () => {
        const writeSpy = jest.spyOn(process.stdout, 'write').mockReturnValue();
        utils.sendResult('{"foo": "bar"}');
        expect(writeSpy).toHaveBeenCalledWith('{"type":"result","value":{"foo":"bar"}}\n');
        writeSpy.mockRestore();
    });
});
