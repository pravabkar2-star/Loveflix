# 🎬 Loveflix

A Netflix-style private story cinema — built with plain HTML, CSS, and JavaScript. No backend, no build step. Just open `index.html`.

---

## 🚀 How to Open

Double-click `index.html` **or** serve the folder with any static file server:
```bash
# Python
python -m http.server 8080
# Node
npx serve .
```
Then visit `http://localhost:8080`.

---

## 🔐 Login Credentials

Edit the `USERS` array in `js/auth.js` to add/remove users:

```js
const USERS = [
  { email: "love@loveflix.com",  password: "forever2024" },
  { email: "her@loveflix.com",   password: "myprincess"  },
  { email: "admin@loveflix.com", password: "admin123"    },
];
```

> Auth uses `localStorage` — no server required.

---

## 📂 Folder Structure

```
Anki/
├── index.html              ← Login page
├── home.html               ← Netflix-style browse page
├── story.html              ← Story / slideshow viewer
├── notifications.html      ← Messages page
│
├── css/                    ← All stylesheets
├── js/                     ← All JavaScript
│
├── data/
│   └── videos.json         ← ⭐ Add your story catalog here
│
├── stories/
│   ├── story_001.json      ← ⭐ Add story frame files here
│   └── story_002.json
│
└── notifications/
    └── messages.json       ← ⭐ Add messages/notifications here
```

---

## ➕ Adding a New Story

### Step 1 — Add a catalog entry in `data/videos.json`

```json
{
  "id": "story_003",
  "title": "Our Anniversary",
  "thumbnail": "https://your-image-url.com/cover.jpg",
  "description": "One year of us.",
  "category": "Milestones",
  "storyFile": "stories/story_003.json",
  "date": "2024-06-15"
}
```

### Step 2 — Create the story frame file `stories/story_003.json`

```json
{
  "id": "story_003",
  "title": "Our Anniversary",
  "frames": [
    { "image": "https://your-image-url.com/frame1.jpg", "label": "One year ago…" },
    { "image": "https://your-image-url.com/frame2.jpg", "label": "You said yes." },
    { "image": "https://your-image-url.com/frame3.jpg", "label": "Here's to forever. 💕" }
  ]
}
```

That's it. Refresh the browser and the story appears on the home screen.

---

## 💌 Sending a Notification / Message

Add an entry to `notifications/messages.json`:

```json
{
  "id": "notif_004",
  "type": "love",
  "title": "💌 Thinking of you",
  "body": "Just wanted to say I love you.",
  "timestamp": "2026-03-22T10:00:00Z",
  "read": false
}
```

Valid `type` values: `love`, `heart`, `star`, `gift`, `alert`, `info`, `surprise`

Unread messages show a red badge on the bell icon. She can click to mark them as read.

---

## 🎬 Story Viewer Controls

| Action | Control |
|---|---|
| Next frame | `→` arrow key / click right half of screen |
| Prev frame | `←` arrow key / click left half of screen |
| Play / Pause | `P` key or the ⏸ button |
| Back to home | `←` back button top-left |

Auto-advances every **5 seconds** per frame. All images are preloaded before playback starts.

---

## 🎨 Customization

- **Accent color**: change `--accent` in `css/global.css` (default: Netflix red `#e50914`)
- **Frame duration**: change `FRAME_DURATION` in `js/story.js` (default: `5000` ms)
- **Add categories**: just use any `category` value in `videos.json` — new rows are created automatically

---

## 📱 Responsive

Works on mobile (375px+). Tap left/right half of screen to navigate story frames.
