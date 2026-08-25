const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4001/api';

function authHeaders() {
  const token = localStorage.getItem('illuma_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

export function signUpCustomer(payload) {
  return request('/auth/user/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export function logInCustomer(payload) {
  return request('/auth/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export function getFollowedShops() {
  return request('/follows', { headers: authHeaders() });
}

export function getShopStorefront(slug) {
  return request(`/shops/${slug}`);
}

export function discoverShops(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/shops${query ? `?${query}` : ''}`);
}

export function followShop(shopId) {
  return request(`/follows/${shopId}`, {
    method: 'POST',
    headers: authHeaders()
  });
}

export function getChatMessages(shopId) {
  return request(`/chat/${shopId}`, { headers: authHeaders() });
}

export function sendChatMessage(shopId, message_text) {
  return request(`/chat/${shopId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ message_text })
  });
}

export function getShopStatus(shopId) {
  return request(`/status/${shopId}`);
}
