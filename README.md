# חיבוק יומי (Daily Hug)

A mobile-first emotional support and gratitude web app built as a personal gift. It feels like a "digital hug" — minimal, calm, and requiring zero cognitive effort.
t
## Features

### Home — The Daily Push
A clean screen showing a single daily message of love and encouragement. New messages appear automatically as they're added.

### Happy Jar — צנצנת השמחה
A jar filled with memories, quotes, and moments. Tap to reveal a random one. Thoughts from "My Corner" can be sent here too and removed if needed.

### SOS — First Aid
A soft "How are you feeling?" screen with options like Anxious, Insecure, or Overwhelmed. Each shows a tailored comforting message with breathing exercises.

### My Corner — הפינה שלי
A private space with two sections:
- **Today's Good** — Three daily gratitude prompts with a historical archive. Editable after saving.
- **Thoughts Drawer** — Pastel sticky notes for quotes, ideas, and reminders. Supports edit, delete (with confirmation), drag-and-drop reorder, and sending thoughts to the Happy Jar.

### Feed — הפיד שלי
A scrollable archive of all posts — daily messages, gratitude notes, successes, and moments — sorted newest first.

### Admin Panel (Hidden)
Tap the greeting on the Home screen 5 times quickly to reveal a PIN-protected admin dashboard for adding daily messages, feed posts, and happy jar items.

## Tech Stack

- **React 19** with Vite 8
- **Tailwind CSS v4** with custom pastel theme tokens
- **Lucide React** for icons
- **@dnd-kit** for touch-friendly drag-and-drop
- **localStorage** for client-side data persistence
- **RTL / Hebrew** layout with Rubik font

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Project Structure

```
src/
├── components/
│   ├── HomeTab.jsx        # Daily message + hidden admin trigger
│   ├── HappyJarTab.jsx    # Random memory/quote reveal
│   ├── SOSTab.jsx         # Emotional first aid
│   ├── MyCornerTab.jsx    # Gratitude journal + thoughts drawer
│   ├── FeedTab.jsx        # Chronological post archive
│   ├── AdminPanel.jsx     # Content management (PIN-protected)
│   └── BottomNav.jsx      # 5-tab navigation
├── data/
│   ├── mockData.js        # Seed data (Hebrew)
│   └── DataContext.jsx    # Global state + localStorage persistence
├── App.jsx
├── main.jsx
└── index.css              # Tailwind theme + animations
```

## Design Principles

- **Mobile-first** — max-width 480px, centered on larger screens
- **Zero pressure** — no notifications, no streaks, no gamification
- **Soft pastels** — peach, sage, lavender, blush on warm cream
- **RTL native** — fully Hebrew interface with right-to-left layout
- **PWA ready** — viewport meta tags and theme color configured
