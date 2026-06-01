const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  products: {
    list: () => request('/products/'),
    get: (id) => request(`/products/${id}`),
    create: (data) => request('/products/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  },
  customers: {
    list: () => request('/customers/'),
    get: (id) => request(`/customers/${id}`),
    create: (data) => request('/customers/', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: () => request('/orders/'),
    get: (id) => request(`/orders/${id}`),
    create: (data) => request('/orders/', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/orders/${id}`, { method: 'DELETE' }),
  },
  dashboard: () => request('/dashboard'),
}
