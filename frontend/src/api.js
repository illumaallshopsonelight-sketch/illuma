const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

function authHeaders() {
  const token = localStorage.getItem('sc_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getFollowedShops() {
  const res = await fetch(`${API_BASE}/follows`, { headers: authHeaders() });
  return res.json();
}

export async function getShopStorefront(slug) {
  const res = await fetch(`${API_BASE}/shops/${slug}`);
  return res.json();
}

export async function discoverShops(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/shops?${query}`);
  return res.json();
}

export async function followShop(shopId) {
  const res = await fetch(`${API_BASE}/follows/${shopId}`, {
    method: 'POST',
    headers: authHeaders()
  });
  return res.json();
}

export async function getChatMessages(shopId) {
  const res = await fetch(`${API_BASE}/chat/${shopId}`, { headers: authHeaders() });
  return res.json();
}

export async function sendChatMessage(shopId, message_text) {
  const res = await fetch(`${API_BASE}/chat/${shopId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ message_text })
  });
  return res.json();
}

export async function getShopStatus(shopId) {
  const res = await fetch(`${API_BASE}/status/${shopId}`);
  return res.json();
}
