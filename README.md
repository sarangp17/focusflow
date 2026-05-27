<div align="center">

# ⏱ FocusFlow
### AI-powered productivity tracking for Windows

**Track. Understand. Improve.**

![Version](https://img.shields.io/badge/version-1.0.0-6366f1?style=flat-square)
![Platform](https://img.shields.io/badge/platform-Windows-0078d4?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)
![Cost](https://img.shields.io/badge/cost-free-f59e0b?style=flat-square)
![Cloud](https://img.shields.io/badge/cloud-none-ef4444?style=flat-square)

</div>

---

# What is FocusFlow?

FocusFlow is a free, offline-first desktop application that intelligently tracks your screen activity and classifies every minute of your day as:

- ✅ Productive
- ❌ Non-productive
- 🎮 Gaming
- ⚪ Neutral

Unlike traditional screen time tools that only track which application was open, FocusFlow understands *what you were actually doing*.

It can distinguish between:
- watching a Python tutorial on YouTube
- watching entertainment videos
- coding in VS Code
- browsing social media
- attending online classes

All classification happens **locally on your machine** using rule-based logic and a locally running AI model.

No cloud. No subscriptions. No telemetry. No API keys.

---

# Why FocusFlow Exists

Most productivity trackers only tell you:

> “Chrome was open for 5 hours.”

That information is incomplete.

Chrome could mean:
- studying
- coding
- watching lectures
- scrolling Instagram
- watching Netflix

FocusFlow solves this problem by combining:
- real-time app monitoring
- browser tab tracking
- intelligent rule-based classification
- local AI-powered YouTube analysis

The result is a productivity tracker that understands *context*, not just application names.

---

# Key Highlights

- Offline-first architecture
- AI-powered activity classification
- Local LLM integration using Ollama
- Electron + React desktop dashboard
- Python monitoring backend
- Browser extension with real-time tab tracking
- SQLite analytics pipeline
- Automatic database cleanup and compression
- Privacy-focused design
- Zero cloud dependency

---

# Features

## Real-Time Monitoring
Tracks every application switch and browser tab change live.

## Smart Classification
Classifies 40+ apps and websites instantly as:
- productive
- non-productive
- gaming
- neutral

## AI-Powered YouTube Intelligence
Uses a local LLM to determine whether a YouTube video is:
- educational
- tutorial-based
- entertainment
- gaming
- sports
- music

## Browser Tab Tracking
Tracks the exact active website instead of only detecting the browser.

## Idle Detection
Automatically pauses tracking when keyboard and mouse are inactive.

## Beautiful Analytics Dashboard
Includes:
- live productivity score
- donut chart
- weekly productivity trends
- top apps
- top websites
- gaming time breakdown

## Monthly Database Cleanup
Compresses old data into weekly summaries to keep storage under 3MB.

## Startup Permission Prompt
Requests user consent before tracking begins after Windows startup.

## Fully Offline
No internet required after initial setup.

## Completely Private
Your productivity data never leaves your laptop.

/apps.png)

---

# Example Classification

| Activity | Classification |
|---|---|
| YouTube — “Python Flask Tutorial” | ✅ Productive |
| YouTube — “Football Highlights” | ❌ Non-productive |
| VS Code + GitHub | ✅ Productive |
| Netflix | ❌ Non-productive |
| Steam | 🎮 Gaming |
| Spotify | ⚪ Neutral |

---

# Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                        YOUR LAPTOP                          │
│                                                             │
│  ┌──────────────┐     ┌──────────────────────────────────┐  │
│  │   Chrome /   │────▶│     Chrome Extension (MV3)       │  │
│  │   Brave      │     │  Sends active tab URL via WS     │  │
│  └──────────────┘     └────────────────┬─────────────────┘  │
│                                        │ WebSocket :8765     │
│  ┌──────────────┐                      ▼                    │
│  │  Active App  │────▶ ┌──────────────────────────────────┐ │
│  │  (pygetwin)  │      │       Python Backend              │ │
│  └──────────────┘      │                                  │ │
│                        │  monitor.py  →  classifier.py    │ │
│  ┌──────────────┐      │       │              │           │ │
│  │   pynput     │      │  Rule-based    Ollama AI         │ │
│  │ Idle detect  │      │  (instant)   (YouTube only)      │ │
│  └──────────────┘      │       │              │           │ │
│                        │       ▼              ▼           │ │
│                        │         SQLite DB                │ │
│                        │    (sessions, cache, summary)    │ │
│                        │              │                   │ │
│                        │         Flask API :5000          │ │
│                        └──────────────┬───────────────────┘ │
│                                       │                     │
│                        ┌─────────────▼───────────────────┐  │
│                        │     Electron + React Dashboard   │ │
│                        │   Charts · Score · Live Status   │ │
│                        └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

# How It Works

## Step-by-Step Workflow

1. Python monitor polls the active window every 2 seconds
2. Chrome extension sends active tab URL through WebSocket
3. Classifier checks app/domain against predefined rules
4. If YouTube is detected:
   - video title is scraped
   - title is analyzed using Ollama
   - result is cached permanently
5. Session is written to SQLite
6. Flask API serves analytics data
7. Electron dashboard refreshes every 30 seconds

---

# What Gets Classified

## ✅ Productive

### Office Tools
- Microsoft Word
- Excel
- PowerPoint
- Google Docs
- Google Sheets

### Code Editors
- VS Code
- IntelliJ IDEA
- PyCharm
- Android Studio
- Sublime Text

### Coding Platforms
- GitHub
- GitLab
- LeetCode
- HackerRank
- Codeforces
- Replit

### Study Platforms
- Coursera
- Udemy
- Khan Academy
- NPTEL
- Google Classroom

### Design Tools
- Figma
- Photoshop
- Blender
- DaVinci Resolve

### Communication
- Slack
- Zoom
- Microsoft Teams
- Google Meet

### Reference Sites
- Stack Overflow
- MDN
- Google Scholar

### YouTube
Educational/tutorial content detected using AI.

---

## ❌ Non-Productive

### Social Media
- Instagram
- Twitter/X
- Facebook
- Snapchat
- TikTok
- Reddit

### Entertainment Platforms
- Netflix
- Prime Video
- Disney+ Hotstar
- SonyLIV
- Zee5

### Shopping
- Amazon
- Flipkart

### YouTube
Entertainment/sports/music content detected using AI.

---

## 🎮 Gaming

Tracked separately from productive and non-productive activity.

Examples:
- Steam
- Epic Games
- Xbox App
- Game windows

---

## ⚪ Neutral

User configurable.

Examples:
- Spotify
- VLC
- WhatsApp
- Telegram
- Calculator

---

# Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Desktop shell | Electron | Native Windows app |
| Frontend | React 18 + Vite | Dashboard UI |
| Charts | Recharts | Analytics visualization |
| Backend | Python 3.11 | Monitoring + API |
| Window tracking | pygetwindow, pywin32 | Active window detection |
| Idle detection | pynput | Keyboard/mouse activity |
| Browser extension | Chrome Extension MV3 | Active tab tracking |
| Real-time communication | websockets | Extension → Python |
| AI classification | Ollama + llama3.2 | Local AI analysis |
| Web scraping | requests + BeautifulSoup4 | YouTube title extraction |
| Database | SQLite | Local storage |
| REST API | Flask + flask-cors | Dashboard API |
| Scheduler | schedule | Cleanup jobs |
| Startup management | winreg + tkinter | Windows startup prompt |
| Version control | Git + GitHub | Source management |

---

# Engineering Challenges Solved

- Real-time synchronization between Electron, Python, and browser extension
- Local AI classification without cloud APIs
- Browser tab tracking using WebSockets
- Efficient caching for AI-generated classifications
- Idle detection with low CPU usage
- Automatic long-term database compression
- Maintaining privacy without sacrificing functionality
- Permission-based startup workflow for Windows

---

# Performance

Typical system usage during normal operation:

| Resource | Usage |
|---|---|
| RAM | ~120–180 MB |
| CPU | <2% idle |
| Database growth | <3 MB/month |
| Polling interval | 2 seconds |

---

# Database Schema

```text
sessions
→ raw session data

yt_cache
→ cached YouTube AI classifications

weekly_summary
→ compressed historical analytics

app_rules
→ productivity classification rules

tab_history
→ browser tab visit history
```

Raw sessions are stored for 30 days before being compressed into weekly summaries.

---

# Project Structure

```text
focusflow/
├── backend/
│   ├── main.py
│   ├── monitor.py
│   ├── classifier.py
│   ├── db.py
│   ├── cleanup.py
│   ├── api.py
│   ├── startup.py
│   ├── startup_prompt.py
│   └── requirements.txt
│
├── extension/
│   ├── manifest.json
│   ├── background.js
│   └── icon.png
│
├── frontend/
│   ├── main.js
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── renderer/
│       ├── main.jsx
│       ├── App.jsx
│       └── components/
│           ├── Today.jsx
│           ├── Weekly.jsx
│           └── Apps.jsx
│
└── README.md
```

---

# Installation

## Prerequisites

- Python 3.11+
- Node.js 20 LTS
- Ollama
- Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/sarangp17/focusflow.git
cd focusflow
```

---

## 2. Set Up Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt
```

---

## 3. Download the AI Model

```bash
ollama pull llama3.2
```

> Required only once (~2GB).

---

## 4. Initialize Database

```bash
python db.py
```

---

## 5. Register Startup Prompt (Optional)

```bash
python startup.py
```

This makes FocusFlow ask for permission every time Windows starts.

---

## 6. Set Up Frontend

```bash
cd ../frontend

npm install
```

---

## 7. Load Chrome Extension

1. Open:
   - `chrome://extensions`
   - OR `brave://extensions`

2. Enable:
   - Developer Mode

3. Click:
   - Load unpacked

4. Select:
   - `focusflow/extension/`

---

# Running FocusFlow

You currently need 3 terminals.

## Terminal 1 — Monitor

```bash
cd backend

venv\Scripts\activate

python monitor.py
```

---

## Terminal 2 — API

```bash
cd backend

venv\Scripts\activate

python api.py
```

---

## Terminal 3 — Dashboard

```bash
cd frontend

npm start
```

---

Make sure Ollama is running before starting the monitor.

> Future versions will package all components into a single `.exe` installer.

---

# API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/status` | GET | Current activity |
| `/stats/today` | GET | Today's analytics |
| `/stats/weekly` | GET | Weekly productivity data |
| `/stats/apps` | GET | Per-app statistics |
| `/stats/tabs` | GET | Browser history analytics |

---

# Privacy & Security

FocusFlow is designed with privacy first.

## What FocusFlow Tracks
- active application name
- active browser tab title
- active website URL
- session duration

## What FocusFlow Does NOT Track
- screenshots
- keystrokes
- clipboard data
- microphone/audio
- webcam activity
- personal files

No data is uploaded anywhere.

Everything stays on your device.

---

# Project Statistics

| Metric | Value |
|---|---|
| Total files | 23 |
| Lines of code | ~7,100 |
| Python files | 7 |
| React components | 5 |
| API endpoints | 5 |
| Database tables | 5 |
| Productivity rules | 40+ |
| Cloud dependency | None |
| Monthly cost | ₹0 |

---

# Built With

## Python Libraries
- pygetwindow
- pywin32
- pynput
- websockets
- flask
- flask-cors
- requests
- beautifulsoup4
- schedule
- sqlite3
- tkinter
- asyncio

## JavaScript Packages
- electron
- react
- react-dom
- recharts
- vite
- electron-builder
- concurrently
- wait-on

---

# Future Improvements

- [ ] Settings UI for custom rules
- [ ] Daily productivity goals
- [ ] Weekly notifications
- [ ] Export reports as CSV/PDF
- [ ] Single `.exe` installer
- [ ] Dark/light mode
- [ ] Pomodoro timer
- [ ] Multi-monitor support

---

# Author

## Sarang

GitHub: [@sarangp17](https://github.com/sarangp17)

Built from scratch as a personal productivity system and computer science project.

---

<div align="center">

Private. Offline. Free forever.

Made with ❤️ using Python, React, Electron, and local AI.

</div>
