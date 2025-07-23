o   # 🚂 Railway Deployment Guide for MoonMic

## Why Railway?
- ✅ **500 free hours/month** - Enough for ~16 hours/day
- ✅ **No sleep** - Always available, instant connections
- ✅ **Easy deployment** - 5 minutes setup
- ✅ **SSL included** - Secure WebSocket connections
- ✅ **Custom domains** - Professional URLs

## Step-by-Step Railway Setup

### Step 1: Connect Your Repository
1. **Go to [Railway.app](https://railway.app)**
2. **Sign in with GitHub** (if not already done)
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your MoonMic repository**
6. **Click "Deploy"**

### Step 2: Configure the Project
1. **Wait for Railway to detect your project**
2. **Set the root directory to `server`**
   - Click on your project
   - Go to "Settings" tab
   - Find "Root Directory" setting
   - Change it to `server`
   - Click "Save"
3. **Railway will automatically detect it's a Node.js project**

### Step 3: Set Environment Variables
1. **Go to "Variables" tab**
2. **Add these environment variables:**
   ```
   PORT=3000
   NODE_ENV=production
   ```
3. **Click "Add" for each variable**

### Step 4: Deploy
1. **Railway will automatically start building**
2. **Watch the build logs** - you should see:
   ```
   Installing dependencies...
   Starting server...
   ```
3. **Wait for "Deploy Successful" message**

### Step 5: Get Your Server URL
1. **Go to "Settings" tab**
2. **Look for "Domains" section**
3. **Copy your generated URL** (e.g., `https://your-app.railway.app`)
4. **Your WebSocket URL is**: `wss://your-app.railway.app`

### Step 6: Update Extension
In `content.js`, change:
```javascript
const PRODUCTION_SERVER_URL = 'wss://your-app.railway.app';
```

### Step 7: Test
1. **Reload your extension**
2. **Go to a memecoin page**
3. **Test voice chat!**

## Railway Dashboard Overview

### Main Tabs:
- **Deployments** - See build history and logs
- **Variables** - Environment variables
- **Settings** - Project configuration
- **Metrics** - Usage and performance

### Important Settings:
- **Root Directory**: `server`
- **Build Command**: `npm install` (auto-detected)
- **Start Command**: `npm start` (auto-detected)

## Testing Your Railway Deployment

### 1. Health Check
```bash
curl https://your-app.railway.app/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 2. WebSocket Test
Open browser console and run:
```javascript
const ws = new WebSocket('wss://your-app.railway.app');
ws.onopen = () => console.log('✅ Connected to Railway!');
ws.onmessage = (e) => console.log('📥 Message:', e.data);
```

### 3. Extension Test
1. **Update extension with Railway URL**
2. **Reload extension**
3. **Test on memecoin page**

## Railway-Specific Features

### Auto-Deploy
- **Railway auto-deploys** when you push to GitHub
- **No manual deployment needed**
- **Instant updates**

### Monitoring
- **Real-time logs** in dashboard
- **Performance metrics**
- **Usage tracking**

### Scaling
- **Free tier**: 500 hours/month
- **Upgrade**: $5/month for unlimited
- **Easy scaling** with one click

## Troubleshooting

### Build Fails
1. **Check logs** in "Deployments" tab
2. **Verify `package.json`** has correct dependencies
3. **Check root directory** is set to `server`

### Connection Issues
1. **Verify URL** - Use `wss://` not `ws://`
2. **Check CORS** - Should be configured for Chrome extensions
3. **Test health endpoint** - Make sure server is running

### Environment Variables
1. **Go to "Variables" tab**
2. **Add missing variables**
3. **Redeploy** after adding variables

## Pro Tips

### Custom Domain (Optional)
1. **Go to "Settings" → "Domains"**
2. **Add custom domain**
3. **Update DNS records**
4. **Update extension URL**

### Monitoring Usage
1. **Check "Metrics" tab**
2. **Monitor free tier usage**
3. **Upgrade if needed**

### Backup Strategy
- **Railway is reliable** but keep GitHub backup
- **Easy migration** to other platforms
- **No vendor lock-in**

## Cost Management

### Free Tier Limits
- **500 hours/month** = ~16 hours/day
- **Perfect for testing** and small usage
- **Upgrade only if needed**

### When to Upgrade
- **Consistent usage** over 16 hours/day
- **Production deployment**
- **Multiple users**

## Next Steps

1. **Deploy to Railway** (follow steps above)
2. **Test thoroughly** with multiple users
3. **Monitor usage** in Railway dashboard
4. **Consider custom domain** for branding

## Support

If you have issues:
1. **Check Railway logs** - "Deployments" tab
2. **Verify environment variables** - "Variables" tab
3. **Test health endpoint** - Verify server is running
4. **Check extension console** - Look for connection errors

Railway is perfect for production-ready voice chat hosting! 🚂✨ 