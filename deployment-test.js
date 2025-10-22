// deployment-test.js - Test your deployed bot
const https = require('https');
const http = require('http');

class DeploymentTester {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.testResults = [];
    }

    async testEndpoint(endpoint, expectedStatus = 200) {
        return new Promise((resolve) => {
            const url = `${this.baseUrl}${endpoint}`;
            const protocol = url.startsWith('https') ? https : http;
            
            console.log(`🧪 Testing: ${url}`);
            
            const startTime = Date.now();
            const req = protocol.get(url, (res) => {
                const responseTime = Date.now() - startTime;
                const success = res.statusCode === expectedStatus;
                
                const result = {
                    endpoint,
                    status: res.statusCode,
                    expected: expectedStatus,
                    success,
                    responseTime: `${responseTime}ms`,
                    timestamp: new Date().toISOString()
                };
                
                this.testResults.push(result);
                
                if (success) {
                    console.log(`✅ ${endpoint} - ${res.statusCode} (${responseTime}ms)`);
                } else {
                    console.log(`❌ ${endpoint} - Expected ${expectedStatus}, got ${res.statusCode}`);
                }
                
                resolve(result);
            });

            req.on('error', (err) => {
                const result = {
                    endpoint,
                    status: 'ERROR',
                    expected: expectedStatus,
                    success: false,
                    error: err.message,
                    timestamp: new Date().toISOString()
                };
                
                this.testResults.push(result);
                console.log(`❌ ${endpoint} - Error: ${err.message}`);
                resolve(result);
            });

            req.setTimeout(10000, () => {
                req.destroy();
                const result = {
                    endpoint,
                    status: 'TIMEOUT',
                    expected: expectedStatus,
                    success: false,
                    error: 'Request timeout',
                    timestamp: new Date().toISOString()
                };
                
                this.testResults.push(result);
                console.log(`⏰ ${endpoint} - Timeout`);
                resolve(result);
            });
        });
    }

    async runAllTests() {
        console.log('🚀 Starting Deployment Tests...\n');
        
        const tests = [
            { endpoint: '/', expected: 200 },
            { endpoint: '/health', expected: 200 },
            { endpoint: '/pair', expected: 200 },
            { endpoint: '/qr-page', expected: 200 },
            { endpoint: '/api', expected: 200 },
            { endpoint: '/nonexistent', expected: 404 }
        ];

        for (const test of tests) {
            await this.testEndpoint(test.endpoint, test.expected);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay between tests
        }

        this.printSummary();
    }

    printSummary() {
        console.log('\n📊 TEST SUMMARY');
        console.log('════════════════════════════════════════');
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`✅ Passed: ${passedTests}`);
        console.log(`❌ Failed: ${failedTests}`);
        console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        if (failedTests > 0) {
            console.log('\n🔍 Failed Tests:');
            this.testResults.filter(r => !r.success).forEach(test => {
                console.log(`   ${test.endpoint} - ${test.error || `Got ${test.status}, expected ${test.expected}`}`);
            });
        }
        
        console.log('\n🎯 Next Steps:');
        if (failedTests === 0) {
            console.log('✅ All tests passed! Your bot is ready to use.');
        } else {
            console.log('⚠️ Some tests failed. Check your deployment.');
        }
    }
}

// Run tests if executed directly
if (require.main === module) {
    const baseUrl = process.env.TEST_URL || 'https://tri-controls-bot.onrender.com';
    const tester = new DeploymentTester(baseUrl);
    tester.runAllTests();
}

module.exports = DeploymentTester;