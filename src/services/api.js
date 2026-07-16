
const BASE_URL = 'https://jsonplaceholder.typicode.com';
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 2;
const RETRY_DELAY_MS = 800;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildTimeoutSignal(ms) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}


async function request(path, options = {}, retries = DEFAULT_RETRIES) {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    body,
    method = 'GET',
    headers = {},
    ...rest
  } = options;

  const { signal, clear } = buildTimeoutSignal(timeoutMs);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });

    clear();

    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status}`, response.status);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    clear();

    // Don't retry on abort (timeout) or 4xx client errors
    const isTimeout = err.name === 'AbortError';
    const isClientError = err instanceof ApiError && err.status >= 400 && err.status < 500;

    if (retries > 0 && !isClientError) {
      await delay(RETRY_DELAY_MS);
      return request(path, options, retries - 1);
    }

    if (isTimeout) {
      throw new ApiError('Request timed out. Check your connection.', 408);
    }

    throw err instanceof ApiError ? err : new ApiError(err.message || 'Network error', 0);
  }
}

// ── Custom error class ────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ── Exported helpers ──────────────────────────────────────────────────────────

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

// ── Domain-specific helpers ───────────────────────────────────────────────────
// These map JSONPlaceholder data to the shape the app expects.

/**
 * Fetch remote tasks (todos) — returns an array shaped like our local TASKS.
 * We slice to 30 items and enrich with local-friendly fields.
 */
export async function fetchRemoteTasks(limit = 30) {
  const raw = await api.get(`/todos?_limit=${limit}`);
  return raw.map((item) => ({
    id:        `remote-${item.id}`,
    remoteId:  item.id,
    title:     item.title.charAt(0).toUpperCase() + item.title.slice(1),
    due:       'No due date',
    filter:    item.completed ? 'done' : 'upcoming',
    priority:  ['Low', 'Medium', 'High'][item.id % 3],
    category:  ['Mathematics', 'Computer Science', 'Physics', 'English', 'Electronics'][item.id % 5],
    notes:     `Remote task #${item.id} — fetched from API.`,
    completed: item.completed,
    isRemote:  true,
  }));
}

/**
 * Fetch a single remote task by numeric ID.
 */
export async function fetchRemoteTaskById(numericId) {
  const item = await api.get(`/todos/${numericId}`);
  return {
    id:        `remote-${item.id}`,
    remoteId:  item.id,
    title:     item.title.charAt(0).toUpperCase() + item.title.slice(1),
    due:       'No due date',
    filter:    item.completed ? 'done' : 'upcoming',
    priority:  ['Low', 'Medium', 'High'][item.id % 3],
    category:  ['Mathematics', 'Computer Science', 'Physics', 'English', 'Electronics'][item.id % 5],
    notes:     `Remote task #${item.id} — fetched from API.`,
    completed: item.completed,
    isRemote:  true,
  };
}
