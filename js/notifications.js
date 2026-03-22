// =============================================
//  LOVEFLIX — Notifications Page JS
// =============================================

document.addEventListener("DOMContentLoaded", () => {
  requireAuth();

  const user = getCurrentUser();
  if (user) {
    document.getElementById("user-initial").textContent = user.email.charAt(0).toUpperCase();
    document.getElementById("user-email-display").textContent = user.email;
  }

  // Navbar scroll
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => navbar.classList.toggle("scrolled", window.scrollY > 10));

  // User dropdown
  const userMenu  = document.getElementById("user-menu");
  const dropdown  = document.getElementById("user-dropdown");
  const logoutBtn = document.getElementById("logout-btn");
  userMenu.addEventListener("click", e => { e.stopPropagation(); dropdown.classList.toggle("open"); });
  document.addEventListener("click", () => dropdown.classList.remove("open"));
  logoutBtn.addEventListener("click", e => { e.preventDefault(); logout(); });

  // Mark all read button
  document.getElementById("mark-read-btn").addEventListener("click", markAllRead);

  // Data is set by notifications/messages.js included via <script> in notifications.html
  renderNotifications();
  updateNotifBadge();
});

function renderNotifications() {
  const list          = document.getElementById("notif-list");
  const notifications = window.LF_NOTIFICATIONS || [];
  const readIds       = JSON.parse(localStorage.getItem("lf_read_notifs") || "[]");

  list.innerHTML = "";

  if (notifications.length === 0) {
    list.innerHTML = `
      <div class="notif-empty">
        <span class="empty-icon">🔔</span>
        <h3>Nothing here yet</h3>
        <p>When you receive a message, it will appear here.</p>
      </div>`;
    updateUnreadCount(0);
    return;
  }

  const sorted = [...notifications].sort((a, b) => {
    const aRead = readIds.includes(a.id);
    const bRead = readIds.includes(b.id);
    if (aRead !== bRead) return aRead ? 1 : -1;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  let unreadCount = 0;
  sorted.forEach((notif, i) => {
    const isRead = readIds.includes(notif.id);
    if (!isRead) unreadCount++;

    const card = document.createElement("div");
    card.className = `notif-card ${isRead ? "read" : "unread"}`;
    card.style.animationDelay = `${i * 60}ms`;
    card.innerHTML = `
      <div class="notif-icon-wrap">${getNotifIcon(notif.type)}</div>
      <div class="notif-body">
        <div class="notif-title">${escapeHTML(notif.title)}</div>
        <div class="notif-message">${escapeHTML(notif.body)}</div>
        <div class="notif-time">
          ${!isRead ? '<span class="unread-dot"></span>' : ""}
          🕐 ${timeAgo(notif.timestamp)}
        </div>
      </div>`;

    card.addEventListener("click", () => {
      if (!isRead) {
        const stored = JSON.parse(localStorage.getItem("lf_read_notifs") || "[]");
        stored.push(notif.id);
        localStorage.setItem("lf_read_notifs", JSON.stringify(stored));
        card.classList.remove("unread");
        card.classList.add("read");
        card.querySelector(".unread-dot")?.remove();
        updateUnreadCount(--unreadCount);
        updateNotifBadge();
      }
    });

    list.appendChild(card);
  });

  updateUnreadCount(unreadCount);
}

function getNotifIcon(type) {
  const icons = { love:"💌", heart:"❤️", star:"⭐", gift:"🎁", alert:"🔔", info:"💬", surprise:"🎉" };
  return icons[type] || "💌";
}

function updateUnreadCount(count) {
  const el = document.getElementById("unread-count");
  if (!el) return;
  el.innerHTML = count > 0
    ? `<strong>${count}</strong> unread message${count !== 1 ? "s" : ""}`
    : "All caught up ✓";
}

function markAllRead() {
  const allIds = (window.LF_NOTIFICATIONS || []).map(n => n.id);
  localStorage.setItem("lf_read_notifs", JSON.stringify(allIds));
  renderNotifications();
  updateNotifBadge();
  showToast("All messages marked as read ✓", "success");
}
