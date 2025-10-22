// monitor.js - Keeps Render service awake
const https = require('https');
const http = require('http');

class ServiceMonitor {
    constructor(serviceUrl) {
        this.serviceUrl = serviceUrl;
        this.isMonitoring = false;
    }

    async pingService() {
        return new Promise((resolve) => {
            const protocol = this.serviceUrl.startsWith('https') ? https : http;
            
            const req = protocol.get(this.serviceUrl, (res) => {
                console.log(`✅ [${new Date().toISOString()}] Ping successful - Status: ${res.statusCode}`);
                resolve(true);
            });

            req.on('error', (err) => {
                console.log(`❌ [${new Date().toISOString()}] Ping failed: ${err.message}`);
                resolve(false);
            });

            req.setTimeout(10000, () => {
                req.destroy();
                console.log(`⏰ [${new Date().toISOString()}] Ping timeout`);
                resolve(false);
            });
        });
    }

    startMonitoring(intervalMinutes = 5) {
        if (this.isMonitoring) {
            console.log('⚠️ Monitoring already started');
            return;
        }

        this.isMonitoring = true;
        const intervalMs = intervalMinutes * 60 * 1000;

        console.log(`🚀 Starting service monitor for: ${this.serviceUrl}`);
        console.log(`⏰ Ping interval: ${intervalMinutes} minutes`);

        // Initial ping
        this.pingService();

        // Set up interval
        this.monitorInterval = setInterval(() => {
            this.pingService();
        }, intervalMs);

        // Handle graceful shutdown
        process.on('SIGINT', () => this.stopMonitoring());
        process.on('SIGTERM', () => this.stopMonitoring());
    }

    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.isMonitoring = false;
            console.log('🛑 Service monitor stopped');
        }
    }
}

// Only run if this file is executed directly
if (require.main === module) {
    const serviceUrl = process.env.RENDER_URL || 'https://tri-controls-bot.onrender.com/health';
    const monitor = new ServiceMonitor(serviceUrl);
    
    monitor.startMonitoring(5); // Ping every 5 minutes
    
    // Keep the process alive
    process.stdin.resume();
}

module.exports = ServiceMonitor;