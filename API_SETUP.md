# YouTube Download API Setup Guide

This guide will help you set up your own YouTube download API instance to use with YtDown.

## Why Host Your Own API?

Public YouTube download APIs can be:
- Unreliable or slow due to high traffic
- Unavailable or shut down without notice
- Rate-limited for free tiers

By hosting your own instance, you have full control and guaranteed availability.

## Quick Start with Local Development

### Prerequisites
- Node.js 14+ installed
- Git installed

### Steps

1. **Clone the API repository**
   ```bash
   git clone https://github.com/MatheusIshiyama/youtube-download-api.git
   cd youtube-download-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the API server**
   ```bash
   npm start
   ```
   
   The API will be available at `http://localhost:3500`

4. **Update YtDown to use your local API**
   
   Edit `app.js` and modify the `API_ENDPOINTS` array:
   ```javascript
   const API_ENDPOINTS = [
       'http://localhost:3500',  // Your local API
       // Keep other endpoints as fallbacks
       'https://youtube-download-api.matheusishiyama.repl.co',
       'https://youtube-download-api-7jxd.onrender.com',
   ];
   ```

5. **Test the setup**
   - Open `index.html` in your browser
   - Paste a YouTube URL
   - Click "Fetch Info" and verify it works

## Deploy to Production

### Option 1: Deploy to Render (Free Tier)

1. Create an account at [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Fork the [youtube-download-api](https://github.com/MatheusIshiyama/youtube-download-api) repository
5. Select your forked repository
6. Configure:
   - **Name**: `youtube-download-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
7. Click "Create Web Service"
8. Wait for deployment (usually 2-5 minutes)
9. Copy the URL (e.g., `https://your-api-name.onrender.com`)
10. Update `API_ENDPOINTS` in YtDown's `app.js`

**Note**: Free tier on Render spins down after inactivity. First request may be slow.

### Option 2: Deploy to Railway (Free Tier)

1. Create an account at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select the youtube-download-api repository
4. Railway will auto-detect and deploy
5. Copy the deployment URL
6. Update `API_ENDPOINTS` in YtDown's `app.js`

### Option 3: Deploy to Vercel (Serverless)

1. Create an account at [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import the youtube-download-api repository
4. Configure as a Node.js project
5. Deploy
6. Copy the deployment URL
7. Update `API_ENDPOINTS` in YtDown's `app.js`

### Option 4: Deploy to Heroku

1. Create an account at [heroku.com](https://heroku.com)
2. Install Heroku CLI
3. Clone the API repository
4. Run:
   ```bash
   heroku login
   heroku create your-app-name
   git push heroku main
   ```
5. Copy the deployment URL
6. Update `API_ENDPOINTS` in YtDown's `app.js`

## Configuring Multiple Endpoints

For maximum reliability, configure multiple API endpoints:

```javascript
const API_ENDPOINTS = [
    'https://your-primary-api.com',      // Your main deployment
    'http://localhost:3500',             // Local development
    'https://your-backup-api.com',       // Backup deployment
    'https://youtube-download-api.matheusishiyama.repl.co',  // Public fallback
];
```

YtDown will automatically try each endpoint in order until one works.

## Troubleshooting

### API not responding
- Check if the API server is running
- Verify the URL is correct
- Check server logs for errors

### CORS errors
- The API should have CORS enabled by default
- If you modified the API, ensure `cors()` middleware is added

### Rate limiting
- Consider implementing rate limiting on your API
- Use environment variables for configuration
- Monitor your API usage

## Security Considerations

⚠️ **Important Security Notes:**

1. **Personal Use Only**: These APIs are for personal use. Don't expose them publicly without proper security measures.

2. **Rate Limiting**: Implement rate limiting to prevent abuse:
   ```bash
   npm install express-rate-limit
   ```

3. **Authentication**: Consider adding API key authentication for production use.

4. **HTTPS**: Always use HTTPS in production (most hosting platforms provide this automatically).

5. **Monitoring**: Set up monitoring to track API usage and performance.

## Support

For API-related issues:
- [youtube-download-api GitHub Issues](https://github.com/MatheusIshiyama/youtube-download-api/issues)

For YtDown issues:
- [YtDown GitHub Issues](https://github.com/HugeSmile01/YtDown/issues)

## License

The youtube-download-api is licensed under MIT License. Check the repository for details.
