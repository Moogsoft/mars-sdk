'use strict';

const https = require('https');
const http = require('http');
const {
    head,
    post,
    get,
} = require('../rest');

jest.mock('http', () => ({
    request: jest.fn(),
}));

jest.mock('https', () => ({
    request: jest.fn(),
}));

process.stdout.write = jest.fn();

describe('rest', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('get', () => {
        it('should call https with search params', async () => {
            await get('https://banana.com', { foo: 'bar' }, { my: 'option' });
            expect(https.request).toHaveBeenCalledWith(
                'https://banana.com/?foo=bar',
                {
                    method: 'GET',
                    my: 'option',
                    requestCert: true,
                    uri: expect.any(URL),
                },
                expect.any(Function),
            );
        });

        it('should call https with search params as a string', async () => {
            await get('https://banana.com', 'foo=bar', { my: 'option' });
            expect(https.request).toHaveBeenCalledWith(
                'https://banana.com/?foo=bar',
                {
                    method: 'GET',
                    my: 'option',
                    requestCert: true,
                    uri: expect.any(URL),
                },
                expect.any(Function),
            );
        });

        it('should call https without search params', async () => {
            await get('https://banana.com', null, { my: 'option' });
            expect(https.request).toHaveBeenCalledWith(
                'https://banana.com/',
                {
                    method: 'GET',
                    my: 'option',
                    requestCert: true,
                    uri: expect.any(URL),
                },
                expect.any(Function),
            );
        });

        it('should call http without search params', async () => {
            await get('http://banana.com', null, { my: 'option' });
            expect(http.request).toHaveBeenCalledWith(
                'http://banana.com/',
                {
                    method: 'GET',
                    my: 'option',
                    requestCert: true,
                    uri: expect.any(URL),
                },
                expect.any(Function),
            );
        });
    });

    describe('post', () => {
        it('should call https with search params', async () => {
            await post('https://banana.com', { foo: 'bar' }, { my: 'option' });
            expect(https.request).toHaveBeenCalledWith(
                'https://banana.com/?foo=bar',
                {
                    method: 'POST',
                    my: 'option',
                    requestCert: true,
                    uri: expect.any(URL),
                },
                expect.any(Function),
            );
        });

        it('should call http without search params', async () => {
            await post('http://banana.com', null, { my: 'option' });
            expect(http.request).toHaveBeenCalledWith(
                'http://banana.com/',
                {
                    method: 'POST',
                    my: 'option',
                    requestCert: true,
                    uri: expect.any(URL),
                },
                expect.any(Function),
            );
        });
    });

    describe('head', () => {
        it('should call https with search params', async () => {
            await head('https://banana.com', { foo: 'bar' }, { my: 'option' });
            expect(https.request).toHaveBeenCalledWith(
                'https://banana.com/?foo=bar',
                {
                    method: 'HEAD',
                    my: 'option',
                    requestCert: true,
                    uri: expect.any(URL),
                },
                expect.any(Function),
            );
        });

        it('should call http without search params', async () => {
            await head('http://banana.com', null, { my: 'option' });
            expect(http.request).toHaveBeenCalledWith(
                'http://banana.com/',
                {
                    method: 'HEAD',
                    my: 'option',
                    requestCert: true,
                    uri: expect.any(URL),
                },
                expect.any(Function),
            );
        });
    });
});
