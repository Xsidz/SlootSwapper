import { test, describe, before } from 'node:test'
import { TestClient, assert, testData } from './test-helper.js'

describe('Swaps API', () => {
    const client1 = new TestClient()
    const client2 = new TestClient()
    let user1EventId = null
    let user2EventId = null
    let swapRequestId = null

    before(async () => {
        // Register and login first user
        await client1.post('/api/auth/register', testData.user2) // Use user2 data to avoid conflicts
        await client1.post('/api/auth/login', {
            email: testData.user2.email,
            password: testData.user2.password
        })

        // Register and login second user (reuse existing user from auth tests)
        await client2.post('/api/auth/login', {
            email: testData.user.email,
            password: testData.user.password
        })

        // Create events for both users
        const event1Response = await client1.post('/api/events', testData.event)
        user1EventId = event1Response.body.data.event._id

        const event2Response = await client2.post('/api/events', testData.event2)
        user2EventId = event2Response.body.data.event._id

        // Make both events swappable
        await client1.put(`/api/events/${user1EventId}/status`, { status: 'SWAPPABLE' })
        await client2.put(`/api/events/${user2EventId}/status`, { status: 'SWAPPABLE' })
    })

    test('should get swappable slots', async () => {
        const response = await client1.get('/api/swaps/slots')

        assert.equal(response.status, 200, 'Get swappable slots should return 200')
        assert.ok(response.body.success, 'Response should indicate success')
        assert.ok(Array.isArray(response.body.data.slots), 'Response should contain slots array')
    })

    test('should create swap request', async () => {
        const swapData = {
            requesterSlotId: user1EventId,
            targetSlotId: user2EventId
        }

        const response = await client1.post('/api/swaps/request', swapData)

        assert.equal(response.status, 201, 'Swap request creation should return 201')
        assert.ok(response.body.success, 'Response should indicate success')
        assert.ok(response.body.data.swapRequest, 'Response should contain swap request data')

        swapRequestId = response.body.data.swapRequest._id
    })

    test('should get incoming swap requests', async () => {
        const response = await client2.get('/api/swaps/incoming')

        assert.equal(response.status, 200, 'Get incoming requests should return 200')
        assert.ok(response.body.success, 'Response should indicate success')
        assert.ok(Array.isArray(response.body.data.requests), 'Response should contain requests array')
        assert.ok(response.body.data.requests.length > 0, 'Should have at least one incoming request')
    })

    test('should get outgoing swap requests', async () => {
        const response = await client1.get('/api/swaps/outgoing')

        assert.equal(response.status, 200, 'Get outgoing requests should return 200')
        assert.ok(response.body.success, 'Response should indicate success')
        assert.ok(Array.isArray(response.body.data.requests), 'Response should contain requests array')
        assert.ok(response.body.data.requests.length > 0, 'Should have at least one outgoing request')
    })

    test('should accept swap request', async () => {
        const response = await client2.put(`/api/swaps/${swapRequestId}/respond`, {
            action: 'accept'
        })

        assert.equal(response.status, 200, 'Accept swap should return 200')
        assert.ok(response.body.success, 'Response should indicate success')
    })

    test('should verify events were swapped', async () => {
        // Check that user1 now has user2's original event
        const user1EventsResponse = await client1.get('/api/events')
        const user1Events = user1EventsResponse.body.data.events
        const swappedEvent = user1Events.find(e => e.title === testData.event2.title)
        assert.ok(swappedEvent, 'User1 should have the swapped event')

        // Check that user2 now has user1's original event
        const user2EventsResponse = await client2.get('/api/events')
        const user2Events = user2EventsResponse.body.data.events
        const swappedEvent2 = user2Events.find(e => e.title === testData.event.title)
        assert.ok(swappedEvent2, 'User2 should have the swapped event')
    })

    test('should not create swap request for own event', async () => {
        // Create another event for user1
        const eventResponse = await client1.post('/api/events', {
            title: 'Another Test Event',
            startTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 73 * 60 * 60 * 1000).toISOString()
        })
        const newEventId = eventResponse.body.data.event._id

        await client1.put(`/api/events/${newEventId}/status`, { status: 'SWAPPABLE' })

        const swapData = {
            requesterSlotId: newEventId,
            targetSlotId: newEventId // Same event
        }

        const response = await client1.post('/api/swaps/request', swapData)

        assert.equal(response.status, 400, 'Self-swap should return 400')
        assert.notOk(response.body.success, 'Response should indicate failure')
    })

    test('should reject swap request', async () => {
        // Create another swap request to test rejection
        const event3Response = await client1.post('/api/events', {
            title: 'Event for Rejection Test',
            startTime: new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 97 * 60 * 60 * 1000).toISOString()
        })
        const event3Id = event3Response.body.data.event._id
        await client1.put(`/api/events/${event3Id}/status`, { status: 'SWAPPABLE' })

        const event4Response = await client2.post('/api/events', {
            title: 'Event for Rejection Test 2',
            startTime: new Date(Date.now() + 120 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 121 * 60 * 60 * 1000).toISOString()
        })
        const event4Id = event4Response.body.data.event._id
        await client2.put(`/api/events/${event4Id}/status`, { status: 'SWAPPABLE' })

        // Create swap request
        const swapResponse = await client1.post('/api/swaps/request', {
            requesterSlotId: event3Id,
            targetSlotId: event4Id
        })
        const newSwapRequestId = swapResponse.body.data.swapRequest._id

        // Reject the swap request
        const response = await client2.put(`/api/swaps/${newSwapRequestId}/respond`, {
            action: 'reject'
        })

        assert.equal(response.status, 200, 'Reject swap should return 200')
        assert.ok(response.body.success, 'Response should indicate success')
    })
})