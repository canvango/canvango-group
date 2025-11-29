# Tripay Proxy Server - Static IP Solution

Simple proxy server to be deployed on VPS with static IP for Tripay API whitelist.

## Why?

Tripay requires IP whitelisting, but Vercel/Supabase use dynamic IPs. This proxy runs on a VPS with static IP.

## Setup

### 1. Get VPS with Static IP

**Recommended providers:**
- DigitalOcean Droplet: $4/month (https://digitalocean.com)
- Vultr: $2.50/month (https://vultr.com)
- Linode: $5/month (https://linode.com)
- Contabo: €4/month (https://contabo.com)

### 2. Deploy to VPS

```bash
# SSH to your VPS
ssh root@YOUR_VPS_IP

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Create app directory
mkdir -p /var/www/tripay-proxy
cd /var/www/tripay-proxy

# Upload files (or use git clone)
# Copy server.js and package.json to this directory

# Install dependencies
npm install

# Install PM2 for process management
npm install -g pm2

# Start server
pm2 start server.js --name tripay-proxy

# Make it start on boot
pm2 startup
pm2 save
```

### 3. Setup Nginx (Optional - for HTTPS)

```bash
# Install Nginx
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/tripay-proxy
```

Add this config:
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tripay-proxy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Get Static IP

```bash
curl ifconfig.me
```

This IP is your **static IP** to whitelist in Tripay.

### 5. Add to Tripay Whitelist

Login to Tripay → Settings → IP Whitelist → Add your VPS IP

## Usage

Your proxy will be available at:
```
http://YOUR_VPS_IP:3000/tripay/create-payment
```

Or with domain:
```
https://proxy.yourdomain.com/tripay/create-payment
```

## Cost

- VPS: $2.50 - $5/month
- Domain (optional): $10/year
- SSL (optional): Free with Let's Encrypt

## Security

- Only accept requests from your domain (CORS)
- Use environment variables for sensitive data
- Enable firewall (UFW)
- Keep Node.js updated

## Monitoring

```bash
# Check status
pm2 status

# View logs
pm2 logs tripay-proxy

# Restart
pm2 restart tripay-proxy
```
