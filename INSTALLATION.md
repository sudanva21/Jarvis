# JARVIS Installation Guide

Complete step-by-step guide to set up your JARVIS AI assistant.

## Prerequisites

Before you begin, ensure you have the following installed:

### 1. Node.js and npm
- Download from: https://nodejs.org/
- Recommended version: Node.js 18.x or higher
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

### 2. Python
- Download from: https://www.python.org/downloads/
- Recommended version: Python 3.10 or higher
- **IMPORTANT**: During installation, check "Add Python to PATH"
- Verify installation:
  ```bash
  python --version
  pip --version
  ```

### 3. Microphone
- Ensure your computer has a working microphone for voice commands
- Grant microphone permissions to your browser

## Installation Steps

### Step 1: Install Frontend Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install all React, Three.js, and other frontend dependencies.

### Step 2: Install Backend Dependencies

Navigate to the backend directory and install Python packages:

```bash
cd backend
pip install -r requirements.txt
```

**Note for Windows Users:**
- If you encounter issues with `pyaudio`, download the appropriate wheel file from:
  https://www.lfd.uci.edu/~gohlke/pythonlibs/#pyaudio
- Install it using: `pip install path/to/PyAudio‑0.2.11‑cp310‑cp310‑win_amd64.whl`

### Step 3: Configure Environment (Optional)

If you want to use advanced AI features:

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` and add your API keys if needed

### Step 4: Verify Installation

Check that all dependencies are installed correctly:

```bash
# Check frontend
npm list

# Check backend
cd backend
pip list
```

## Running JARVIS

### Option 1: Using the Startup Script (Recommended for Windows)

Simply double-click `start.bat` or run:

```bash
start.bat
```

This will automatically start both the backend and frontend servers.

### Option 2: Manual Start

**Terminal 1 - Backend Server:**
```bash
cd backend
python app.py
```

**Terminal 2 - Frontend Server:**
```bash
npm run dev
```

### Accessing JARVIS

Once both servers are running:

1. **Frontend Interface**: Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

2. **Backend API**: The backend runs on:
   ```
   http://localhost:5000
   ```

## First Time Setup

1. **Grant Microphone Permissions**: When you first open JARVIS, your browser will ask for microphone permissions. Click "Allow".

2. **Test Voice Recognition**: Click the microphone button and say "Hello JARVIS" to test voice recognition.

3. **Explore Features**:
   - Try voice commands
   - Switch to chat mode
   - Create tasks and reminders
   - Check system status

## Troubleshooting

### Issue: "Module not found" errors

**Solution**: Reinstall dependencies
```bash
npm install
cd backend
pip install -r requirements.txt
```

### Issue: Port already in use

**Solution**: Kill the process using the port
```bash
# For port 3000 (Frontend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# For port 5000 (Backend)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: Microphone not working

**Solution**:
1. Check browser permissions (Settings > Privacy > Microphone)
2. Ensure microphone is set as default device in Windows
3. Try a different browser (Chrome recommended)

### Issue: PyAudio installation fails

**Solution**:
1. Download pre-built wheel from: https://www.lfd.uci.edu/~gohlke/pythonlibs/#pyaudio
2. Install using: `pip install PyAudio‑0.2.11‑cp310‑cp310‑win_amd64.whl`
3. Or skip PyAudio (voice features will use browser's built-in recognition)

### Issue: Voice synthesis not working

**Solution**:
1. Check that pyttsx3 is installed: `pip show pyttsx3`
2. Ensure Windows Speech API is available
3. Try reinstalling: `pip uninstall pyttsx3 && pip install pyttsx3`

### Issue: 3D Arc Reactor not rendering

**Solution**:
1. Ensure WebGL is enabled in your browser
2. Update graphics drivers
3. Try a different browser (Chrome or Edge recommended)

## System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Linux
- **RAM**: 4GB
- **Storage**: 500MB free space
- **Browser**: Chrome 90+, Firefox 88+, or Edge 90+
- **Internet**: Required for initial setup and some features

### Recommended Requirements
- **OS**: Windows 11 or macOS 12+
- **RAM**: 8GB or more
- **Storage**: 1GB free space
- **Browser**: Latest Chrome or Edge
- **Internet**: Broadband connection

## Voice Commands Examples

Once JARVIS is running, try these commands:

- "Hello JARVIS"
- "What time is it?"
- "What's the date today?"
- "Remind me to call John at 3 PM"
- "Schedule a meeting tomorrow at 10 AM"
- "Tell me a joke"
- "How are you?"
- "Thank you JARVIS"

## Features Overview

### 🎤 Voice Interface
- Real-time speech recognition
- Natural language processing
- Voice synthesis responses
- Continuous listening mode

### 💬 Chat Interface
- Text-based interaction
- Message history
- Real-time responses

### 📅 Task Manager
- Create tasks and reminders
- Schedule events
- Set time-based notifications
- Mark tasks as complete

### 🎨 3D Arc Reactor
- Animated 3D visualization
- Responds to voice activity
- Iron Man themed design
- WebGL powered graphics

### 📊 System Monitoring
- CPU usage tracking
- Memory monitoring
- Real-time status updates

## Development

### Building for Production

```bash
# Build frontend
npm run build

# The built files will be in the 'dist' directory
```

### Running Tests

```bash
# Frontend tests (if configured)
npm test

# Backend tests (if configured)
cd backend
python -m pytest
```

## Support

For issues, questions, or contributions:
- Check the README.md for general information
- Review this installation guide
- Check the troubleshooting section above

## Next Steps

After successful installation:
1. Explore all voice commands
2. Create your first task
3. Customize the AI responses in `backend/ai_model.py`
4. Adjust the UI theme in `tailwind.config.js`
5. Add your own features!

---

**"Sometimes you gotta run before you can walk."** - Tony Stark

Enjoy your JARVIS AI Assistant! 🚀
