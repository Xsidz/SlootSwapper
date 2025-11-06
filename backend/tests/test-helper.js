import http from 'http'
import { URL } from 'url'

/**
 * Simple HTTP client for testing API endpoints
 */
export class TestClient {
    constructor(baseUrl = 'http://localhost:5002') {
        this.baseUrl = baseUrl
        this.cookies = ''
    }

    /**
     * Make an HTTP request
     */
    async request(method, path, data = null, headers = {}) {
        return new Promise((resolve, reject) => {
            const url = new URL(path, this.baseUrl)

            const options = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname + url.search,
                method: method.toUpperCase(),
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': this.cookies,
                    ...headers
                }
            }

            let requestData = null
            if (data) {
                if (typeof data === 'string') {
                    requestData = data
                    options.headers['Content-Length'] = Buffer.byteLength(requestData)
                } else {
                    requestData = JSON.stringify(data)
                    options.headers['Content-Length'] = Buffer.byteLength(requestData)
                }
            }

            const req = http.request(options, (res) => {
                let body = ''

                // Store cookies for session management
                if (res.headers['set-cookie']) {
                    this.cookies = res.headers['set-cookie'].join('; ')
                }

                res.on('data', (chunk) => {
                    body += chunk
                })

                res.on('end', () => {
                    let parsedBody
                    try {
                        parsedBody = body ? JSON.parse(body) : {}
                    } catch (e) {
                        parsedBody = { raw: body }
                    }

                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: parsedBody
                    })
                })
            })

            req.on('error', (err) => {
                reject(err)
            })

            if (requestData) {
                req.write(requestData)
            }

            req.end()
        })
    }

    // Convenience methods
    async get(path, headers = {}) {
        return this.request('GET', path, null, headers)
    }

    async post(path, data = {}, headers = {}) {
        return this.request('POST', path, data, headers)
    }

    async put(path, data = {}, headers = {}) {
        return this.request('PUT', path, data, headers)
    }

    async delete(path, headers = {}) {
        return this.request('DELETE', path, null, headers)
    }

    // Clear cookies (logout)
    clearSession() {
        this.cookies = ''
    }
}

/**
 * Simple assertion helpers
 */
export const assert = {
    equal(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`)
        }
    },

    strictEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message}\nExpected: ${expected} (${typeof expected})\nActual: ${actual} (${typeof actual})`)
        }
    },

    ok(value, message = '') {
        if (!value) {
            throw new Error(`${message}\nExpected truthy value, got: ${value}`)
        }
    },

    notOk(value, message = '') {
        if (value) {
            throw new Error(`${message}\nExpected falsy value, got: ${value}`)
        }
    },

    throws(fn, message = '') {
        try {
            fn()
            throw new Error(`${message}\nExpected function to throw`)
        } catch (error) {
            // Expected to throw
        }
    },

    async rejects(promise, message = '') {
        try {
            await promise
            throw new Error(`${message}\nExpected promise to reject`)
        } catch (error) {
            // Expected to reject
        }
    }
}

/**
 * Wait for a specified amount of time
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Generate test data
export const testData = {
    user: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123'
    },

    user2: {
        name: 'Test User 2',
        email: 'test2@example.com',
        password: 'TestPass123'
    },

    event: {
        title: 'Test Event',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString() // Tomorrow + 1 hour
    },

    event2: {
        title: 'Test Event 2',
        startTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
        endTime: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString() // Day after tomorrow + 1 hour
    }
}