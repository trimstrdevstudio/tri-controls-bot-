const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files serving - IMPORTANT for music
app.use(express.static(path.join(__dirname)));
app.use('/public', express.static(path.join(__dirname, 'public')));

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

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'TRI CONTROLS BOT is running smoothly',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// Music status endpoint
app.get('/music-status', (req, res) => {
    const musicPath = path.join(__dirname, 'public', 'music', 'SENTE MAIS - Eternxlkz.mp3');
    const musicExists = fs.existsSync(musicPath);
    
    res.json({
        music_available: musicExists,
        music_url: '/public/music/SENTE MAIS - Eternxlkz.mp3',
        song_name: 'SENTE MAIS - Eternxlkz',
        status: musicExists ? 'Music file found' : 'Music file missing'
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
        available_routes: ['/', '/pair', '/qr-page', '/health', '/music-status']
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║           TRI CONTROLS BOT            ║');
    console.log('║           🚀 WITH BACKGROUND MUSIC    ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`📍 Port: ${PORT}`);
    console.log(`🎵 Music: SENTE MAIS - Eternxlkz.mp3`);
    console.log(`🌐 Main: http://localhost:${PORT}`);
    console.log(`❤️  Developer: GHOSTTRI`);
    console.log(`🏢 Company: TRI MSTR DEV STUDIO`);
    console.log('══════════════════════════════════════════');
    
    // Check if music file exists
    const musicPath = path.join(__dirname, 'public', 'music', 'SENTE MAIS - Eternxlkz.mp3');
    if (fs.existsSync(musicPath)) {
        console.log('✅ Background music file found and ready!');
    } else {
        console.log('⚠️  Music file not found. Please upload SENTE MAIS - Eternxlkz.mp3 to public/music/');
    }
});

module.exports = app;
