const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...headers, ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    if (res.status === 401 && path !== '/auth/login' && path !== '/auth/register') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  login: (username, password, rememberMe) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, remember_me: rememberMe }),
    }),
  register: (data) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, newPassword) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    }),
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
