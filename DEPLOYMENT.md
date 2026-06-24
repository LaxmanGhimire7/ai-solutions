# AI-Solutions Deployment Guide

Deploy the backend first so you can copy its Render URL into the Vercel frontend environment variables.

## 1. Backend on Render

Use the root `render.yaml` blueprint, or create a Render Web Service manually with these settings:

- Root directory: `Backend`
- Runtime: `Node`
- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/health`

Required Render environment variables:

```env
NODE_ENV=production
NODE_VERSION=20
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=use-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173,https://ai-solutions-laxman.vercel.app
ENABLE_REALTIME_CHAT=true

ADMIN_EMAIL=your-admin-email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_FROM_NAME=AI-Solutions
SMTP_FROM_EMAIL=your-sending-email@gmail.com
SMTP_USER=your-sending-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

After Render finishes deployment, test:

```txt
https://your-render-service.onrender.com/health
```

Expected response includes:

```json
{
  "status": "ok"
}
```

## 2. Frontend on Vercel

If importing the whole GitHub repo into Vercel, the root `vercel.json` is already configured.

If setting a Vercel root directory manually, use:

- Root directory: `Frontend`
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`

Required Vercel environment variables:

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
VITE_SOCKET_URL=https://your-render-service.onrender.com
```

Deploy the frontend, then copy the final Vercel URL.

## 3. Update Render CORS

Go back to Render and update:

```env
CLIENT_URL=https://ai-solutions-laxman.vercel.app
```

For local testing plus deployed frontend:

```env
CLIENT_URL=http://localhost:5173,https://ai-solutions-laxman.vercel.app
```

Restart the Render service after changing environment variables.

## 4. Final Test Checklist

- Open the Vercel website.
- Submit the Contact form and confirm it appears in MongoDB.
- Confirm the admin receives the Gmail SMTP notification.
- Log in to `/admin/login`.
- Open the dashboard and confirm inquiries load.
- Test CSV export.
- Create/edit/delete one service, article, event, project, gallery item, and testimonial.
- Refresh direct routes such as `/admin/dashboard` and `/projects` to confirm Vercel rewrites work.

## Notes

- Do not commit `.env`, `.env.local`, or app passwords.
- Render free services can sleep after inactivity, so the first request may be slow.
- Local uploaded images on Render are stored on the service filesystem and may be lost after redeploys. For the university demo, this is acceptable, but permanent production uploads would need cloud storage.
