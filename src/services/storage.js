import AsyncStorage from '@react-native-async-storage/async-storage';

const NS = 'florassence:';

const KEYS = {
  ONBOARDING_DONE: `${NS}onboarding_done`,
  THEME:           `${NS}theme`,
  FAVORITES:       `${NS}favorites`,
  PROFILE:         `${NS}profile`,
  FOCUS_STATS:     `${NS}focus_stats`,
  TASKS:           `${NS}tasks`,
  XP:              `${NS}xp`,
  DAILY_GOAL:      `${NS}daily_goal`,
  STATS:           `${NS}stats`,
  AUTH_SESSION:    `${NS}auth_session`,
};

async function getString(key) {
  try { return await AsyncStorage.getItem(key); } catch { return null; }
}
async function setString(key, value) {
  try { await AsyncStorage.setItem(key, value); return true; } catch { return false; }
}
async function getJson(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
async function setJson(key, value) {
  try { await AsyncStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
async function remove(key) {
  try { await AsyncStorage.removeItem(key); return true; } catch { return false; }
}

export async function getOnboardingDone() {
  const val = await getString(KEYS.ONBOARDING_DONE);
  return val === 'true';
}
export async function setOnboardingDone() {
  return setString(KEYS.ONBOARDING_DONE, 'true');
}

export async function getSavedTheme() {
  return (await getString(KEYS.THEME)) || 'light';
}
export async function saveTheme(theme) {
  return setString(KEYS.THEME, theme);
}

export async function getFavorites() {
  return getJson(KEYS.FAVORITES, []);
}
export async function addFavorite(taskId) {
  const current = await getFavorites();
  if (current.includes(taskId)) return true;
  return setJson(KEYS.FAVORITES, [...current, taskId]);
}
export async function removeFavorite(taskId) {
  const current = await getFavorites();
  return setJson(KEYS.FAVORITES, current.filter((id) => id !== taskId));
}
export async function toggleFavorite(taskId) {
  const current = await getFavorites();
  if (current.includes(taskId)) {
    await setJson(KEYS.FAVORITES, current.filter((id) => id !== taskId));
    return false;
  } else {
    await setJson(KEYS.FAVORITES, [...current, taskId]);
    return true;
  }
}

// ── Profile ───────────────────────────────────────────────────────────────────
const DEFAULT_PROFILE = {
  name: 'Student',
  streak: 7,
  sessionsTotal: 42,
  hoursStudied: 84,
  tasksCompleted: 86,
  avatarUri: null,   // local file:// uri from the image picker/camera, or null
  bio: '',
  email: '',
  location: null,    // { latitude, longitude } or null — only ever set if the user opts in
};
export async function getProfile() {
  return getJson(KEYS.PROFILE, DEFAULT_PROFILE);
}
// Merges instead of overwriting so that saving a partial update (e.g. just
// { name }) never wipes out other fields (e.g. avatarUri) saved elsewhere.
export async function saveProfile(partialProfile) {
  const current = await getProfile();
  const merged = { ...current, ...partialProfile };
  return setJson(KEYS.PROFILE, merged);
}

// ── Focus Stats ───────────────────────────────────────────────────────────────
const DEFAULT_FOCUS_STATS = {
  sessionsToday: 0,
  totalSessions: 0,
  xpEarned: 0,
  lastDate: null,
};
export async function getFocusStats() {
  return getJson(KEYS.FOCUS_STATS, DEFAULT_FOCUS_STATS);
}
export async function saveFocusStats(stats) {
  return setJson(KEYS.FOCUS_STATS, stats);
}

// ── Tasks (persistent CRUD) ───────────────────────────────────────────────────
export async function getStoredTasks() {
  return getJson(KEYS.TASKS, null); // null = not yet seeded
}
export async function saveStoredTasks(tasks) {
  return setJson(KEYS.TASKS, tasks);
}

// ── XP & Level ────────────────────────────────────────────────────────────────
const DEFAULT_XP = { total: 0 };
export async function getXP() {
  return getJson(KEYS.XP, DEFAULT_XP);
}
export async function saveXP(data) {
  return setJson(KEYS.XP, data);
}

// ── Daily Goal ────────────────────────────────────────────────────────────────
const DEFAULT_DAILY_GOAL = {
  targetSessions: 3,
  targetTasks:    5,
  sessionsCompleted: 0,
  tasksCompleted:    0,
  date: null,
};
export async function getDailyGoal() {
  return getJson(KEYS.DAILY_GOAL, DEFAULT_DAILY_GOAL);
}
export async function saveDailyGoal(goal) {
  return setJson(KEYS.DAILY_GOAL, goal);
}

// ── Auth Session (mock) ───────────────────────────────────────────────────────
// A real backend would issue a token; here we just persist a flag + the
// identity the user typed in on the Auth screen, so a relaunch doesn't force
// them through the login screen again.
export async function getAuthSession() {
  return getJson(KEYS.AUTH_SESSION, null); // null = logged out
}
export async function saveAuthSession(session) {
  return setJson(KEYS.AUTH_SESSION, { ...session, loggedInAt: Date.now() });
}
export async function clearAuthSession() {
  return remove(KEYS.AUTH_SESSION);
}

// ── Study Stats ───────────────────────────────────────────────────────────────
const DEFAULT_STATS = {
  streak:        0,
  totalSessions: 0,
  totalTasks:    0,
  totalXP:       0,
  weeklyHours:   [0, 0, 0, 0, 0, 0, 0], // Sun–Sat
  lastStudyDate: null,
};
export async function getStudyStats() {
  return getJson(KEYS.STATS, DEFAULT_STATS);
}
export async function saveStudyStats(stats) {
  return setJson(KEYS.STATS, stats);
}
