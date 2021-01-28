'use strict';

const nock = require('nock');
const { get } = require('../rest');

process.stdout.write = jest.fn();

describe('handling the request inside of a callback', () => {
    it('should handle a successful response', async () => {
        nock(/banana\.com/)
            .get('/papaya?foo=bar')
            .reply(200, {
                body: 'body',
            }, {
                'x-banana-header': 'header',
            });
        const res = await get('https://banana.com/papaya', { foo: 'bar' }, { my: 'option' });
        expect(res.responseTime).toBeCloseTo(0.005, 1);
        expect(res.roundTripTime).toBeCloseTo(0.005, 1);
        expect(res.status_code).toBe(200);
        expect(res.body).toBeInstanceOf(Buffer);
        expect(res.headers).toEqual({
            'content-type': 'application/json',
            'x-banana-header': 'header',
        });
    });

    it('should handle an error response', async () => {
        nock(/banana\.com/)
            .get('/papaya?foo=bar')
            .replyWithError('oh no');
        const res = await get('https://banana.com/papaya', { foo: 'bar' }, { my: 'option' });
        expect(res.roundTripTime).toBeCloseTo(0.005, 1);
        expect(res.errorTime).toBeCloseTo(0.005, 1);
        expect(res.exception).toBeDefined();
        expect(res.status_code).toBe(false);
    });
});
