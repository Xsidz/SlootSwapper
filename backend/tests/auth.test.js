import { test, describe } from 'node:test'
import { TestClient, assert, testData } from './test-helper.js'

describe('Authentication API', () => {
    const client = new TestClient()

    test('should register a new user', async () => {
        const response = await client.post('/api/auth/register', testData.user)

        assert.equal(response.status, 201, 'Registration should return 201')
        assert.ok(response.body.success, 'Response should indicate success')
        assert.ok(response.body.data.user, 'Response should contain user data')
        assert.equal(response.body.data.user.email, testData.user.email, 'Email should match')
        assert.ok(response.body.data.token, 'Response should contain token')
    })

    test('should not register user with duplicate email', async () => {
        const response = await client.post('/api/auth/register', testData.user)

        assert.equal(response.status, 400, 'Duplicate registration should return 400')
        assert.notOk(response.body.success, 'Response should indicate failure')
    })

    test('should login with valid credentials', async () => {
        const response = await client.post('/api/auth/login', {
            email: testData.user.email,
            password: testData.user.password
        })

        assert.equal(response.status, 200, 'Login should return 200')
        assert.ok(response.body.success, 'Response should indicate success')
        assert.ok(response.body.data.user, 'Response should contain user data')
        assert.ok(response.body.data.token, 'Response should contain token')
    })

    test('should not login with invalid credentials', async () => {
        const response = await client.post('/api/auth/login', {
            email: testData.user.email,
            password: 'wrongpassword'
        })

        assert.equal(response.status, 401, 'Invalid login should return 401')
        assert.notOk(response.body.success, 'Response should indicate failure')
    })

    test('should get current user when authenticated', async () => {
        // First login to get authenticated
        await client.post('/api/auth/login', {
            email: testData.user.email,
            password: testData.user.password
        })

        const response = await client.get('/api/auth/me')

        assert.equal(response.status, 200, 'Get current user should return 200')
        assert.ok(response.body.success, 'Response should indicate success')
        assert.equal(response.body.data.user.email, testData.user.email, 'Email should match')
    })

    test('should logout successfully', async () => {
        const response = await client.post('/api/auth/logout')

        assert.equal(response.status, 200, 'Logout should return 200')
        assert.ok(response.body.success, 'Response should indicate success')
    })

    test('should not access protected route after logout', async () => {
        const response = await client.get('/api/auth/me')

        assert.equal(response.status, 401, 'Protected route should return 401 after logout')
        assert.notOk(response.body.success, 'Response should indicate failure')
    })
})