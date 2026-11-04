import request from 'supertest';
import { describe, it, expect, } from 'vitest';
import app from '../src/app.js';

describe('GET /api/v1/health', () => {
    it('returns status 200', async () => {
        const response = await request(app).get('/api/v1/health');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok')
    });
});
describe('GET /api/v1/unknown-route', () => {
    it('returns status 404 not-found', async () => {
        const response = await request(app).get('/api/v1/unknown-route');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: 'Route not found'})
    });
});
describe('POST /api/v1/services', () => {
    it('returns status 401 when unauthenticated', async () => {
        const response = await request(app).post('/api/v1/services');
        expect(response.status).toBe(401);
        expect(response.body).toEqual({error: 'Unauthorized'})
    });
});
describe('POST /api/v1/auth/login', () => {
    it('returns status 400 on invalid credentials payload', async () => {
        const response = await request(app).post('/api/v1/auth/login').send({ email: "not-an-email", password: "123" });
        expect(response.status).toBe(400);
    });
});
describe('POST /api/v1/auth/login', () => {
    it('returns status 400 on malformed JSON payload', async () => {
        const response = await request(app).post('/api/v1/auth/login').set('Content-Type', 'application/json').send('{ bad json');
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: 'Invalid JSON payload'});
    });
});