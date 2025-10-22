const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Import routes
const qrRoute = require('./qr');
const pairRoute = require('./pair');

// Use routes
app.use('/qr', qrRoute);
app.use('/code', pairRoute);

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

app.get('/pair', (req, res) => {
    res.sendFile(path.join(__dirname, 'pair.html'));
});

app.get('/qr-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'qr.html'));
});

// Health check endpoint (IMPORTANT for Render)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'TRI CONTROLS BOT is running smoothly on Render',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// Root endpoint
app.get('/api', (req, res) => {
    res.json({ 
        message: 'TRI CONTROLS BOT API',
        endpoints: ['/', '/pair', '/qr-page', '/health']
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        available_routes: ['/', '/pair', '/qr-page', '/health', '/api']
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║           TRI CONTROLS BOT            ║');
    console.log('║           🚀 DEPLOYED ON RENDER       ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 Server: 0.0.0.0`);
    console.log(`❤️  Developer: GHOSTTRI`);
    console.log(`🏢 Company: TRI MSTR DEV STUDIO`);
    console.log('══════════════════════════════════════════');
    
    // Log environment info
    console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
    console.log(`📧 MEGA Email: ${process.env.MEGA_EMAIL ? 'Configured' : 'Not Set'}`);
});

module.exports = app;