// =============================================
//  LOVEFLIX — Shared Utilities
// =============================================

// ── Format date ────────────────────────────────
function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

// ── Time ago string ────────────────────────────
function timeAgo(isoString) {
  const now  = Date.now();
  const past = new Date(isoString).getTime();
  const diff = Math.floor((now - past) / 1000);

  if (diff < 60)     return "Just now";
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(isoString);
}

// ── Toast notification ─────────────────────────
function showToast(message, type = "info", duration = 3000) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(40px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Debounce ───────────────────────────────────
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ── Preload images ─────────────────────────────
function preloadImages(urls) {
  return Promise.all(
    urls.map(
      url =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload  = () => resolve({ url, ok: true });
          img.onerror = () => resolve({ url, ok: false });
          img.src = url;
        })
    )
  );
}

// ── Dynamically load a <script> file ──────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload  = resolve;
    s.onerror = () => reject(new Error("Could not load: " + src));
    document.head.appendChild(s);
  });
}

// ── Get URL param ──────────────────────────────
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// ── Notification badge count ───────────────────
function updateNotifBadge() {
  const notifications = window.LF_NOTIFICATIONS || [];
  const readIds = JSON.parse(localStorage.getItem("lf_read_notifs") || "[]");
  const unread  = notifications.filter(n => !readIds.includes(n.id)).length;
  const badges  = document.querySelectorAll(".notif-badge");
  badges.forEach(badge => {
    if (unread > 0) {
      badge.textContent = unread > 9 ? "9+" : String(unread);
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  });
}

// ── Escape HTML ────────────────────────────────
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
