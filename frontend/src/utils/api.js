// decide base URL: dev uses VITE_API_BASE_URL, prod uses same origin
const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/api/data-products`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function updateProducts(products) {
  const res = await fetch(`${API_BASE}/api/data-products`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(products),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
