# 🚀 AI वृत्त वाहिनी — Setup Instructions

Complete step-by-step guide to run your automated Marathi AI News Broadcasting System.

---

## 📋 Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18 | Backend runtime |
| Python 3 | ≥ 3.9 | gTTS for Marathi TTS |
| FFmpeg | Latest | Video rendering + RTMP streaming |
| Docker | Latest | VPS deployment |

---

## 🔑 API Keys You Need

1. **News API** — [newsapi.org](https://newsapi.org) → Free tier: 100 req/day
2. **OpenAI API** — [platform.openai.com](https://platform.openai.com) → GPT-3.5 (cheap)
   - OR **Groq API** — [console.groq.com](https://console.groq.com) → Free tier
3. **YouTube Stream Key** — YouTube Studio → Go Live → Stream Setup

---

## 🖥️ Option A: Local Development

### Step 1 — Install Backend Dependencies

```bash
cd backend
npm install
pip3 install gtts
```

### Step 2 — Configure Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys
nano backend/.env
```

### Step 3 — Add Background Image

Place a 1920×1080 JPEG image at:
```
backend/assets/background.jpg
```

Tip: Download a free news background from Unsplash:
```bash
curl "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&h=1080&fit=crop" \
  -o backend/assets/background.jpg
```

### Step 4 — Verify FFmpeg

```bash
ffmpeg -version
# Must show version info. If not: sudo apt install ffmpeg
```

### Step 5 — Start Backend

```bash
cd backend
node server.js
# OR for development with auto-reload:
npx nodemon server.js
```

Backend runs at: `http://localhost:3001`
Health check: `http://localhost:3001/health`

### Step 6 — Open Frontend Dashboard

Open the OnSpace app in your browser, then in Settings:
- **Backend Server URL**: `http://localhost:3001`
- Add your API keys
- Add YouTube Stream Key
- Click **Save Settings**

### Step 7 — Start Streaming

Click **▶ Start Streaming** in the dashboard. Watch logs for progress.

---

## 🐳 Option B: VPS Deployment (Hetzner — Recommended)

### Step 1 — Provision Hetzner VPS

Recommended specs:
- **Type**: CPX21 (3 vCPU, 4 GB RAM) — ~€8/month
- **OS**: Ubuntu 22.04 LTS
- **Location**: Any

### Step 2 — Install Docker on VPS

```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker

# Install Docker Compose
apt install docker-compose-plugin -y
```

### Step 3 — Upload Project Files

```bash
# From your local machine
scp -r . root@YOUR_VPS_IP:/opt/ai-news-channel/
```

OR use Git:
```bash
git clone https://github.com/YOUR_REPO /opt/ai-news-channel
cd /opt/ai-news-channel
```

### Step 4 — Configure Environment on VPS

```bash
cd /opt/ai-news-channel
cp backend/.env.example .env

# Edit .env
nano .env
```

Fill in:
```env
PORT=3001
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
NEWS_API_KEY=your_key
YOUTUBE_STREAM_KEY=xxxx-xxxx-xxxx-xxxx
RTMP_URL=rtmp://a.rtmp.youtube.com/live2
FRONTEND_URL=*
```

### Step 5 — Start with Docker Compose

```bash
cd /opt/ai-news-channel
docker compose up -d --build

# View logs
docker compose logs -f backend
```

### Step 6 — Open Firewall Port

```bash
ufw allow 3001/tcp
ufw reload
```

### Step 7 — Configure Frontend

In dashboard Settings:
- **Backend Server URL**: `http://YOUR_VPS_IP:3001`
- Add API keys + YouTube Stream Key
- Save → Start Streaming

---

## 📺 YouTube Live Setup

1. Go to **YouTube Studio** → **Go Live**
2. Select **Stream** (not Webcam)
3. Copy your **Stream Key**
4. Note the **Stream URL**: `rtmp://a.rtmp.youtube.com/live2`
5. Paste both into dashboard Settings
6. In YouTube Studio, set stream to **Public** or **Unlisted**
7. Click **▶ Start Streaming** in dashboard

---

## 🔁 How Automation Works

Every N minutes (configurable, default 5):
```
① NewsAPI → Fetch India + World headlines
② OpenAI/Groq → Translate & script in Marathi
③ gTTS → Convert Marathi text → MP3 audio
④ FFmpeg → Compose video (bg + audio + headline overlay)
⑤ FFmpeg → RTMP stream to YouTube Live
```

- **Auto-reconnect**: If stream drops, reconnects in 5 seconds
- **Storage**: Keeps last 25 videos, auto-deletes older ones
- **24×7**: Loops current video until next one is ready

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| `ffmpeg: command not found` | `sudo apt install ffmpeg` |
| `TTS failed: python3 not found` | `sudo apt install python3 python3-pip && pip3 install gtts` |
| `Backend Offline` in dashboard | Check backend URL in Settings; ensure port 3001 is open |
| `NewsAPI returned 0 articles` | Check your News API key; free plan has limits |
| `OpenAI failed` | Check API key balance; Groq is free fallback |
| Stream key invalid | Re-copy from YouTube Studio; it refreshes sometimes |
| Video not rendering | Check backend logs; ensure background.jpg exists in `backend/assets/` |

---

## 📁 File Structure

```
ai-news-channel/
├── src/                    # React frontend (OnSpace)
├── backend/
│   ├── server.js           # Express API server
│   ├── routes/stream.js    # API endpoints
│   ├── services/
│   │   ├── newsService.js  # NewsAPI + AI script generation
│   │   ├── ttsService.js   # Marathi gTTS
│   │   ├── videoService.js # FFmpeg video rendering
│   │   ├── streamService.js# RTMP stream management
│   │   └── logService.js   # In-memory log store
│   ├── assets/background.jpg
│   ├── videos/             # Generated MP4s (auto-managed)
│   ├── tmp/                # Temp audio files
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── SETUP_INSTRUCTIONS.md
```
