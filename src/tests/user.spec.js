import app from '../app';
import supertest from 'supertest';
import config from '../config';

describe('user login and logout returns secure results', () => {
    test('post user returns null token and unset cookie for bad email', async () => {
        const result = await supertest(app).post('/user').send({
            email: 'bad@email.com',
            password: config.adminPassword
        })
        expect(result.statusCode).toEqual(200)
        expect(result.body.token).toBeNull()
        expect(result.headers['set-cookie'][0].indexOf('authCookie')).toBeGreaterThan(-1)
        expect(result.headers['set-cookie'][0].indexOf(config.authCookie)).toBe(-1)
        expect(result.headers['set-cookie'][0].indexOf('Domain')).toBeGreaterThan(-1)
    })

    test('post user returns null token and unset cookie for bad password', async () => {
        const result = await supertest(app).post('/user').send({
            email: config.adminUsername,
            password: 'badPassword'
        })
        expect(result.statusCode).toEqual(200)
        expect(result.body.token).toBeNull()
        expect(result.headers['set-cookie'][0].indexOf('authCookie')).toBeGreaterThan(-1)
        expect(result.headers['set-cookie'][0].indexOf(config.authCookie)).toBe(-1)
        expect(result.headers['set-cookie'][0].indexOf('Domain')).toBeGreaterThan(-1)
    })

    test('post user returns 200 for good password & email', async () => {
        await supertest(app).post('/user').send({
            email: config.adminUsername,
            password: config.adminPassword
        }).expect(200)
    })

    test('post user sets cookie for good password & email', async () => {
        const result = await supertest(app).post('/user').send({
            email: config.adminUsername,
            password: config.adminPassword
        })
        expect(result.headers['set-cookie'][0].indexOf('authCookie')).toBeGreaterThan(-1)
        expect(result.headers['set-cookie'][0].indexOf(config.authCookie)).toBeGreaterThan(-1)
        expect(result.headers['set-cookie'][0].indexOf('Domain')).toBeGreaterThan(-1)
    })

    test('get logout unsets cookie', async() => {
        const result = await supertest(app).get('/user/logout')
        expect(result.headers['set-cookie'][0].indexOf('authCookie')).toBeGreaterThan(-1)
        expect(result.headers['set-cookie'][0].indexOf(config.authCookie)).toBe(-1)
        expect(result.headers['set-cookie'][0].indexOf('Domain')).toBeGreaterThan(-1)
    })

    test('get user info returns 401 for no auth', async () => {
        const result = await supertest(app).get('/user')
        expect(result.statusCode).toEqual(401)
    })

    test('get user info returns 401 for bad token and no cookie', async () => {
        const result = await supertest(app).get('/user').set({
            Authorization: 'Bearer badToken'
        })
        expect(result.statusCode).toEqual(401)
    })

    test('get user info returns 401 for good token and no cookie', async () => {
        const result = await supertest(app).get('/user').set(
            'Authorization', `Bearer ${config.sessionToken}`
        )
        expect(result.statusCode).toEqual(401)
    })

    test('get user info returns 401 for good cookie and no token', async () => {
        const result = await supertest(app).get('/user').set(
            'Cookie', `authCookie=${config.authCookie}`
        )
        expect(result.statusCode).toEqual(401)
    })

    test('user info returns 200 and json for good cookie', async () => {
        const result = await supertest(app).get('/user').set(
            'Authorization', `Bearer ${config.sessionToken}`
        ).set(
            'Cookie', `authCookie=${config.authCookie}`
        )
        expect(result.statusCode).toEqual(200)
        expect(result.body.email).toBeTruthy()
    })

    test('user info returns 200 and new token for old token and good cookie', async () => {
        const result = await supertest(app).get('/user').set(
            'Authorization', `Bearer ${config.oldSessionToken}`
        ).set(
            'Cookie', `authCookie=${config.authCookie}`
        )
        expect(result.statusCode).toEqual(200)
        expect(result.body.token).toBe(config.sessionToken)
    })
})