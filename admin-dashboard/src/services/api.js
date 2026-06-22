const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Base fetch helper — adds Authorization header automatically.
 */
async function request(endpoint, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers,
    ...options,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  /**
   * POST /api/admin/login
   * Returns { token, admin }
   */
  login: (email, password) =>
    request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // ─── Chefs ──────────────────────────────────────────────────────────────────
  getChefs: (token) => request('/api/admin/chefs', {}, token),

  createChef: (token, data) =>
    request('/api/admin/chefs', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  updateChefStatus: (token, id, status) =>
    request(`/api/admin/chefs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, token),

  deleteChef: (token, id) =>
    request(`/api/admin/chefs/${id}`, { method: 'DELETE' }, token),

  // ─── Users ──────────────────────────────────────────────────────────────────
  getUsers: (token) => request('/api/admin/users', {}, token),

  // ─── Stats ──────────────────────────────────────────────────────────────────
  getStats: (token) => request('/api/admin/stats', {}, token),
};
