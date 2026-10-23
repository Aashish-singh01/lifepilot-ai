# LifePilot AI — Intelligent Daily Planning & Focus Platform

> A calm, elegant, and privacy-respecting daily planning and productivity SaaS platform designed for students, developers, and busy professionals.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Live_Demo-GitHub_Pages-245C45?logo=github)](https://aashish-singh01.github.io/lifepilot-ai/)
[![Live Demo (Vercel)](https://img.shields.io/badge/Live_Demo-Vercel-black?logo=vercel)](https://lifepilot-ai-flame.vercel.app)
[![Deploy to GitHub Pages](https://github.com/Aashish-singh01/lifepilot-ai/actions/workflows/deploy.yml/badge.svg)](https://github.com/Aashish-singh01/lifepilot-ai/actions/workflows/deploy.yml)
[![Built with React](https://img.shields.io/badge/React-19.3-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com)

---

## 1. Product Vision & Design Philosophy

Most modern AI apps present themselves as centered chatbots, floating neon orbs, or generic landing pages with non-functional buttons. **LifePilot AI** rejects that paradigm completely.

Inspired by tools like **Linear**, **Notion**, **Todoist**, and **Sunsama**, LifePilot AI is crafted as an authentic, high-caliber productivity application:
- **Calm, High-Contrast Visual System**: Warm off-white background (`#F8F9F7`), white elevated cards, charcoal typography (`#202521`), and deep forest green primary accents (`#245C45`).
- **Real-Time Data-Driven Metrics**: Every summary card, completion bar, and streak metric is derived directly from your live stored tasks and focus logs.
- **Subtle, Deterministic Planning**: Rather than sending your personal schedule to expensive or opaque third-party AI endpoints, LifePilot features a **100% client-side deterministic planning engine** that scores tasks based on deadline urgency, priority tiers, and configured workday bounds.
- **Full Offline Persistence**: Works without requiring external logins, database subscriptions, or API keys.

---

## 2. Key Features

### 📋 Task Management
- **Full CRUD operations**: Create, edit, delete, and mark tasks complete.
- **Granular attributes**: Priority tiers (High, Medium, Low), due dates, scheduled times, estimated durations in minutes, categories (Study, Work, Health, Personal, Finance), and customizable `#tags`.
- **Fast filtering & search**: Instant search by title, description, or tag, plus filters for status (`Active`, `Completed`) and categories.
- **Dual view modes**: Seamless toggle between detailed **List View** and spatial **Grid View**.
- **Safe deletion**: Confirmation dialogs before permanent task removal.

### 📅 Calendar & Workload Planning
- **Monthly & Weekly views**: Powered by `date-fns` for accurate Gregorian calculations.
- **Interactive date selection**: Click any day to inspect all scheduled items, track completed tasks, and schedule new tasks directly onto that date.
- **Workload visualization**: Color-coded badges and priority indicators on calendar cells.

### 🎯 Goals & Milestone Tracking
- **Measurable targets**: Set quantitative goals with custom units (e.g. `10 modules`, `16 sessions`, `12 books`).
- **Direct progress updates**: Click to increment or edit current progress values with live percentage calculations.
- **Task linking**: Connect relevant tasks to broader goals and monitor completion ratios.

### ⏱️ Focus Room (Pomodoro Timer)
- **Customizable intervals**: 25-minute deep focus, 5-minute short break, and 15-minute long break.
- **Task anchoring**: Connect a focus session to an existing incomplete task.
- **Acoustic feedback**: Subtle synthesized chimes using the browser's native Web Audio API (no external MP3 downloads required).
- **Session history**: Automatically logs completed sessions to your local history and feeds insights.

### 📊 Objective Insights & Analytics (Recharts)
- **7-day task completion volume** (Bar Chart).
- **Focus minutes distribution by day** (Smooth Area Gradient Chart).
- **Task completion ratio** (Interactive Donut Chart).
- **Goal milestone progress overview**.
- Graceful empty states when starting from an empty workspace.

### ⚙️ User Settings & Data Portability
- **Working hours boundary**: Configure start and end times (e.g. `09:00` to `18:00`), which dynamically constrain the daily planning engine.
- **Dark & Light mode**: Full theme support with synchronized CSS variables.
- **Sound control**: One-click mute or enable for acoustic feedback.
- **JSON Data Export**: Download an offline backup of your entire workspace.
- **JSON Data Import**: Restore backups with automated JSON schema validation.
- **Workspace controls**: Reset to realistic sample demonstration data or clear all workspace records with a safety confirmation dialog.

---

## 3. Local Planning Engine (`planner.js`)

LifePilot AI implements a **deterministic, rule-based daily planning algorithm** running entirely in your browser (`src/lib/planner.js`).

### How It Works:
1. **Urgency & Priority Scoring**:
   - Overdue tasks: **+110 points** (prioritized for immediate resolution).
   - Tasks due today: **+65 points**.
   - Tasks due tomorrow: **+35 points**.
   - Priority weights: High (+40), Medium (+20), Low (+8).
   - Active goal alignment bonus: **+15 points**.
   - Quick-win momentum bonus (tasks $\le$ 30 mins): **+10 points**.
2. **Workday Packing**:
   - Reads your configured working hours (e.g., `09:00` to `18:00`).
   - Packs tasks into available sequential time slots with automated rest buffers (10–15 mins) between sessions.
3. **Overload Detection**:
   - Calculates total planned minutes against available workday time.
   - If planned work exceeds available hours, it flags an overload warning and queues deferred tasks into tomorrow's queue.
4. **Interactive Review**:
   - Users can review the proposed schedule, examine contextual rationales ("Tackle during peak morning focus"), and apply the schedule with one click.

---

## 4. Amazon Developer Hackathon Compatibility

This project is built for the **Build, Ship, Shape: Amazon Developer Hackathon**.

### Alexa+ Simulated Experience Track Integration:
- **Interactive Web Simulator**: Located at `/alexa-simulator`, the app features a dedicated voice routine demonstration interface.
- **Conversational Intent Recognition**: Accepts natural prompts such as:
  - *"Alexa, what's on my schedule today?"*
  - *"Alexa, plan my day between 9 AM and 6 PM."*
  - *"Alexa, add a high-priority task 'Finish ML Assignment' for 45 minutes."*
  - *"Alexa, start a 25-minute focus session for Math."*
  - *"Alexa, how is my goal progress?"*
- **Ambient Smart Display Response**: Renders simulated Echo Show cards that directly query, create, and update tasks in the live `localStorage` database.
- **Voice Output**: Uses the browser's native `SpeechSynthesis` API to speak Alexa responses out loud.
- **Honest Simulation Compliance**: This simulator runs client-side to demonstrate the user experience without requiring AWS credentials, paid API subscriptions, or physical Echo devices. It does not falsely claim a live connection to AWS services.

---

## 5. Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) |
| **Routing** | [React Router 7](https://reactrouter.com/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) + PostCSS |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Date Calculations** | [date-fns](https://date-fns.org/) |
| **Notifications & Polish**| [Sonner](https://sonner.emilkowal.ski/) + [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Audio** | Native Web Audio API (`AudioContext`) |
| **Data Persistence** | Versioned browser `localStorage` |

---

## 6. Getting Started & Running Locally

### Prerequisites
- **Node.js**: v18.0.0 or later (v22+ recommended)
- **npm**: v9.0.0 or later

### Installation
Clone the repository and install dependencies:
```bash
# Clone the repository
git clone https://github.com/your-username/lifepilot-ai.git
cd lifepilot-ai

# Install dependencies
npm install
```

### Development Server
Run the local Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173/` (or the port shown in your terminal).

### Production Build
Compile optimized production assets:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

---

## 7. Data Persistence Architecture

All workspace data is stored in versioned `localStorage` keys under client isolation:
- `lifepilot_tasks_v1`: Array of task objects with metadata, priorities, and timestamps.
- `lifepilot_goals_v1`: Array of measurable goals, targets, and units.
- `lifepilot_focus_sessions_v1`: Logged Pomodoro focus blocks.
- `lifepilot_settings_v1`: Preferences, working hours, theme, and durations.
- `lifepilot_notifications_v1`: Local system notifications.

### First-Launch Seeding & Safety:
- Seeds a realistic, non-intrusive sample dataset on initial launch.
- Never overwrites user modifications upon page reload.
- Full import/export capabilities allow backing up data into portable `.json` files.

---

## 8. Known Limitations
- **Browser-Scoped Storage**: Since data is persisted via `localStorage`, data does not automatically sync across different browsers or separate devices without exporting/importing JSON backups.
- **Speech Synthesis Voices**: Voice audio in the Alexa+ simulator uses the system voices installed in the user's operating system/browser.

---

## 9. License

This project is open-source and released under the [MIT License](LICENSE).
