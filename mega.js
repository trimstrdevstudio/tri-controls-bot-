const mega = require("megajs");
const fs = require("fs-extra");
const path = require("path");

// MEGA configuration with Render optimization
const auth = {
    email: process.env.MEGA_EMAIL || 'irokzmusicworld@gmail.com',
    password: process.env.MEGA_PASSWORD || 'Tri@369069786',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

// Generate unique session ID
function generateSessionId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'TRI_';
    for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Upload file to MEGA with better error handling
const upload = (filePath, fileName) => {
    return new Promise((resolve, reject) => {
        console.log(`📤 Starting MEGA upload: ${fileName}`);
        
        // Validate file exists
        if (!fs.existsSync(filePath)) {
            console.error('❌ File not found:', filePath);
            return reject(new Error('File not found'));
        }

        try {
            const storage = new mega.Storage(auth, (err) => {
                if (err) {
                    console.error('❌ MEGA Storage Error:', err.message);
                    reject(new Error('MEGA authentication failed'));
                    return;
                }
                
                console.log('✅ MEGA Storage connected');
                
                const readStream = fs.createReadStream(filePath);
                const uploadStream = storage.upload({ 
                    name: fileName, 
                    allowUploadBuffering: true 
                });
                
                readStream.pipe(uploadStream);
                
                uploadStream.on('complete', (file) => {
                    console.log('✅ File uploaded to MEGA, generating link...');
                    file.link((err, url) => {
                        if (err) {
                            console.error('❌ MEGA Link Error:', err.message);
                            storage.close();
                            reject(new Error('Failed to generate download link'));
                            return;
                        }
                        console.log('✅ MEGA URL generated successfully');
                        storage.close();
                        resolve(url);
                    });
                });
                
                uploadStream.on('error', (err) => {
                    console.error('❌ MEGA Upload Error:', err.message);
                    storage.close();
                    reject(new Error('Upload failed'));
                });
                
                readStream.on('error', (err) => {
                    console.error('❌ File Read Error:', err.message);
                    storage.close();
                    reject(new Error('File read error'));
                });
            });
            
            storage.on('error', (err) => {
                console.error('❌ MEGA Connection Error:', err.message);
                reject(new Error('MEGA connection failed'));
            });
            
            // Timeout for MEGA operations
            setTimeout(() => {
                storage.close();
                reject(new Error('MEGA upload timeout'));
            }, 30000);
            
        } catch (error) {
            console.error('❌ MEGA Upload Catch Error:', error.message);
            reject(new Error('Upload process failed'));
        }
    });
};

module.exports = { upload, generateSessionId };