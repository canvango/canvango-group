# Canvango Group - Production Deployment Guide

This guide provides step-by-step instructions for deploying the Canvango Group web application to production environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [SSL/TLS Configuration](#ssltls-configuration)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Backup Strategy](#backup-strategy)
9. [Scaling Considerations](#scaling-considerations)
10. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to production, ensure you have:

- [ ] Production server(s) with adequate resources
- [ ] Domain name configured with DNS
- [ ] SSL/TLS certificate (Let's Encrypt or commercial)
- [ ] PostgreSQL database server
- [ ] Environment variables configured
- [ ] Backup strategy in place
- [ ] Monitoring tools configured
- [ ] Security audit completed
- [ ] Load testing performed
- [ ] Documentation reviewed

### Minimum Server Requirements

#### Backend Server
- **CPU:** 2 cores (4 cores recommended)
- **RAM:** 4GB (8GB recommended)
- **Storage:** 20GB SSD
- **OS:** Ubuntu 20.04 LTS or higher
- **Network:** 100 Mbps

#### Database Server
- **CPU:** 2 cores (4 cores recommended)
- **RAM:** 4GB (8GB recommended)
- **Storage:** 50GB SSD (with room for growth)
- **OS:** Ubuntu 20.04 LTS or higher

#### Frontend Server (if separate)
- **CPU:** 1 core (2 cores recommended)
- **RAM:** 2GB (4GB recommended)
- **Storage:** 10GB SSD
- **OS:** Ubuntu 20.04 LTS or higher

---

## Environment Setup

### 1. Server Preparation

#### Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

#### Install Node.js

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v18.x
npm --version   # Should be v9.x or higher
```

#### Install PostgreSQL

```bash
# Install PostgreSQL 14
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
```

#### Install Nginx (Web Server)

```bash
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Install PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Verify installation
pm2 --version
```

#### Install Git

```bash
sudo apt install -y git
```

### 2. Create Application User

```bash
# Create dedicated user for the application
sudo adduser canvango --disabled-password --gecos ""

# Add to sudo group (optional)
sudo usermod -aG sudo canvango

# Switch to application user
sudo su - canvango
```

---

## Database Setup

### 1. Create Production Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE canvango_production;

# Create user with strong password
CREATE USER canvango_prod WITH ENCRYPTED PASSWORD 'your_very_strong_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE canvango_production TO canvango_prod;

# Exit psql
\q
```

### 2. Configure PostgreSQL for Production

Edit PostgreSQL configuration:

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

Recommended settings:

```conf
# Connection Settings
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB

# Logging
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_timezone = 'UTC'
```

Edit pg_hba.conf for security:

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Add:

```conf
# Local connections
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5

# Remote connections (if needed)
host    canvango_production  canvango_prod  <your_app_server_ip>/32  md5
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### 3. Run Migrations

```bash
cd /home/canvango/canvango-app/backend
npm run migrate
```

### 4. Seed Initial Data (Optional)

```bash
npm run seed
```

**Important:** Change default admin password immediately after seeding!

---

## Backend Deployment

### 1. Clone Repository

```bash
cd /home/canvango
git clone <repository-url> canvango-app
cd canvango-app/backend
```

### 2. Install Dependencies

```bash
npm ci --production
```

### 3. Configure Environment Variables

Create production `.env` file:

```bash
nano .env
```

Production environment variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=canvango_production
DB_USER=canvango_prod
DB_PASSWORD=your_very_strong_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://canvango.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5

# Security
HTTPS_ONLY=true
TRUST_PROXY=true

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/canvango/backend.log
```

**Security Note:** Use strong, unique passwords and secrets. Never commit `.env` to version control.

### 4. Build Application

```bash
npm run build
```

### 5. Configure PM2

Create PM2 ecosystem file:

```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'canvango-backend',
    script: './dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/canvango/backend-error.log',
    out_file: '/var/log/canvango/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

### 6. Start Backend with PM2

```bash
# Create log directory
sudo mkdir -p /var/log/canvango
sudo chown canvango:canvango /var/log/canvango

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Follow the instructions provided by the command

# Check status
pm2 status
pm2 logs canvango-backend
```

### 7. Configure Nginx for Backend

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/canvango-api
```

```nginx
upstream canvango_backend {
    least_conn;
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name api.canvango.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.canvango.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.canvango.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.canvango.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/canvango-api-access.log;
    error_log /var/log/nginx/canvango-api-error.log;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    # Proxy Settings
    location / {
        proxy_pass http://canvango_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://canvango_backend;
    }
}
```

Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/canvango-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Frontend Deployment

### 1. Build Frontend

```bash
cd /home/canvango/canvango-app/frontend
npm ci
```

### 2. Configure Environment Variables

Create production `.env` file:

```bash
nano .env
```

```env
VITE_API_URL=https://api.canvango.com/api
VITE_APP_NAME=Canvango Group
VITE_APP_VERSION=1.0.0
```

### 3. Build for Production

```bash
npm run build
```

This creates optimized files in the `dist` directory.

### 4. Configure Nginx for Frontend

```bash
sudo nano /etc/nginx/sites-available/canvango-frontend
```

```nginx
server {
    listen 80;
    server_name canvango.com www.canvango.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name canvango.com www.canvango.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/canvango.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/canvango.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Root directory
    root /home/canvango/canvango-app/frontend/dist;
    index index.html;

    # Logging
    access_log /var/log/nginx/canvango-frontend-access.log;
    error_log /var/log/nginx/canvango-frontend-error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security - deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/canvango-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## SSL/TLS Configuration

### Using Let's Encrypt (Recommended)

#### 1. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### 2. Obtain SSL Certificates

```bash
# For frontend domain
sudo certbot --nginx -d canvango.com -d www.canvango.com

# For API domain
sudo certbot --nginx -d api.canvango.com
```

#### 3. Auto-Renewal

Certbot automatically sets up renewal. Test it:

```bash
sudo certbot renew --dry-run
```

### Using Commercial SSL Certificate

If using a commercial certificate:

1. Generate CSR:
```bash
openssl req -new -newkey rsa:2048 -nodes -keyout canvango.key -out canvango.csr
```

2. Submit CSR to certificate authority

3. Download certificate files

4. Install certificates:
```bash
sudo mkdir -p /etc/ssl/canvango
sudo cp canvango.crt /etc/ssl/canvango/
sudo cp canvango.key /etc/ssl/canvango/
sudo chmod 600 /etc/ssl/canvango/canvango.key
```

5. Update Nginx configuration to point to certificate files

---

## Monitoring and Logging

### 1. Application Monitoring with PM2

```bash
# Monitor in real-time
pm2 monit

# View logs
pm2 logs canvango-backend

# View specific log
pm2 logs canvango-backend --lines 100

# Clear logs
pm2 flush
```

### 2. System Monitoring

Install monitoring tools:

```bash
# Install htop for system monitoring
sudo apt install -y htop

# Install netdata for comprehensive monitoring
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

Access Netdata dashboard at `http://your-server-ip:19999`

### 3. Log Rotation

Configure log rotation:

```bash
sudo nano /etc/logrotate.d/canvango
```

```conf
/var/log/canvango/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 canvango canvango
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}

/var/log/nginx/canvango-*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload nginx
    endscript
}
```

### 4. Error Tracking

Consider integrating error tracking services:

- **Sentry:** For application error tracking
- **LogRocket:** For session replay and debugging
- **New Relic:** For APM and performance monitoring

---

## Backup Strategy

### 1. Database Backups

Create backup script:

```bash
sudo nano /usr/local/bin/backup-canvango-db.sh
```

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/canvango/database"
DB_NAME="canvango_production"
DB_USER="canvango_prod"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/canvango_db_$TIMESTAMP.sql.gz"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
PGPASSWORD=$DB_PASSWORD pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_FILE

# Remove old backups
find $BACKUP_DIR -name "canvango_db_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Log backup
echo "$(date): Database backup completed - $BACKUP_FILE" >> /var/log/canvango/backup.log
```

Make executable:

```bash
sudo chmod +x /usr/local/bin/backup-canvango-db.sh
```

Schedule with cron:

```bash
sudo crontab -e
```

Add:

```cron
# Daily database backup at 2 AM
0 2 * * * /usr/local/bin/backup-canvango-db.sh

# Weekly full system backup at 3 AM on Sundays
0 3 * * 0 tar -czf /var/backups/canvango/system/canvango_$(date +\%Y\%m\%d).tar.gz /home/canvango/canvango-app
```

### 2. Application Backups

```bash
# Create backup directory
sudo mkdir -p /var/backups/canvango/application

# Backup application files
tar -czf /var/backups/canvango/application/canvango_app_$(date +%Y%m%d).tar.gz \
    /home/canvango/canvango-app \
    --exclude=node_modules \
    --exclude=dist
```

### 3. Restore from Backup

#### Restore Database

```bash
# Decompress and restore
gunzip < /var/backups/canvango/database/canvango_db_YYYYMMDD_HHMMSS.sql.gz | \
    psql -U canvango_prod -d canvango_production
```

#### Restore Application

```bash
# Stop application
pm2 stop canvango-backend

# Restore files
tar -xzf /var/backups/canvango/application/canvango_app_YYYYMMDD.tar.gz -C /

# Restart application
pm2 start canvango-backend
```

---

## Scaling Considerations

### Horizontal Scaling

#### 1. Load Balancer Setup

Use Nginx as load balancer:

```nginx
upstream canvango_backend_cluster {
    least_conn;
    server backend1.canvango.com:5000;
    server backend2.canvango.com:5000;
    server backend3.canvango.com:5000;
}
```

#### 2. Database Replication

Setup PostgreSQL master-slave replication for read scaling.

#### 3. Caching Layer

Implement Redis for:
- Session storage
- API response caching
- Rate limiting

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
```

### Vertical Scaling

Increase server resources:
- Add more CPU cores
- Increase RAM
- Upgrade to SSD storage
- Increase network bandwidth

### CDN Integration

Use CDN for static assets:
- Cloudflare
- AWS CloudFront
- Fastly

---

## Troubleshooting

### Backend Not Starting

```bash
# Check PM2 logs
pm2 logs canvango-backend --lines 100

# Check if port is in use
sudo lsof -i :5000

# Check environment variables
pm2 env 0

# Restart application
pm2 restart canvango-backend
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U canvango_prod -d canvango_production -h localhost

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### High Memory Usage

```bash
# Check memory usage
free -h
pm2 monit

# Restart application to clear memory
pm2 restart canvango-backend
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Test SSL configuration
openssl s_client -connect canvango.com:443
```

---

## Security Hardening

### 1. Firewall Configuration

```bash
# Install UFW
sudo apt install -y ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Check status
sudo ufw status
```

### 2. Fail2Ban

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Configure
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true
```

### 3. Regular Updates

```bash
# Setup automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## Post-Deployment Checklist

- [ ] Application is accessible via HTTPS
- [ ] SSL certificates are valid
- [ ] Database backups are running
- [ ] Monitoring is configured
- [ ] Logs are being collected
- [ ] Error tracking is working
- [ ] Performance is acceptable
- [ ] Security headers are set
- [ ] Firewall is configured
- [ ] PM2 is set to start on boot
- [ ] Default admin password changed
- [ ] Documentation is updated
- [ ] Team is notified

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor application logs
- Check error rates
- Review system resources

**Weekly:**
- Review backup logs
- Check disk space
- Update dependencies (if needed)

**Monthly:**
- Security audit
- Performance review
- Database optimization
- SSL certificate check

### Update Procedure

```bash
# 1. Backup current version
cd /home/canvango/canvango-app
tar -czf ../canvango_backup_$(date +%Y%m%d).tar.gz .

# 2. Pull latest changes
git pull origin main

# 3. Update backend
cd backend
npm ci
npm run build
pm2 restart canvango-backend

# 4. Update frontend
cd ../frontend
npm ci
npm run build

# 5. Verify deployment
pm2 status
curl https://api.canvango.com/health
```

---

## Support and Resources

- **Documentation:** https://docs.canvango.com
- **Support Email:** support@canvango.com
- **Emergency Contact:** +62-XXX-XXXX-XXXX

---

## Appendix

### Useful Commands

```bash
# PM2 Commands
pm2 list                    # List all processes
pm2 restart all             # Restart all processes
pm2 stop all                # Stop all processes
pm2 delete all              # Delete all processes
pm2 logs                    # View all logs
pm2 monit                   # Monitor processes

# Nginx Commands
sudo nginx -t               # Test configuration
sudo systemctl reload nginx # Reload configuration
sudo systemctl restart nginx # Restart Nginx

# PostgreSQL Commands
sudo systemctl status postgresql  # Check status
sudo -u postgres psql            # Access PostgreSQL
\l                                # List databases
\dt                               # List tables
\q                                # Quit

# System Commands
htop                        # System monitor
df -h                       # Disk usage
free -h                     # Memory usage
netstat -tulpn             # Network connections
```

---

**Last Updated:** 2024-01-15
**Version:** 1.0.0
