# Deployment Guide

## 🚀 Development Commands

### Backend (Colyseus Server)

```bash
cd backend
npm install
npm run dev
```

Server will run on `http://localhost:2567`

### Frontend (Angular)

```bash
cd frontend
npm install
ng serve
```

App will run on `http://localhost:4200`

## 📦 Production Build Commands

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
ng build --configuration production
```

Build files will be in `frontend/dist/`

## 🌍 Production Deployment Checklist

### 1. Backend Environment Variables

Set these on your hosting platform (Heroku, Railway, Render, etc.):

- `NODE_ENV=production`
- `PORT=2567` (or your platform's default)
- `CORS_ORIGIN=https://your-frontend-domain.com` (your actual frontend URL)

### 2. Frontend Environment Variables

Update `frontend/src/environments/environment.production.ts`:

```typescript
export const environment = {
  production: true,
  wsUrl: 'wss://your-backend-domain.com', // IMPORTANT: Use wss:// (secure WebSocket)
};
```

### 3. Critical Production Changes

#### Backend

- [ ] Update `CORS_ORIGIN` to your actual frontend domain
- [ ] Use `wss://` (secure WebSocket) instead of `ws://`
- [ ] Consider protecting `/monitor` route with password
- [ ] Remove or protect playground route
- [ ] Set up SSL/TLS certificate

#### Frontend

- [ ] Update `wsUrl` to production backend URL with `wss://`
- [ ] Build with `--configuration production`
- [ ] Test WebSocket connection thoroughly
- [ ] Enable HTTPS on frontend hosting

### 4. Security Considerations

- [ ] Never commit `.env` files to git (already in `.gitignore`)
- [ ] Use environment variables on hosting platform
- [ ] Enable CORS only for specific domains in production
- [ ] Add authentication if needed
- [ ] Monitor rate limiting

### 5. Testing Production Build Locally

#### Backend

```bash
cd backend
NODE_ENV=production npm start
```

#### Frontend

```bash
cd frontend
ng build --configuration production
npx http-server dist/frontend -p 8080
```

Then test at `http://localhost:8080`

## 🐛 Common Issues

### "Failed to join room" errors

- Check that backend is running and accessible
- Verify CORS settings allow your frontend domain
- Ensure you're using `wss://` in production (not `ws://`)

### WebSocket connection fails

- Check firewall settings
- Verify SSL/TLS certificate is valid
- Ensure WebSocket upgrades are enabled on your hosting platform

### CORS errors

- Update `CORS_ORIGIN` in backend `.env` to match your frontend domain
- Don't use `*` in production

## 📱 Recommended Hosting Platforms

### Backend (Colyseus)

- Railway.app (easiest, good free tier)
- Render.com
- Heroku
- DigitalOcean

### Frontend (Angular)

- Vercel (easiest deployment)
- Netlify
- Firebase Hosting
- Cloudflare Pages

## 🔗 Port Configuration

Default ports:

- Backend: `2567` (Colyseus default)
- Frontend Dev: `4200` (Angular default)
- Frontend Prod: Depends on hosting platform
