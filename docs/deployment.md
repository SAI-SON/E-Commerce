# Vastra E-Commerce Platform — Production Deployment Guide

This guide covers provisioning, environment configuration, database migration, build steps, and deployment strategies for **Vastra**.

---

## 1. System Requirements & Prerequisites

- **Runtime**: Node.js v20.x or higher, npm v10.x or higher
- **Database**: PostgreSQL 14, 15, 16, 17, or 18
- **Memory**: Minimum 1 GB RAM (2 GB recommended for build workflows)
- **Disk**: 500 MB free storage for dependencies, build artifacts, and database volume

---

## 2. Environment Configuration

### Server Environment (`server/.env`)
Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
NODE_ENV=production

# PostgreSQL Database Connection String
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/vastra_db?schema=public"

# Authentication Security
JWT_SECRET="generate-a-strong-random-256-bit-key-for-production"
JWT_EXPIRES_IN="7d"

# CORS Configuration
CLIENT_URL="https://yourstorefront.com"
```

> [!NOTE]
> If your database password contains special characters (such as `@`, `#`, `$`), ensure they are URL-encoded in the connection string (e.g. `@` becomes `%40`).

### Client Environment (`client/.env`)
For standalone deployments where the frontend is not proxied by Nginx:
```env
VITE_API_BASE_URL="https://api.yourstorefront.com/api/v1"
```

---

## 3. Database Migration & Seeding

1. **Apply Prisma Schema Migrations**:
   ```bash
   npm run prisma:migrate --workspace=server
   # Or for production CI/CD without creating new migrations:
   cd server && npx prisma migrate deploy
   ```

2. **Seed Initial Catalogue, Categories, and Default Admin**:
   ```bash
   npm run prisma:seed --workspace=server
   ```
   This deterministically populates:
   - 26 realistic products across apparel and jewellery
   - Multi-attribute variants with initial stock
   - 4 promotional coupons (`VASTRA10`, `FESTIVE25`, `WELCOME500`, `EXPIRED20`)
   - Store Administrator: `admin@vastrastore.com` / `Admin@12345`
   - Test Customer: `customer@vastrastore.com` / `Customer@12345`

---

## 4. Production Build Commands

Execute the root production build command:
```bash
npm run build
```
This compiles both workspaces:
1. `server/dist/`: Compiled Node.js / Express JavaScript code.
2. `client/dist/`: Minified, tree-shaken static assets (HTML, CSS, JS bundles).

---

## 5. Deployment Architectures

### Architecture A: Single-Host / PM2 + Nginx (Recommended for VPS)
In this setup, PM2 manages the Node.js API process, while Nginx serves static client assets and proxies `/api` calls.

#### 1. PM2 Process Configuration (`ecosystem.config.cjs`)
```javascript
module.exports = {
  apps: [
    {
      name: 'vastra-api',
      script: 'server/dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
```
Start the service:
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

#### 2. Nginx Reverse Proxy Configuration
```nginx
server {
    listen 80;
    server_name yourstorefront.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourstorefront.com;

    ssl_certificate /etc/letsencrypt/live/yourstorefront.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourstorefront.com/privkey.pem;

    # Frontend Static Files
    root /var/www/vastra/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Reverse Proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### Architecture B: Decoupled Cloud Deployment
- **Frontend**: Deploy `client/dist` to **Vercel**, **Cloudflare Pages**, or **AWS S3 + CloudFront**.
- **Backend API**: Deploy `server/` to **Render**, **Railway**, **AWS ECS**, or **Google Cloud Run**.
- **Database**: Use a managed PostgreSQL instance on **Supabase**, **Neon**, **AWS RDS**, or **Aiven**.

---

## 6. Health Monitoring & Verification

Verify platform operational status using the built-in health endpoint:
```bash
curl -i https://yourstorefront.com/api/v1/health
```
Expected response:
```json
{
  "status": "healthy",
  "service": "Vastra E-Commerce API",
  "version": "1.0.0",
  "database": "connected",
  "timestamp": "2026-10-16T15:45:00.000Z"
}
```
