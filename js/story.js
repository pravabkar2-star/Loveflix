// =============================================
//  LOVEFLIX — Story Viewer JS
// =============================================

let frames       = [];
let currentFrame = 0;
let isPlaying    = true;
let autoTimer    = null;
let autoInterval = null;
const FRAME_DURATION = 5000; // ms per frame

// ── Init ────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  requireAuth();

  const id = getParam("id");
  if (!id) { window.location.replace("home.html"); return; }

  try {
    // 1) Find story entry in global variable (set by data/videos.js)
    const videos = window.LF_VIDEOS || [];
    const entry  = videos.find(v => v.id === id);
    if (!entry) throw new Error("Story not found");

    // 2) Dynamically load this story
    updatePreloader(0, "Loading your story…");
    
    let story;
    if (entry.storyScript.endsWith(".json")) {
      const resp = await fetch(entry.storyScript);
      story = await resp.json();
    } else {
      await loadScript(entry.storyScript);
      story = (window.LF_STORIES || {})[entry.storyKey];
    }
    if (!story || !story.frames || story.frames.length === 0) {
      throw new Error("Story has no frames");
    }
    frames = story.frames;

    // 3) Set title
    document.getElementById("story-title").textContent     = entry.title;
    document.getElementById("story-frame-info").textContent = `${frames.length} frame${frames.length !== 1 ? "s" : ""}`;
    document.title = entry.title + " — Loveflix";

    // 4) Preload all images
    updatePreloader(0, "Downloading images…");
    const imageUrls = frames.map(f => f.image);
    let loaded = 0;

    await Promise.all(
      imageUrls.map(url =>
        new Promise(resolve => {
          const img = new Image();
          img.onload = img.onerror = () => {
            loaded++;
            const pct = Math.round((loaded / imageUrls.length) * 100);
            updatePreloader(pct, loaded < imageUrls.length ? `Loading images… ${loaded}/${imageUrls.length}` : "Ready ✨");
            resolve();
          };
          img.src = url;
        })
      )
    );

    // Small pause to show 100%
    await new Promise(r => setTimeout(r, 400));

    // 5) Build frames DOM
    buildFrames();
    buildProgressDots();

    // 6) Hide preloader & start viewer
    document.getElementById("preloader").classList.add("hidden");
    setTimeout(() => {
      document.getElementById("story-viewer").classList.add("ready");
      showFrame(0);
      startAutoPlay();
    }, 300);

  } catch (err) {
    console.error(err);
    document.getElementById("preloader").innerHTML = `
      <div style="text-align:center;padding:40px;max-width:400px">
        <div style="font-size:3rem;margin-bottom:20px">😔</div>
        <h3 style="color:#fff;margin-bottom:12px;font-size:1.1rem">Story not available</h3>
        <p style="color:#b3b3b3;font-size:0.9rem;line-height:1.6;margin-bottom:24px">
          This story couldn't be loaded right now. It may be coming soon!
        </p>
        <a href="home.html" style="
          display:inline-block;
          background:#e50914;
          color:#fff;
          padding:12px 28px;
          border-radius:6px;
          font-weight:700;
          text-decoration:none;
        ">← Back to Home</a>
      </div>`;
  }
});

// ── Preloader ────────────────────────────────────
function updatePreloader(pct, text) {
  const bar  = document.getElementById("preloader-bar");
  const pctEl = document.getElementById("preloader-pct");
  const textEl = document.getElementById("preloader-text");
  if (bar)   bar.style.width = `${pct}%`;
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (textEl) textEl.textContent = text;
}

// ── Build Frames DOM ─────────────────────────────
function buildFrames() {
  const container = document.getElementById("frame-container");
  container.querySelectorAll(".story-frame").forEach(el => el.remove());
  frames.forEach((f, i) => {
    const div = document.createElement("div");
    div.className = "story-frame";
    div.id = `frame-${i}`;
    div.innerHTML = `
      <img src="${escapeHTML(f.image)}" alt="Frame ${i + 1}" />
      <div class="frame-label" id="label-${i}">
        <p>${escapeHTML(f.label || "")}</p>
      </div>`;
    container.appendChild(div);
  });
}

// ── Progress Dots ────────────────────────────────
function buildProgressDots() {
  const wrap = document.getElementById("progress-dots");
  wrap.innerHTML = "";
  frames.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "progress-dot";
    dot.id = `dot-${i}`;
    dot.innerHTML = `<div class="progress-dot-fill" id="dot-fill-${i}"></div>`;
    wrap.appendChild(dot);
  });
}

// ── Show Frame ───────────────────────────────────
function showFrame(index) {
  document.querySelectorAll(".story-frame").forEach(el => el.classList.remove("active", "prev"));
  document.querySelectorAll(".frame-label").forEach(el => el.classList.remove("show"));
  document.querySelectorAll(".progress-dot").forEach(el => el.classList.remove("done"));
  document.querySelectorAll(".progress-dot-fill").forEach(el => el.style.width = "0%");

  const frameEl = document.getElementById(`frame-${index}`);
  if (!frameEl) return;
  frameEl.classList.add("active");
  setTimeout(() => {
    document.getElementById(`label-${index}`)?.classList.add("show");
  }, 300);

  for (let i = 0; i < index; i++) {
    document.getElementById(`dot-${i}`)?.classList.add("done");
  }

  document.getElementById("frame-counter").textContent = `${index + 1} / ${frames.length}`;
  currentFrame = index;
}

// ── Auto-play ────────────────────────────────────
function startAutoPlay() {
  stopAutoPlay();
  if (!isPlaying) return;
  const fill      = document.getElementById(`dot-fill-${currentFrame}`);
  const startTime = Date.now();

  autoInterval = setInterval(() => {
    const pct = Math.min(((Date.now() - startTime) / FRAME_DURATION) * 100, 100);
    if (fill) fill.style.width = pct + "%";
  }, 50);

  autoTimer = setTimeout(() => {
    if (currentFrame < frames.length - 1) {
      showFrame(currentFrame + 1);
      startAutoPlay();
    } else {
      document.getElementById(`dot-${currentFrame}`)?.classList.add("done");
      isPlaying = false;
      updatePlayBtn();
    }
  }, FRAME_DURATION);
}

function stopAutoPlay() {
  clearTimeout(autoTimer);
  clearInterval(autoInterval);
  autoTimer = null;
  autoInterval = null;
}

// ── Controls ─────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("play-pause-btn").addEventListener("click", () => {
    isPlaying = !isPlaying;
    updatePlayBtn();
    if (isPlaying) { startAutoPlay(); } else { stopAutoPlay(); }
  });

  document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentFrame > 0) { stopAutoPlay(); showFrame(currentFrame - 1); if (isPlaying) startAutoPlay(); }
  });

  document.getElementById("next-btn").addEventListener("click", () => {
    stopAutoPlay();
    showFrame(currentFrame < frames.length - 1 ? currentFrame + 1 : 0);
    if (isPlaying) startAutoPlay();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); document.getElementById("next-btn").click(); }
    if (e.key === "ArrowLeft")                    { e.preventDefault(); document.getElementById("prev-btn").click(); }
    if (e.key === "p" || e.key === "P")           { document.getElementById("play-pause-btn").click(); }
  });

  document.getElementById("frame-container").addEventListener("click", (e) => {
    const mid = window.innerWidth / 2;
    if (e.clientX > mid) { document.getElementById("next-btn").click(); }
    else                  { document.getElementById("prev-btn").click(); }
  });
});

function updatePlayBtn() {
  const btn = document.getElementById("play-pause-btn");
  if (btn) btn.textContent = isPlaying ? "⏸" : "▶";
}
