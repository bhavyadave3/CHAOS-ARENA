
/**
 * Send a request to the CHAOS ARENA backend.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export async function apiRequest(path, options = {}) {
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  headers.set('Accept', 'application/json');

  if (
    options.body != null &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      `Cannot connect to the CHAOS ARENA backend at ${API_BASE_URL}. ` +
        'Check that the Flask server is running.'
    );
  }

  const contentType = response.headers.get('content-type') || '';

  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null
        ? data.message || data.error
        : data;

    throw new Error(
      message || `Request failed with status ${response.status}.`
    );
  }

  return data;
}

/**
 * Check whether Flask and its database are available.
 */
export async function checkBackendHealth() {
  return apiRequest('/api/health');
}

/**
 * Save a completed game's score to SQLite.
 */
export async function saveGameScore({
  gameName,
  score,
  durationSeconds = 0,
}) {
  if (!Number.isInteger(score) || score < 0) {
    throw new Error('Score must be a non-negative integer.');
  }

  if (!Number.isInteger(durationSeconds) || durationSeconds < 0) {
    throw new Error('Duration must be a non-negative integer.');
  }

  return apiRequest('/api/scores', {
    method: 'POST',
    body: JSON.stringify({
      game_name: gameName,
      score,
      duration_seconds: durationSeconds,
    }),
  });
}

/**
 * Retrieve the leaderboard.
 * Optionally filter by game name.
 */
export async function getLeaderboard({
  gameName,
  limit = 10,
} = {}) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('Leaderboard limit must be between 1 and 100.');
  }

  const params = new URLSearchParams({
    limit: String(limit),
  });

  if (gameName) {
    params.set('game_name', gameName);
  }

  return apiRequest(`/api/leaderboard?${params.toString()}`);
}
