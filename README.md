# 🛡️ SafePulse — AI Personal Safety Assistant

> Built for the **SafetyNet Hackathon** 🚀

**SafePulse** is an AI-powered personal safety co-pilot designed to protect users during vulnerable or high-risk situations (such as solo travel at night, unfamiliar routes, or suspicious encounters).

---

## 🌟 Key Features

1. **Natural Language Situation Analysis**:
   - Users describe their situation in plain words (e.g., *"I am travelling alone in an unfamiliar city at 10:30 PM."*).
2. **Instant Structured AI Risk Assessment**:
   - **Risk Level**: `LOW`, `MODERATE`, or `HIGH` with a visual severity score (0–100).
   - **Identified Risk Factors**: Environmental vulnerabilities, isolation levels, and lighting cues.
   - **Immediate Safety Actions**: Actionable steps to execute within 60 seconds (non-confrontational, heading to safe spaces).
   - **Personalized Safety Plan**: Step-by-step strategic recommendations.
3. **🚨 Emergency "I FEEL UNSAFE" / Safety Mode HUD**:
   - **Live GPS Coordinates**: Real-time latitude, longitude, accuracy radius (±m), with 1-click links to Google Maps & OpenStreetMap.
   - **Safety Check-in Countdown**: 30-second / 1-minute safety timer with loud web-audio alarm beacon.
   - **Emergency Dispatch Call**: 1-tap direct dial (`tel:112` / `tel:911`).
   - **One-Tap Location Sharing**: Native Web Share API or 1-click copy of formatted SOS text with live GPS links for SMS / WhatsApp.
4. **Mandatory Safety Disclaimer**:
   - Prominently states that AI guidance is informational and never replaces official emergency responders.

---

## 🏗️ Architecture

```
Frontend (React + Vite)
       │
       ▼  HTTP POST /api/analyze
Backend (Node.js + Express API)
       │
       ▼  Structured Prompt with Schema
Gemini API (gemini-3.6-flash via @google/genai)
       │
       ▼  Validated JSON Output
Backend Response
       │
       ▼
Frontend UI (Dynamic Risk Card & Safety HUD)
```

---

## 📦 Dependencies

### Backend Dependencies
- `express` — Fast HTTP web framework
- `cors` — Cross-Origin Resource Sharing middleware
- `dotenv` — Environment variable loader
- `@google/genai` — Official Google Gemini API SDK

### Frontend Dependencies
- `react` & `react-dom` — React 18 UI library
- `vite` & `@vitejs/plugin-react` — Fast next-generation frontend bundler
- `lucide-react` — Crisp, modern vector safety icons

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# backend/.env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note:** If `GEMINI_API_KEY` is omitted or unset, SafePulse automatically engages its intelligent heuristic fallback analyzer so the app remains 100% functional during local testing and demos!

---

## 🚀 Getting Started

### 1. Run the Backend

```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)*

### 2. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173` with proxy to backend.*

---

## 🔒 Safety & Security Principles

- **No client-side API keys**: All AI requests are securely proxied through Express.
- **Defensive & Non-confrontational**: The AI prompt strictly forbids advocating violence, prioritizing moving to populated public facilities and calling emergency dispatch.
- **No false claims**: The app does not claim automated police dispatch when relying on user-triggered calling/sharing.
