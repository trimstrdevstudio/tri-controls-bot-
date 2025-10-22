const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const router = express.Router();
const pino = require("pino");

const { upload, generateSessionId } = require('./mega');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");

const authDir = path.join(__dirname, 'auth_info_baileys');

const MESSAGE = `*TRI CONTROLS BOT - SESSION GENERATED SUCCESSFULLY* ✅

🤖 *BOT NAME:* TRI CONTROLS BOT
🏢 *COMPANY:* TRI MSTR DEV STUDIO
👤 *OWNER:* GHOSTTRI

📱 *WHATSAPP CHANNEL:*
https://whatsapp.com/channel/0029VazawLiDp2QEO1Ttwg28

⚡ *POWERED BY TRI MSTR DEV STUDIO*
🚀 *THANKS FOR USING TRI CONTROLS BOT*`;

router.get('/', async (req, res) => {
    let { number } = req.query;

    // Input validation
    if (!number) {
        return res.status(400).json({ error: "Phone number is required" });
    }

    number = number.replace(/[^0-9]/g, '');
    
    if (number.length < 10) {
        return res.status(400).json({ error: "Invalid phone number format" });
    }

    console.log(`🔐 Pairing request for: ${number}`);

    // Clean auth directory
    if (fs.existsSync(authDir)) {
        fs.emptyDirSync(authDir);
    } else {
        fs.mkdirSync(authDir, { recursive: true });
    }

    async function startPairing() {
        const { state, saveCreds } = await useMultiFileAuthState(authDir);

        try {
            const bot = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
                connectTimeoutMs: 120000, // Increased for Render
            });

            if (!bot.authState.creds.registered) {
                await delay(2000);
                const code = await bot.requestPairingCode(number);
                console.log(`✅ Pairing code generated: ${code}`);
                
                if (!res.headersSent) {
                    return res.json({ code });
                }
                return;
            }

            bot.ev.on('creds.update', saveCreds);
            
            bot.ev.on("connection.update", async (update) => {
                const { connection } = update;

                if (connection === "open") {
                    console.log("✅ WhatsApp Connected via Pair Code!");
                    
                    try {
                        await delay(4000);
                        
                        const credsPath = path.join(authDir, 'creds.json');
                        if (fs.existsSync(credsPath)) {
                            const user = bot.user.id;
                            const fileName = `TRI_PAIR_${generateSessionId()}.json`;

                            try {
                                const megaUrl = await upload(credsPath, fileName);
                                const sessionId = megaUrl.split('/file/')[1]?.split('#')[0];
                                
                                if (sessionId) {
                                    const successMsg = `*TRI CONTROLS BOT - SESSION ID* 🔑\n\n\`\`\`${sessionId}\`\`\`\n\n💾 Save this ID for future use!\n📁 File: ${fileName}`;
                                    await bot.sendMessage(user, { text: successMsg });
                                    await delay(1500);
                                    await bot.sendMessage(user, { text: MESSAGE });
                                    console.log("✅ Pair Session completed successfully");
                                }
                                
                            } catch (uploadError) {
                                console.error('❌ MEGA Upload failed:', uploadError.message);
                                await bot.sendMessage(user, { text: "❌ Cloud upload failed. Session not saved." });
                            }

                            // Cleanup
                            await fs.emptyDirSync(authDir);
                        }
                        
                        // Close connection gracefully
                        await bot.ws.close();
                        console.log("✅ Connection closed successfully");
                        
                    } catch (error) {
                        console.error('❌ Session processing error:', error.message);
                    }
                }
            });

            // Render timeout handler
            setTimeout(() => {
                if (!res.headersSent) {
                    console.log('⏰ Pairing timeout');
                    res.status(408).json({ error: "Pairing timeout - Please try again" });
                }
            }, 120000);

        } catch (error) {
            console.error('❌ Pairing system error:', error.message);
            if (!res.headersSent) {
                res.status(500).json({ error: "Service temporarily unavailable" });
            }
            // Cleanup on error
            try {
                await fs.emptyDirSync(authDir);
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError.message);
            }
        }
    }

    await startPairing();
});

module.exports = router;