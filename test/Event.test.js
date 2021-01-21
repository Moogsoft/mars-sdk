'use strict';

const { Event } = require('../Event');

describe('Event', () => {
    let e;
    beforeEach(() => {
        e = new Event();
    });

    it('should set severity as string', () => {
        e.setSeverity('StrIng');
        expect(e.severity).toBe('string');
    });

    it('should set severity as other type', () => {
        e.setSeverity(99);
        expect(e.severity).toBe(99);
        e.setSeverity(true);
        expect(e.severity).toBe(true);
    });

    it('should set dedup_key to dedupe_key', () => {
        expect(Event.from({ dedup_key: 'dedupe_key' }).dedupe_key).toBe('dedupe_key');
    });

    describe.each([
        'source',
        'check',
        'description',
        'time',
        'utc_offset',
        'dedupe_key',
        'manager',
        'service',
        'alias',
        'class',
        'tags',
    ])('handling %s', (field) => {
        it(`should set ${field} correctly`, () => {
            const val = 'value';
            const camelCase = field.split('_')
                .map((el) => `${el[0].toUpperCase()}${el.slice(1)}`)
                .join('');
            e[`set${camelCase}`](val);
            expect(e[field]).toBe(val);
        });

        it(`should set ${field} using the from method`, () => {
            const val = 'value';
            e = Event.from({ [field]: val });
            expect(e[field]).toBe(val);
        });
    });

    describe('validate', () => {
        let validConfig;
        const validator = () => Event.from(validConfig).validate();
        beforeEach(() => {
            validConfig = {
                severity: 'clear',
                source: 'source',
                check: 'check',
                description: 'description',
                time: 2137891238912,
                utc_offset: 'utc_offset',
                dedupe_key: 'dedupe_key',
                manager: 'manager',
                service: ['service'],
                alias: 'alias',
                class: 'class',
                tags: {
                    mytag: 'mytag',
                },
            };
        });

        it('should allow a valid config', () => {
            expect(validator).not.toThrow();
        });

        it('should fail an empty a valid config', () => {
            validConfig = {};
            expect(validator).toThrow();
        });

        it('should still validate without optional fields', () => {
            delete validConfig.time;
            expect(validator).not.toThrow();
            delete validConfig.utc_offset;
            expect(validator).not.toThrow();
            delete validConfig.dedupe_key;
            expect(validator).not.toThrow();
            delete validConfig.manager;
            expect(validator).not.toThrow();
            delete validConfig.service;
            expect(validator).not.toThrow();
            delete validConfig.alias;
            expect(validator).not.toThrow();
            delete validConfig.class;
            expect(validator).not.toThrow();
            delete validConfig.tags;
            expect(validator).not.toThrow();
        });

        it('should throw if severity is not one of the allowed strings', () => {
            validConfig.severity = 'guava';
            expect(validator).toThrow('string `severity`');
        });

        it('should throw if severity is not one of the allowed numbers', () => {
            validConfig.severity = 77;
            expect(validator).toThrow('numeric `severity`');
            validConfig.severity = -77;
            expect(validator).toThrow('numeric `severity`');
            validConfig.severity = 7.7;
            expect(validator).toThrow('numeric `severity`');
        });

        it('should throw if severity is not a number or string', () => {
            validConfig.severity = new Date();
            expect(validator).toThrow('severity');
        });

        it('should throw if source is not set correctly', () => {
            validConfig.source = 77;
            expect(validator).toThrow('source');
            validConfig.source = false;
            expect(validator).toThrow('source');
        });

        it('should throw if check is not set correctly', () => {
            validConfig.check = 77;
            expect(validator).toThrow('check');
            validConfig.check = false;
            expect(validator).toThrow('check');
        });

        it('should throw if description is not set correctly', () => {
            validConfig.description = 77;
            expect(validator).toThrow('description');
            validConfig.description = false;
            expect(validator).toThrow('description');
        });

        it('should throw if time is not set correctly', () => {
            validConfig.time = '77';
            expect(validator).toThrow('time');
            validConfig.time = false;
            expect(validator).toThrow('time');
        });

        it('should throw if utc_offset is not set correctly', () => {
            validConfig.utc_offset = 77;
            expect(validator).toThrow('utf_offset');
            validConfig.utc_offset = false;
            expect(validator).toThrow('utf_offset');
        });

        it('should throw if dedupe_key is not set correctly', () => {
            validConfig.dedupe_key = 77;
            expect(validator).toThrow('dedupe_key');
            validConfig.dedupe_key = false;
            expect(validator).toThrow('dedupe_key');
        });

        it('should throw if manager is not set correctly', () => {
            validConfig.manager = 77;
            expect(validator).toThrow('manager');
            validConfig.manager = false;
            expect(validator).toThrow('manager');
        });

        it('should throw if service is not set correctly', () => {
            validConfig.service = 77;
            expect(validator).toThrow('service');
            validConfig.service = [];
            expect(validator).toThrow('service');
            validConfig.service = [false];
            expect(validator).toThrow('service');
        });

        it('should throw if alias is not set correctly', () => {
            validConfig.alias = 77;
            expect(validator).toThrow('alias');
            validConfig.alias = false;
            expect(validator).toThrow('alias');
        });

        it('should throw if class is not set correctly', () => {
            validConfig.class = 77;
            expect(validator).toThrow('class');
            validConfig.class = false;
            expect(validator).toThrow('class');
        });

        it('should throw if tags is not set correctly', () => {
            validConfig.tags = 77;
            expect(validator).toThrow('tags');
            validConfig.tags = false;
            expect(validator).toThrow('tags');
        });
    });
});
