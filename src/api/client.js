const API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api"
).replace(/\/$/, "");
const TOKEN_KEY = "sari_ph_api_token";

export function getApiToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setApiToken(token) {
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

function buildUrl(path, params = {}) {
  const url = new URL(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

function validationErrorsFromPayload(payload) {
  if (!payload?.errors || typeof payload.errors !== "object") return {};

  return Object.fromEntries(
    Object.entries(payload.errors).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : String(value),
    ])
  );
}

export async function apiRequest(path, options = {}) {
  const { params, body, headers, ...fetchOptions } = options;
  const response = await fetch(buildUrl(path, params), {
    ...fetchOptions,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(getApiToken() ? { Authorization: `Bearer ${getApiToken()}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.message || payload?.error || "The backend request failed.");
    error.status = response.status;
    error.errors = validationErrorsFromPayload(payload);
    throw error;
  }

  return payload;
}

export const productsApi = {
  list(params) {
    return apiRequest("/products", { params });
  },
  create(product) {
    return apiRequest("/products", { method: "POST", body: product });
  },
  update(id, product) {
    return apiRequest(`/products/${id}`, { method: "PUT", body: product });
  },
  remove(id) {
    return apiRequest(`/products/${id}`, { method: "DELETE" });
  },
};

export const salesApi = {
  list(params) {
    return apiRequest("/sales", { params });
  },
  create(sale) {
    return apiRequest("/sales", { method: "POST", body: sale });
  },
};

export const authApi = {
  async login(credentials) {
    const payload = await apiRequest("/auth/login", { method: "POST", body: credentials });
    setApiToken(payload.token);
    return payload;
  },
  async logout() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } finally {
      setApiToken(null);
    }
  },
  changePassword(password) {
    return apiRequest("/auth/change-password", { method: "POST", body: { password } });
  },
};

export const usersApi = {
  list() {
    return apiRequest("/users");
  },
  create(user) {
    return apiRequest("/users", { method: "POST", body: user });
  },
  update(id, user) {
    return apiRequest(`/users/${id}`, { method: "PUT", body: user });
  },
  resetPassword(id, payload) {
    return apiRequest(`/users/${id}/reset-password`, { method: "POST", body: payload });
  },
};

export const receiptsApi = {
  list(params) {
    return apiRequest("/receipts", { params });
  },
};

export const postVoidApi = {
  list(params) {
    return apiRequest("/post-void-approvals", { params });
  },
  create(payload) {
    return apiRequest("/post-void-approvals", { method: "POST", body: payload });
  },
  approve(id, payload) {
    return apiRequest(`/post-void-approvals/${id}/approve`, { method: "POST", body: payload });
  },
  reject(id, payload) {
    return apiRequest(`/post-void-approvals/${id}/reject`, { method: "POST", body: payload });
  },
  statistics() {
    return apiRequest("/post-void-approvals/statistics/overview");
  },
};

export const reportsApi = {
  summary() {
    return apiRequest("/reports/sales-summary");
  },
  transactions() {
    return apiRequest("/reports/transactions");
  },
};
