import { test, describe } from 'node:test'
import { TestClient, assert } from './test-helper.js'

describe('Basic API Tests', () => {
    const client = new TestClient()

    test('should connect to server', async () => {
        const response = await client.get('/api/health')

        assert.equal(response.status, 200, 'Health check should return 200')
        assert.equal(response.body.status, 'OK', 'Status should be OK')
        assert.ok(response.body.timestamp, 'Should have timestamp')
        assert.ok(response.body.database, 'Should have database info')
    })

    test('should return 404 for non-existent endpoint', async () => {
        const response = await client.get('/api/non-existent')

        assert.equal(response.status, 404, 'Non-existent endpoint should return 404')
    })

    test('should handle invalid JSON', async () => {
        // This tests the error handling middleware
        const response = await client.request('POST', '/api/auth/login', 'invalid-json')

        // Should handle the error gracefully
        assert.ok(response.status >= 400, 'Invalid JSON should return error status')
    })
})