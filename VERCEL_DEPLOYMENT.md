# Vercel Deployment Guide

This guide will help you deploy your HedgeEdge trading terminal to production using Vercel for the frontend and Railway/Render for the backend.

## Architecture

- **Frontend**: Deployed to Vercel (Next.js)
- **Backend**: Deployed to Railway, Render, or similar Python hosting platform (FastAPI)

## Step 1: Deploy Backend (Railway Recommended)

### Option A: Railway (Recommended)

1. Go to [Railway.app](https://railway.app/) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `HedgeEdge` repository
4. Railway will auto-detect the backend

5. **Add Environment Variables** in Railway dashboard:
   ```
   ALPHA_VANTAGE_API_KEY=32UU6T1JSARRJED0
   FRED_API_KEY=12821e92d290a9548c98e9672aa30b20
   FMP_API_KEY=RGQP1PyEB8FdQ9MXaBQKUGea5yhm2KEl
   NEWS_API_KEY=2e0038de158446508bb39b46b0460abd
   DATABASE_URL=postgresql://user:password@host/db
   REDIS_URL=redis://host:6379/0
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

6. Set the root directory to `backend`
7. Set the start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
8. Deploy and copy your backend URL (e.g., `https://your-app.railway.app`)

### Option B: Render

1. Go to [Render.com](https://render.com/) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: hedgeedge-backend
   - **Root Directory**: backend
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. Add the same environment variables as above
6. Deploy and copy your backend URL

## Step 2: Deploy Frontend to Vercel

### Via Vercel Dashboard (Easiest)

1. Go to [Vercel.com](https://vercel.com/) and sign up/login with GitHub
2. Click "Add New..." → "Project"
3. Import your `HedgeEdge` repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: frontend
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

5. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add variable:
     - **Name**: `NEXT_PUBLIC_API_URL`
     - **Value**: `https://your-backend.railway.app` (your backend URL from Step 1)
     - **Environment**: Production, Preview, Development

6. Click "Deploy"
7. Wait for deployment to complete (2-3 minutes)
8. Visit your live site at `https://your-app.vercel.app`

### Via Vercel CLI (Alternative)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from the frontend directory:
   ```bash
   cd frontend
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N**
   - Project name? `hedgeedge-frontend`
   - In which directory is your code located? `./`
   - Want to override settings? **N**

5. Add environment variables:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   ```
   Then paste your backend URL

6. Deploy to production:
   ```bash
   vercel --prod
   ```

## Step 3: Update Backend CORS

After deploying, update your backend's ALLOWED_ORIGINS to include your Vercel URL:

In your backend hosting platform (Railway/Render), update the environment variable:
```
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
```

## Step 4: Verify Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Check that the dashboard loads
3. Verify market data is loading (check Network tab)
4. Test portfolio, watchlist, and macro pages

## Troubleshooting

### API Calls Failing

**Problem**: "Failed to fetch" or CORS errors

**Solutions**:
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Ensure backend ALLOWED_ORIGINS includes your Vercel URL
- Check backend logs for errors
- Redeploy frontend after changing environment variables

### Backend Not Starting

**Problem**: Backend crashes on startup

**Solutions**:
- Check all API keys are set in backend environment variables
- Verify DATABASE_URL is correct (use PostgreSQL for production)
- Check backend logs for specific errors
- Ensure Python version is 3.11+ in hosting settings

### Environment Variables Not Working

**Problem**: Still using localhost API

**Solutions**:
- Redeploy after adding environment variables
- Check environment variables are set for "Production" environment
- Clear Vercel cache and redeploy
- Verify variable name starts with `NEXT_PUBLIC_` for client-side access

## Database Considerations

For production, you should use PostgreSQL instead of SQLite:

1. **Railway**: Comes with PostgreSQL
   - Add "New" → "Database" → "PostgreSQL"
   - Copy the connection string
   - Set as `DATABASE_URL` environment variable

2. **Render**: Offers free PostgreSQL
   - Create new PostgreSQL database
   - Copy the internal connection string
   - Set as `DATABASE_URL` environment variable

3. **Supabase** (Alternative):
   - Create project at [Supabase.com](https://supabase.com/)
   - Get connection string from settings
   - Set as `DATABASE_URL` environment variable

## Environment Variables Summary

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### Backend (Railway/Render)
```
ALPHA_VANTAGE_API_KEY=32UU6T1JSARRJED0
FRED_API_KEY=12821e92d290a9548c98e9672aa30b20
FMP_API_KEY=RGQP1PyEB8FdQ9MXaBQKUGea5yhm2KEl
NEWS_API_KEY=2e0038de158446508bb39b46b0460abd
DATABASE_URL=postgresql://user:password@host/db
REDIS_URL=redis://host:6379/0
ALLOWED_ORIGINS=https://your-frontend.vercel.app
API_V1_PREFIX=/api/v1
PROJECT_NAME=Principle Trading Terminal
DEBUG=False
```

## Monitoring

- **Vercel**: Check deployment logs in dashboard
- **Railway**: View logs in project dashboard
- **Render**: View logs in service dashboard

## Cost Considerations

- **Vercel**: Free tier includes 100GB bandwidth/month
- **Railway**: $5/month after free trial ($5 credit)
- **Render**: Free tier available (slower cold starts)

## Custom Domain (Optional)

1. In Vercel dashboard, go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update backend ALLOWED_ORIGINS to include custom domain

---

**You're now live! 🚀**

Your trading terminal should be accessible at your Vercel URL with real-time market data, portfolio tracking, and macroeconomic indicators.
