# Divine Audio - Deployment Guide

This guide provides detailed instructions for deploying the Divine Audio application in various environments.

## 📦 Deployment Package Contents

```
divine-audio-YYYYMMDD_HHMMSS.tar.gz
├── src/                    # Source code
├── prisma/                 # Database schema
├── public/                 # Static assets
├── package.json            # Dependencies
├── bun.lock                # Lock file (use npm if bun unavailable)
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS config
├── postcss.config.mjs      # PostCSS config
├── tsconfig.json           # TypeScript config
├── components.json         # shadcn/ui config
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Docker Compose setup
├── .env.example            # Environment template
├── deploy.sh               # Linux/macOS deployment script
├── start.sh                # Quick start (Linux/macOS)
├── start.bat               # Quick start (Windows)
├── README.md               # Documentation
└── .dockerignore           # Docker ignore rules
```

---

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended)

**Best for:** Production servers, easy management, containerized deployment

#### Prerequisites:
- Docker Engine 20.10+
- Docker Compose v2.0+

#### Steps:

```bash
# 1. Extract the package
tar -xzf divine-audio-*.tar.gz
cd divine-audio-*

# 2. Configure environment
cp .env.example .env
nano .env  # Edit with your settings

# 3. (Optional) Prepare local audio directory
mkdir -p ./audio
# Copy your audio files to ./audio/

# 4. Start the application
docker-compose up -d

# 5. Access the application
open http://localhost:3000
```

#### Customizing Audio Path:

Edit `docker-compose.yml`:
```yaml
volumes:
  local-audio:
    driver_opts:
      device: /your/actual/audio/path  # Change this
```

---

### Option 2: Manual Node.js Deployment

**Best for:** Custom server setups, VPS, cloud VMs

#### Prerequisites:
- Node.js 18+ or 20+
- npm or bun package manager
- Git (for cloning)

#### Steps:

```bash
# 1. Extract or clone the project
tar -xzf divine-audio-*.tar.gz
cd divine-audio-*

# 2. Install dependencies
npm install
# OR if you have bun installed:
bun install

# 3. Setup database
npx prisma db push
# OR:
bun run db:push

# 4. Build for production
npm run build
# OR:
bun run build

# 5. Start the application
NODE_ENV=production node .next/standalone/server.js
```

#### Using PM2 for Process Management:

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start .next/standalone/server.js --name "divine-audio" --node-args="--max-old-space-size=512"

# Setup startup on boot
pm2 startup
pm2 save
```

#### Using Systemd Service:

Create `/etc/systemd/system/divine-audio.service`:

```ini
[Unit]
Description=Divine Audio Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/divine-audio
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=DATABASE_URL=file:./data/custom.db
ExecStart=/usr/bin/node .next/standalone/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable divine-audio
sudo systemctl start divine-audio
```

---

### Option 3: Quick Start Scripts

#### Linux/macOS:

```bash
chmod +x start.sh
./start.sh
```

#### Windows:

```cmd
start.bat
```

---

### Option 4: Deploy Script (Advanced)

```bash
chmod +x deploy.sh

# Show all available commands
./deploy.sh help

# Full automated setup
./deploy.sh all

# Individual steps
./deploy.sh check       # Verify prerequisites
./deploy.sh install     # Install dependencies
./deploy.sh db          # Initialize database
./deploy.sh build       # Build application
./deploy.sh docker      # Build Docker image
./deploy.sh compose     # Start with Docker Compose
./deploy.sh package     # Create deployment archive
```

---

## ☁️ Cloud Platform Deployment

### Vercel (Easiest)

1. Push code to GitHub/GitLab
2. Import project at [vercel.com](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

**Note:** For file streaming, use external storage instead of local files.

### AWS EC2

```bash
# Launch Ubuntu 22.04 instance
ssh ec2-user@your-instance-ip

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Clone and deploy
git clone <your-repo-url>
cd divine-audio
cp .env.example .env
docker-compose up -d
```

### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT-ID/divine-audio

# Deploy to Cloud Run
gcloud run deploy --image gcr.io/PROJECT-ID/divine-audio \
  --platform managed \
  --port 3000
```

### DigitalOcean App Platform

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set run command: `node .next/standalone/server.js`
4. Add environment variables
5. Deploy

---

## 🔧 Configuration Guide

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `file:./db/custom.db` | SQLite database path |
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `3000` | Server port |
| `GOOGLE_API_KEY` | No | - | Google Drive API key |
| `GOOGLE_DRIVE_FOLDER_ID` | No | - | Drive folder ID |
| `LOCAL_AUDIO_PATH` | No | `./audio` | Local audio directory |

### Adding Audio Sources

After deployment:

1. Open **Admin Panel** (⚙️ button)
2. Click **Add New Source**
3. Choose type and configure:
   - **Local**: Path like `/app/audio/bhajans`
   - **Google Drive**: Folder ID from URL
   - **FTP**: Server credentials
4. Click **Scan** to index files

### File Structure Examples

**Bhagavad Gita (3-level):**
```
audio/
└── bhagavad-gita/
    └── chapter-01/
        ├── verse-01.mp3
        ├── verse-02.mp3
        └── ...
```

**Morning Bhajans (2-level):**
```
audio/
└── morning-bhajans/
    ├── om-jai-jagdish.mp3
    ├── hare-rama-hare-krishna.mp3
    └── ...
```

**Paath Collection (mixed):**
```
audio/
├── japji-sahib.mp3        (1-level: Paath → Audio)
├── sukhmani-sahib/
│   ├── ashtpadi-01.mp3    (2-level: Sukhmani → Ashtpadi)
│   └── ...
└── guru-granth-sahib/
    └── ang-001/           (3-level: Book → Ang → Audio)
        └── mul-mantra.mp3
```

---

## 🛡️ Security Recommendations

1. **Change default ports** in production
2. **Use HTTPS** with reverse proxy (nginx/caddy)
3. **Set strong credentials** for FTP sources
4. **Restrict API access** with firewall rules
5. **Regular backups** of SQLite database
6. **Monitor logs** for suspicious activity

### Nginx Reverse Proxy Config:

```nginx
server {
    listen 443 ssl;
    server_name audio.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 Monitoring & Maintenance

### Health Check:

```bash
curl http://localhost:3000/api/sources
```

### View Logs:

```bash
# Docker
docker-compose logs -f divine-audio

# PM2
pm2 logs divine-audio

# Systemd
journalctl -u divine-audio -f
```

### Database Backup:

```bash
# Backup
cp data/custom.db backup/custom-db-$(date +%Y%m%d).db

# Restore
cp backup/custom-db-YYYYMMDD.db data/custom.db
```

### Update Application:

```bash
# Pull latest code
git pull origin main

# Rebuild
npm run build
# OR
docker-compose up -d --build

# Restart service
pm2 restart divine-audio
# OR
sudo systemctl restart divine-audio
```

---

## ❓ Troubleshooting

### Port already in use:
```bash
# Find process using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
# Or change port in .env
```

### Database errors:
```bash
# Reset database
rm -f db/custom.db
bun run db:push
```

### Permission denied (Linux):
```bash
# Fix permissions
chmod -R 755 .
chown -R www-data:www-data .
```

### Docker build fails:
```bash
# Clear Docker cache
docker system prune -af
# Rebuild
docker-compose up -d --build
```

---

## 📞 Support

For issues and feature requests:
- Create an issue on GitHub repository
- Check documentation at `/docs` folder
- Review logs for error details

---

**🕉️ Om Shanti - May Peace Be With You 🕉️**
