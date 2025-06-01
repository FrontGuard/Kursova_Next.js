import '@testing-library/jest-dom';
import './prisma.singelton';

if (typeof global.TextEncoder === 'undefined') {
    const { TextEncoder } = require('util');
    global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
    const { TextDecoder } = require('util');
    global.TextDecoder = TextDecoder;
}

if (typeof global.ReadableStream === 'undefined') {
    try {
        const { ReadableStream } = require('stream/web');
        global.ReadableStream = ReadableStream;
    } catch (error) {
        console.error('ReadableStream is not supported in this Node.js environment', error);
    }
}

if (typeof global.MessagePort === 'undefined') {
    try {
        const { MessagePort } = require('worker_threads');
        global.MessagePort = MessagePort;
    } catch (error) {
        console.warn('MessagePort cannot be found; ensure the environment supports it.', error);
    }
}

const { fetch, Request, Response, Headers, FormData } = require('undici');

if (typeof global.Request === 'undefined') {
    global.Request = Request;
}
if (typeof global.Response === 'undefined') {
    global.Response = Response;
}
if (typeof global.Headers === 'undefined') {
    global.Headers = Headers;
}
if (typeof global.fetch === 'undefined') {
    global.fetch = fetch;
}
if (typeof global.FormData === 'undefined') {
    global.FormData = FormData;
}