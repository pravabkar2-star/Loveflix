// =============================================
//  LOVEFLIX — Home Page JS
// =============================================

let allVideos = [];
let currentQuery = "";
let currentSort = "default";

// ── Init ────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  requireAuth();

  const user = getCurrentUser();
  if (user) {
    const initial = user.email.charAt(0).toUpperCase();
    document.getElementById("user-initial").textContent = initial;
    document.getElementById("user-email-display").textContent = user.email;
  }

  loadVideos();
  updateNotifBadge();
  setupNavbar();
  setupSearch();
  setupSort();
  setupUserMenu();
});

// ── Load Videos from global variable ──────────
function loadVideos() {
  // window.LF_VIDEOS is set by data/videos.js (included via <script> in home.html)
  allVideos = window.LF_VIDEOS || [];

  if (allVideos.length === 0) {
    document.getElementById("hero").style.display = "none";
    document.getElementById("content-rows").innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🎬</span>
        <p>No stories available yet.</p>
        <p style="margin-top:8px;font-size:0.8rem;color:var(--text-muted)">Come back soon — something special is coming.</p>
      </div>`;
    return;
  }

  renderHero(allVideos);
  renderRows(allVideos);
}

// ── Hero Banner ──────────────────────────────────
let heroVideos = [];
let currentHeroIndex = 0;
let heroInterval = null;

function renderHero(videos) {
  heroVideos = [...videos].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  if (heroVideos.length === 0) return;

  updateHeroDisplay();

  if (heroVideos.length > 1) {
    if (heroInterval) clearInterval(heroInterval);
    heroInterval = setInterval(() => {
      currentHeroIndex = (currentHeroIndex + 1) % heroVideos.length;
      updateHeroDisplay();
    }, 5000);
  }
}

function updateHeroDisplay() {
  const video = heroVideos[currentHeroIndex];
  if (!video) return;
  const hero = document.getElementById("hero");
  const img = hero.querySelector(".hero-bg img");

  img.style.transition = "opacity 0.3s ease";
  img.style.opacity = "0.5";

  setTimeout(() => {
    img.src = video.thumbnail;
    img.alt = video.title;
    img.style.opacity = "1";

    hero.querySelector(".hero-badge").textContent = "✨ " + (video.category || "Featured");
    hero.querySelector(".hero-title").textContent = video.title;
    hero.querySelector(".hero-desc").textContent = video.description || "";
    hero.querySelector(".hero-watch-btn").onclick = () => openStory(video.id);
    hero.style.display = "block";
  }, 300);
}

// ── Render Rows ──────────────────────────────────
function renderRows(videos, searchMode = false) {
  const container = document.getElementById("content-rows");
  const searchHeader = document.getElementById("search-header");
  container.innerHTML = "";

  if (videos.length === 0) {
    searchHeader.style.display = "none";
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🔍</span>
        <p>No stories found${currentQuery ? ` for "<strong>${escapeHTML(currentQuery)}</strong>"` : ""}.</p>
      </div>`;
    return;
  }

  if (searchMode && currentQuery) {
    searchHeader.style.display = "block";
    searchHeader.innerHTML = `Showing <strong>${videos.length}</strong> result${videos.length !== 1 ? "s" : ""} for "<strong>${escapeHTML(currentQuery)}</strong>"`;
    container.appendChild(buildSection("Search Results", "🔍", videos));
    return;
  }

  searchHeader.style.display = "none";

  // Group by category
  const categories = {};
  videos.forEach(v => {
    const cat = v.category || "Uncategorized";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(v);
  });

  const catIcons = {
    "Memories": "🌟", "Love Letters": "💌", "Adventures": "🗺️",
    "Milestones": "🎉", "Daily Life": "☀️", "Special Moments": "✨",
    "Surprises": "🎁", "Uncategorized": "🎬",
  };

  Object.entries(categories).forEach(([cat, vids]) => {
    container.appendChild(buildSection(cat, catIcons[cat] || "🎬", vids));
  });
}

function buildSection(title, icon, videos) {
  const section = document.createElement("div");
  section.className = "row-section";

  const header = document.createElement("div");
  header.className = "row-header";
  header.innerHTML = `
    <h2 class="row-title"><span class="row-icon">${icon}</span>${escapeHTML(title)}</h2>
    <span class="row-count">${videos.length} ${videos.length === 1 ? "story" : "stories"}</span>`;

  const grid = document.createElement("div");
  grid.className = "cards-scroll";
  videos.forEach((v, i) => grid.appendChild(buildCard(v, i)));

  section.appendChild(header);
  section.appendChild(grid);
  return section;
}

function buildCard(video, delay = 0) {
  const card = document.createElement("div");
  card.className = "story-card";
  card.style.animation = `fadeInUp 0.5s ease ${delay * 70}ms both`;
  card.innerHTML = `
    <img class="card-thumb" src="${escapeHTML(video.thumbnail)}" alt="${escapeHTML(video.title)}" loading="lazy" />
    <span class="card-category-pill">${escapeHTML(video.category || "Story")}</span>
    <div class="card-overlay">
      <div class="card-play-btn">▶</div>
      <div class="card-title">${escapeHTML(video.title)}</div>
      <div class="card-meta">${formatDate(video.date) || ""}</div>
    </div>`;
  card.addEventListener("click", () => openStory(video.id));
  return card;
}

function openStory(id) {
  window.location.href = `story.html?id=${encodeURIComponent(id)}`;
}

// ── Search ───────────────────────────────────────
function setupSearch() {
  document.getElementById("search-input").addEventListener("input", debounce(() => {
    currentQuery = document.getElementById("search-input").value.trim().toLowerCase();
    applyFilters();
  }, 250));
}

// ── Sort ─────────────────────────────────────────
function setupSort() {
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      applyFilters();
    });
  }
}

function applyFilters() {
  let videos = [...allVideos];

  if (currentQuery) {
    videos = videos.filter(v =>
      v.title.toLowerCase().includes(currentQuery) ||
      (v.description || "").toLowerCase().includes(currentQuery) ||
      (v.category || "").toLowerCase().includes(currentQuery)
    );
  }

  switch (currentSort) {
    case "title-asc": videos.sort((a, b) => a.title.localeCompare(b.title)); break;
    case "title-desc": videos.sort((a, b) => b.title.localeCompare(a.title)); break;
    case "newest": videos.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
    case "oldest": videos.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
  }

  const searchActive = !!currentQuery || currentSort !== "default";
  document.getElementById("hero").style.display = searchActive ? "none" : "block";
  renderRows(videos, !!currentQuery);
}

// ── Navbar scroll effect ─────────────────────────
function setupNavbar() {
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 10);
  });
}

// ── User Dropdown ────────────────────────────────
function setupUserMenu() {
  const menu = document.getElementById("user-menu");
  const dropdown = document.getElementById("user-dropdown");
  const logoutBtn = document.getElementById("logout-btn");

  menu.addEventListener("click", (e) => { e.stopPropagation(); dropdown.classList.toggle("open"); });
  document.addEventListener("click", () => dropdown.classList.remove("open"));
  logoutBtn.addEventListener("click", (e) => { e.preventDefault(); logout(); });
}
