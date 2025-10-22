const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const QRCode = require('qrcode');
const router = express.Router();
const pino = require("pino");

const { upload, generateSessionId } = require('./mega');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay,
    Browsers
} = require("@whiskeysockets/baileys");

const authDir = path.join(__dirname, 'auth_info_baileys');

const MESSAGE = `*TRI CONTROLS BOT - SESSION GENERATED SUCCESSFULLY* ✅

🤖 *BOT NAME:* TRI CONTROLS BOT
🏢 *COMPANY:* TRI MSTR DEV STUDIO
👤 *OWNER:* GHOSTTRI

📱 *WHATSAPP CHANNEL:*
https://whatsapp.com/channel/0029VazawLiDp2QEO1Ttwg28

⚡ *POWERED BY TRI MSTR DEV STUDIO*`;

// Clean auth directory on start
if (fs.existsSync(authDir)) {
    fs.emptyDirSync(authDir);
} else {
    fs.mkdirSync(authDir, { recursive: true });
}

router.get('/', async (req, res) => {
    // Set longer timeout for Render
    req.setTimeout(120000);
    
    try {
        const { state, saveCreds } = await useMultiFileAuthState(authDir);
        
        const bot = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }),
            browser: Browsers.macOS("Desktop"),
            connectTimeoutMs: 120000, // Increased timeout
        });

        bot.ev.on('creds.update', saveCreds);

        bot.ev.on("connection.update", async (update) => {
            const { connection, qr } = update;

            if (qr) {
                console.log("📱 QR Code Generated");
                try {
                    const qrBuffer = await QRCode.toBuffer(qr);
                    
                    if (!res.headersSent) {
                        res.setHeader('Content-Type', 'image/png');
                        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                        res.send(qrBuffer);
                    }
                } catch (error) {
                    console.error('QR Generation Error:', error);
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'QR Generation Failed' });
                    }
                }
            }

            if (connection === "open") {
                console.log("✅ WhatsApp Connected via QR!");
                
                try {
                    await delay(5000);
                    const credsPath = path.join(authDir, 'creds.json');
                    
                    if (fs.existsSync(credsPath)) {
                        const user = bot.user.id;
                        const fileName = `TRI_QR_${generateSessionId()}.json`;

                        try {
                            const megaUrl = await upload(credsPath, fileName);
                            const sessionId = megaUrl.split('/file/')[1]?.split('#')[0];
                            
                            if (sessionId) {
                                const successMsg = `*TRI CONTROLS BOT - SESSION ID* 🔑\n\n\`\`\`${sessionId}\`\`\`\n\n💾 Save this ID for future use!`;
                                await bot.sendMessage(user, { text: successMsg });
                                await delay(1000);
                                await bot.sendMessage(user, { text: MESSAGE });
                                console.log("✅ QR Session completed successfully");
                            }
                            
                        } catch (uploadError) {
                            console.error('❌ Upload failed:', uploadError);
                        }

                        // Cleanup
                        await fs.emptyDirSync(authDir);
                    }
                    
                    await bot.ws.close();
                    
                } catch (error) {
                    console.error('❌ QR session error:', error);
                }
            }
        });

        // Render-friendly timeout handler
        setTimeout(() => {
            if (!res.headersSent) {
                console.log('⏰ QR Generation Timeout');
                res.status(408).json({ error: 'QR Generation Timeout - Please refresh and try again' });
            }
        }, 60000); // 60 seconds timeout

    } catch (error) {
        console.error('❌ QR route error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Server Error - Please try again' });
        }
        // Cleanup on error
        try {
            await fs.emptyDirSync(authDir);
        } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
        }
    }
});

module.exports = router;