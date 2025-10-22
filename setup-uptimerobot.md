# UptimeRobot Setup Guide

## Keep Your Render Service Awake 24/7

### Step 1: Sign Up for UptimeRobot
1. Go to https://uptimerobot.com/
2. Click "Sign Up" (Free plan)
3. Verify your email

### Step 2: Add Monitor
1. Click "+ Add New Monitor"
2. Configure these settings:

**Monitor Type:** HTTP(s)
**Friendly Name:** TRI CONTROLS BOT
**URL:** https://tri-controls-bot.onrender.com/health
**Monitoring Interval:** 5 minutes

### Step 3: Alert Settings
- **Alert Contact:** Your email
- **Alert When:** Down, Up

### Step 4: Save
Click "Create Monitor"

✅ Your service will now be pinged every 5 minutes, keeping it awake!