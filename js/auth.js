// =============================================
//  LOVEFLIX — Auth Module
//  Add / remove users in the USERS array below
// =============================================

const USERS = [
  { email: "kittu", password: "PravabWife" },
];

const SESSION_KEY = "loveflix_user";

// ── Login ──────────────────────────────────────
function login(email, password) {
  const trimEmail = email.trim().toLowerCase();
  const user = USERS.find(
    u => u.email.toLowerCase() === trimEmail && u.password === password
  );
  if (!user) return { success: false, message: "Invalid email or password." };

  const sessionData = JSON.stringify({ email: user.email });
  localStorage.setItem(SESSION_KEY, sessionData);
  return { success: true };
}

// ── Logout ─────────────────────────────────────
function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.replace("index.html");
}

// ── Get Current User ───────────────────────────
function getCurrentUser() {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;
  try { return JSON.parse(session); }
  catch { return null; }
}

// ── Route Guard (protected pages) ─────────────
// Call at top of every page that requires login
function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.replace("index.html");
    return false;
  }
  return user;
}

// ── Redirect if already logged in ─────────────
// Call on login page — sends user to home if already in
function redirectIfLoggedIn() {
  if (getCurrentUser()) {
    window.location.replace("home.html");
  }
}
