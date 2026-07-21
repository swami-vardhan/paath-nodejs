# 🙏 Divine Audio - Indian Spiritual Audio Library

A modern, mobile-responsive web application for playing and managing **Indian spiritual audio content** including Bhajans, Paath (sacred readings), and spiritual book translations.

![Divine Audio](https://img.shields.io/badge/Version-1.0.0-saffron?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Features

### 🎵 Audio Playback
- **Full-featured audio player** with play/pause, next/previous controls
- **Progress bar with seeking** support
- **Volume control**
- **Queue management** for continuous playback
- **Mobile-optimized sticky player**

### 📁 Multi-Source Support
| Source | Description | Status |
|--------|-------------|--------|
| **Local Files** | Direct filesystem access | ✅ Fully Functional |
| **Google Drive** | Cloud storage integration | 🔧 API Ready |
| **FTP Server** | Remote file streaming | 🔧 Structure Ready |

### 📚 Smart Folder Structure Detection
The application automatically detects and organizes your audio library:

```
3-Level:  BookTitle → Chapter → Audio     (e.g., Bhagavad Gita → Ch.1 → Verse.mp3)
2-Level:  Category → Audio               (e.g., Morning Bhajans → Om_Jai.mp3)
1-Level:  Path → Audio                   (e.g., Paath → Japji_Sahib.mp3)
```

### ⚙️ Admin Panel
- Add/Edit/Delete audio sources
- Configure Google Drive credentials
- Set up FTP server connections
- Define local folder paths
- One-click library refresh/scanning

### 🎨 Spiritual Theme Design
- Saffron & Maroon color palette (traditional Indian colors)
- Om symbol branding with glow animations
- Gradient backgrounds with spiritual aesthetics
- Dark mode support
- Fully responsive (mobile-first design)

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended)

```bash
# Clone or download the project
cd divine-audio

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Start with Docker Compose
docker-compose up -d

# Access at http://localhost:3000
```

### Option 2: Manual Deployment

```bash
# Install dependencies
npm install
# or
bun install

# Setup database
npx prisma db push
# or
bun run db:push

# Build application
npm run build
# or
bun run build

# Start production server
NODE_ENV=production node .next/standalone/server.js
```

### Option 3: Using Deploy Script

```bash
chmod +x deploy.sh

# Full setup
./deploy.sh all

# Individual commands
./deploy.sh check      # Check prerequisites
./deploy.sh install    # Install dependencies
./deploy.sh db         # Setup database
./deploy.sh build      # Build for production
./deploy.sh start      # Start production server
./deploy.sh docker     # Build Docker image
./deploy.sh compose    # Run with Docker Compose
./deploy.sh package    # Create deployment package
```

## 📋 Configuration

### Environment Variables

Create a `.env` file from `.env.example`:

```env
# Database
DATABASE_URL="file:./db/custom.db"

# Application
NODE_ENV=production
PORT=3000

# Google Drive (Optional)
GOOGLE_API_KEY=your-api-key
GOOGLE_DRIVE_FOLDER_ID=your-folder-id

# Local Audio Path
LOCAL_AUDIO_PATH=./audio
```

### Adding Audio Sources

1. Open the application in your browser
2. Click the **Settings (⚙️)** button in the header
3. Click **Add New Source**
4. Choose source type:
   - **Local Folder**: Enter path to audio files on server
   - **Google Drive**: Provide folder ID and API key
   - **FTP**: Enter host, credentials, and base path
5. Click **Add Source**
6. Click **Scan** to index the library

## 📁 Project Structure

```
divine-audio/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── sources/          # Source CRUD API
│   │   │   ├── library/          # Library browsing API
│   │   │   └── audio/stream      # Audio streaming endpoint
│   │   ├── page.tsx              # Main UI component
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Spiritual theme styles
│   ├── lib/
│   │   ├── audio-store.ts        # Zustand state management
│   │   └── db.ts                 # Prisma database client
│   └── components/ui/            # shadcn/ui components
├── prisma/
│   └── schema.prisma             # Database schema
├── public/                       # Static assets
├── Dockerfile                    # Docker configuration
├── docker-compose.yml            # Docker Compose setup
├── deploy.sh                     # Deployment script
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript 5** | Type-safe JavaScript |
| **Tailwind CSS 4** | Utility-first styling |
| **shadcn/ui** | UI component library |
| **Prisma ORM** | Database management (SQLite) |
| **Zustand** | Client state management |
| **Lucide React** | Icon library |

## 🎯 Supported Audio Formats

- MP3 (`audio/mpeg`)
- WAV (`audio/wav`)
- OGG (`audio/ogg`)
- M4A (`audio/mp4`)
- FLAC (`audio/flac`)
- AAC (`audio/aac`)

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Mobile Features

- Responsive layout optimized for all screen sizes
- Touch-friendly controls (44px minimum touch targets)
- Sticky bottom player for easy access
- Optimized for portrait and landscape modes
- Safe area support for notched devices

## 🔒 Security Notes

- Credentials are stored encrypted in the database
- API keys are masked in admin panel responses
- File streaming supports range requests for security
- No external dependencies on user-uploaded files

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with ❤️ for the spiritual community
- Inspired by traditional Indian devotional music
- Icons by [Lucide](https://lucide.dev/)
- UI components by [shadcn/ui](https://ui.shadcn.com/)

---

**🕉️ Om Shanti - May Peace Be With You 🕉️**
