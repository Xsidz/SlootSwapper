import { test, describe, before } from 'node:test'
import { TestClient, assert, testData } from './test-helper.js'

describe('Events API', () => {
    const client = new TestClient()
    let eventId = null

    before(async () => {
        // Login before running tests
        await client.post('/api/auth/login', {
            email: testData.user.email,
            password: testData.user.password
        })
    })

    test('should create a new event', async () => {
        const response = await client.post('/api/events', testData.event)

        assert.equal(response.status, 201, 'Event creation should return 201')
        assert.ok(response.body.success, 'Response should indicate success')
        assert.ok(response.body.data.event, 'Response should contain event data')
        assert.equal(response.body.data.event.title, testData.event.title, 'Title should match')

        eventId = response.body.data.event._id
    })

    test('should get all events for user', async () => {
        const response = await client.get('/api/events')

        assert.equal(response.status, 200, 'Get events should return 200')
        assert.ok(response.body.success, 'Response should indicate success')
        assert.ok(Array.isArray(response.body.data.events), 'Response should contain events array')
        assert.ok(response.body.data.events.length > 0, 'Should have at least one event')
    })

    test('should get specific event by ID', async () => {
        const response = await client.get(`/api/events/${eventId}`)

        assert.equal(response.status, 200, 'Get event by ID should return 200')
        assert.ok(response.body.success, 'Response should indicate success')
        assert.equal(response.body.data.event._id, eventId, 'Event ID should match')
    })

    test('should update event', async () => {
        const updatedData = {
            title: 'Updated Test Event',
            startTime: testData.event.startTime,
            endTime: testData.event.endTime
        }

        const response = await client.put(`/api/events/${eventId}`, updatedData)

        assert.equal(response.status, 200, 'Event update should return 200')
        assert.ok(response.body.success, 'Response should indicate success')
        assert.equal(response.body.data.event.title, updatedData.title, 'Title should be updated')
    })

    test('should update event status', async () => {
        const response = await client.put(`/api/events/${eventId}/status`, {
            status: 'SWAPPABLE'
        })

        assert.equal(response.status, 200, 'Status update should return 200')
        assert.ok(response.body.success, 'Response should indicate success')
        assert.equal(response.body.data.event.status, 'SWAPPABLE', 'Status should be updated')
    })

    test('should delete event', async () => {
        const response = await client.delete(`/api/events/${eventId}`)

        assert.equal(response.status, 200, 'Event deletion should return 200')
        assert.ok(response.body.success, 'Response should indicate success')
    })

    test('should not find deleted event', async () => {
        const response = await client.get(`/api/events/${eventId}`)

        assert.equal(response.status, 404, 'Deleted event should return 404')
        assert.notOk(response.body.success, 'Response should indicate failure')
    })

    test('should not create event with invalid data', async () => {
        const invalidEvent = {
            title: '', // Empty title
            startTime: testData.event.startTime,
            endTime: testData.event.endTime
        }

        const response = await client.post('/api/events', invalidEvent)

        assert.equal(response.status, 400, 'Invalid event should return 400')
        assert.notOk(response.body.success, 'Response should indicate failure')
    })
})