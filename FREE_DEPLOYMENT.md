# 🆓 Free MoonMic Server Deployment Guide

## Quick Free Setup (Railway - Recommended)

### Step 1: Prepare Your Repository
1. **Push your code to GitHub** (if not already done)
2. **Make sure the `server` folder is in your repository**

### Step 2: Deploy on Railway (5 minutes)
1. **Go to [Railway.app](https://railway.app)**
2. **Sign up with GitHub** (free)
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your MoonMic repository**
6. **Set the root directory to `server`**
7. **Click "Deploy"**

### Step 3: Get Your Server URL
1. **Wait for deployment to complete** (1-2 minutes)
2. **Click on your project**
3. **Copy the generated URL** (e.g., `https://your-app.railway.app`)
4. **Convert to WebSocket URL**: `wss://your-app.railway.app`

### Step 4: Update Extension
In `content.js`, change:
```javascript
const PRODUCTION_SERVER_URL = 'wss://your-app.railway.app';
```

### Step 5: Test
1. **Reload your extension**
2. **Go to a memecoin page**
3. **Test voice chat!**

## Alternative Free Options

### Render (Also Great)
1. **Go to [Render.com](https://render.com)**
2. **Sign up with GitHub**
3. **Create "Web Service"**
4. **Connect your repository**
5. **Set build command**: `cd server && npm install`
6. **Set start command**: `cd server && npm start`
7. **Deploy and get your URL**

### Glitch (Always Free)
1. **Go to [Glitch.com](https://glitch.com)**
2. **Create new project**
3. **Upload your server files**
4. **Get your URL instantly**

## Free Tier Limits

| Platform | Free Hours | Sleep | Perfect For |
|----------|------------|-------|-------------|
| Railway | 500/month | No | Production use |
| Render | 750/month | Yes | Development |
| Glitch | Unlimited | Yes | Prototyping |

## Cost Breakdown

### Railway Free Tier
- ✅ **500 hours/month** (enough for ~16 hours/day)
- ✅ **No sleep** - always available
- ✅ **Custom domains** supported
- ✅ **SSL included**
- ❌ **Sleeps after 500 hours** (upgrade to $5/month for unlimited)

### Render Free Tier
- ✅ **750 hours/month** (enough for ~25 hours/day)
- ✅ **Sleeps after 15 minutes** of inactivity
- ✅ **SSL included**
- ❌ **Cold starts** when waking up

## Recommendation

**Use Railway** for the best free experience:
- No sleep = instant connections
- 500 hours = plenty for testing
- Easy deployment
- Can upgrade later if needed

## Quick Commands

```bash
# Test your deployment
curl https://your-app.railway.app/health

# Should return: {"status":"ok","timestamp":"..."}
```

## Troubleshooting

### Connection Issues
- Check server URL is correct
- Ensure `wss://` protocol (not `ws://`)
- Verify server is running (check Railway dashboard)

### Audio Issues
- Allow microphone permissions
- Check browser console for errors
- Test with multiple users

### Free Tier Limits
- Monitor usage in Railway dashboard
- Consider upgrading if you hit limits
- Render is good backup option

## Next Steps After Free Deployment

1. **Test thoroughly** with multiple users
2. **Monitor usage** in your platform dashboard
3. **Consider upgrading** if you need more hours
4. **Add custom domain** for branding (optional)

## Support

If you hit free tier limits:
- **Railway**: Upgrade to $5/month for unlimited
- **Render**: Upgrade to $7/month for always-on
- **Switch platforms**: Easy migration between services 