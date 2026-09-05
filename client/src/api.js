const BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:4000'}/api/reservations`;

async function request(path, options) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const body = await response.json();

  if (!response.ok) {
    const message = body.details?.[0]?.message ?? body.error ?? 'Une erreur est survenue';
    throw new Error(message);
  }

  return body;
}

export const reservationsApi = {
  list: () => request(''),
  stats: () => request('/stats'),
  create: (payload) => request('', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  updateStatus: (id, status) =>
    request(`/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  remove: (id) => request(`/${id}`, { method: 'DELETE' }),
};
