type ApiError = { message: string; status?: number };

const DEFAULT_BASE = "http://localhost:8081";

function getBaseUrl() {
  // Optional: user can set VITE_API_BASE_URL in frontend/.env
  // Keep fallback so it works out-of-the-box.
  const v = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  return v && v.trim().length ? v : DEFAULT_BASE;
}

function getToken() {
  try {
    return localStorage.getItem("access_token") || "";
  } catch {
    return "";
  }
}

async function apiFetch<T>(path: string, opts?: RequestInit & { skipAuth?: boolean }) {
  const baseUrl = getBaseUrl();
  const url = baseUrl.replace(/\/$/, "") + (path.startsWith("/") ? path : `/${path}`);

  const headers = new Headers(opts?.headers);
  headers.set("Content-Type", "application/json");

  if (!opts?.skipAuth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...opts,
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "message" in body && typeof (body as any).message === "string")
        ? (body as any).message
        : typeof body === "string" && body.trim().length
          ? body
          : `Request failed (${res.status})`;
    const err: ApiError = { message, status: res.status };
    throw err;
  }

  return body as T;
}

export const api = {
  get: <T>(path: string, opts?: { skipAuth?: boolean }) => apiFetch<T>(path, { method: "GET", skipAuth: opts?.skipAuth }),
  post: <T>(path: string, body: unknown, opts?: { skipAuth?: boolean }) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body), skipAuth: opts?.skipAuth }),
  patch: <T>(path: string, body: unknown, opts?: { skipAuth?: boolean }) =>
    apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body), skipAuth: opts?.skipAuth }),
  del: <T>(path: string, opts?: { skipAuth?: boolean }) => apiFetch<T>(path, { method: "DELETE", skipAuth: opts?.skipAuth }),
};

export type { ApiError };

