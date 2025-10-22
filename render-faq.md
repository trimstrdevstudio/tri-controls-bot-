# Render Deployment FAQ & Troubleshooting

## Common Issues & Solutions

### ❌ Build Fails
**Error:** `npm install fails`
**Solution:**
- Check Node version in package.json (use 18.x)
- Ensure all dependencies are correctly spelled
- Check render.yaml build command

### ❌ Application Crashes
**Error:** `Application error` or `Service unavailable`
**Solution:**
- Check Render logs in dashboard
- Verify environment variables are set
- Ensure PORT is set to 8000

### ❌ MEGA Upload Fails
**Error:** `MEGA authentication failed`
**Solution:**
- Verify MEGA_EMAIL and MEGA_PASSWORD in environment variables
- Check MEGA account credentials
- Ensure MEGA account is active

### ❌ Service Sleeps
**Issue:** Service goes to sleep after inactivity
**Solution:**
- Set up UptimeRobot to ping /health every 5 minutes
- Use the monitor.js script
- Consider upgrading to paid plan for 24/7 uptime

### ❌ QR/Pair Timeout
**Issue:** QR generation times out
**Solution:**
- This is normal on free tier due to resource limits
- Try the pair code method instead
- Refresh and try again

## Performance Tips for Free Tier

1. **Use Pair Code** - More reliable than QR on free tier
2. **Keep Sessions Short** - Complete setup quickly
3. **Monitor Resources** - Check Render dashboard for memory usage
4. **Use Health Checks** - Helps keep service responsive

## Support Resources

1. **Render Dashboard:** https://dashboard.render.com
2. **Render Docs:** https://render.com/docs
3. **UptimeRobot:** https://uptimerobot.com
4. **MEGA Account:** https://mega.nz

## Quick Commands for Testing

```
# Test health endpoint
curl https://tri-controls-bot.onrender.com/health

# Test main page
curl https://tri-controls-bot.onrender.com

# Run deployment tests
node deployment-test.js
```