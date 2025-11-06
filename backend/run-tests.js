#!/usr/bin/env node

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🧪 Running SlotSwapper API Tests...\n')

// Check if server is running
const checkServer = async () => {
    try {
        const response = await fetch('http://localhost:5002/api/health')
        return response.ok
    } catch (error) {
        return false
    }
}

const runTests = () => {
    return new Promise((resolve, reject) => {
        const testProcess = spawn('node', ['--test', 'tests/*.test.js'], {
            cwd: __dirname,
            stdio: 'inherit'
        })

        testProcess.on('close', (code) => {
            if (code === 0) {
                resolve()
            } else {
                reject(new Error(`Tests failed with exit code ${code}`))
            }
        })

        testProcess.on('error', (error) => {
            reject(error)
        })
    })
}

const main = async () => {
    try {
        // Check if server is running
        const serverRunning = await checkServer()

        if (!serverRunning) {
            console.log('❌ Server is not running on http://localhost:5002')
            console.log('Please start the server with: npm run dev')
            process.exit(1)
        }

        console.log('✅ Server is running, starting tests...\n')

        // Run tests
        await runTests()

        console.log('\n✅ All tests completed successfully!')

    } catch (error) {
        console.error('\n❌ Tests failed:', error.message)
        process.exit(1)
    }
}

main()