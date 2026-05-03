# FocusFlow 🎯
### Track. Understand. Improve.
> An intelligent screen time tracker powered by local AI

FocusFlow is a free, offline-first desktop application that tracks and classifies your screen time as productive or non-productive using AI — all running locally on your machine.

---

## Features
- Real-time active window and browser tab tracking
- AI-powered YouTube classification (lecture vs entertainment)
- Tracks apps, OTT platforms, games, coding tools, study platforms
- Beautiful dashboard with charts and weekly trends
- Permission-based startup — nothing runs without your consent
- 100% free, 100% offline — no API keys, no cloud, no cost

---

## Tech Stack
| Layer | Technology |
|---|---|
| Background monitor | Python, pygetwindow, pynput |
| Browser tracking | Chrome Extension (Manifest V3) |
| AI classification | Ollama + llama3.2 (local) |
| Database | SQLite |
| Backend API | Flask |
| Desktop shell | Electron |
| Frontend UI | React + Recharts |

---

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 20 LTS
- Ollama — download from ollama.com

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/focusflow.git
cd focusflow
```

### 2. Set up Python backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Pull the AI model
```bash
ollama pull llama3.2
```

### 4. Set up frontend
```bash
cd frontend
npm install
```

### 5. Run FocusFlow
Open 2 terminals:

**Terminal 1 — Monitor:**
```bash
cd backend
venv\Scripts\activate
python monitor.py
```

**Terminal 2 — API:**
```bash
cd backend
venv\Scripts\activate
python api.py
```

**Terminal 3 — Desktop app:**
```bash
cd frontend
npm start
```

### 6. Load Chrome Extension
- Go to `brave://extensions` or `chrome://extensions`
- Enable Developer mode
- Click Load unpacked → select the `extension/` folder

---

## How it works
1. Python monitor tracks your active window every 2 seconds
2. Chrome extension sends browser tab URLs via WebSocket
3. Classifier checks app rules → if YouTube, scrapes title → Ollama AI classifies
4. All data stored in local SQLite database
5. Flask API serves data to Electron + React dashboard
6. Monthly cleanup compresses data into weekly averages

---

## Privacy
Everything runs on your machine. No data ever leaves your laptop.

---

Built by SARANG P.