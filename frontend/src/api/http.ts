import type {TokenResponse} from "@/api/types.ts";

type Primitive = string | number | boolean | Date | null | undefined;
type QueryValue = Primitive | Primitive[];
type QueryParams = object | Record<string, QueryValue>;
type BodyValue = BodyInit | object | null | undefined;

export interface ApiErrorPayload {
  code?: string;
  message?: string;
  details?: unknown;
  request_id?: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  requestId?: string;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message ?? `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
    this.requestId = payload.request_id;
  }
}

export interface RequestConfig {
  method?: string;
  body?: BodyValue;
  query?: QueryParams;
  headers?: HeadersInit;
  signal?: AbortSignal;
}

const FALLBACK_API_BASE_URL = "http://localhost:8000";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? FALLBACK_API_BASE_URL
).replace(/\/+$/, "");

function isBodyInit(value: BodyValue): value is BodyInit {
  return (
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof Blob ||
    typeof value === "string" ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value)
  );
}

function normalizeQueryValue(value: Primitive): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

export function buildUrl(path: string, query?: QueryParams): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`);

  if (!query) {
    return url.toString();
  }

  for (const [key, rawValue] of Object.entries(query)) {
    if (Array.isArray(rawValue)) {
      for (const entry of rawValue) {
        const normalized = normalizeQueryValue(entry);
        if (normalized !== undefined) {
          url.searchParams.append(key, normalized);
        }
      }
      continue;
    }

    const normalized = normalizeQueryValue(rawValue as Primitive);
    if (normalized !== undefined) {
      url.searchParams.set(key, normalized);
    }
  }

  return url.toString();
}

function createRequestId(): string | undefined {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return undefined;
}

export async function parseError(response: Response): Promise<ApiError> {
  let payload: ApiErrorPayload = {};

  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    payload = {
      message: response.statusText || "Request failed",
    };
  }

  return new ApiError(response.status, payload);
}

export async function refreshAccessToken(): Promise<string> {
  const response = await fetch(buildUrl("/auth/refresh"), {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    localStorage.removeItem("access_token");
    throw new Error("Unable to refresh access token");
  }

  const data: TokenResponse = await response.json();
  localStorage.setItem("access_token", data.access_token);
  return data.access_token;
}

export async function apiRequest<T>(
  path: string,
  config: RequestConfig = {},
  isProtected = false,
): Promise<T> {
  const headers = new Headers(config.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const requestId = createRequestId();
  if (requestId && !headers.has("X-Request-Id")) {
    headers.set("X-Request-Id", requestId);
  }

  let body: BodyInit | undefined;

  if (config.body !== undefined && config.body !== null) {
    if (isBodyInit(config.body)) {
      body = config.body;
    } else {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(config.body);
    }
  }

  if (isProtected) {
    let token = localStorage.getItem("access_token");
    if (!token) token = await refreshAccessToken();
    headers.set("Authorization", `Bearer ${token}`);
  }

  const request = ()=> {
    return fetch(buildUrl(path, config.query), {
      method: config.method ?? "GET",
      body,
      headers,
      credentials: "include",
      signal: config.signal,
    });
  }
  let response = await request()
  if (isProtected && (response.status === 401 || response.status === 403)) {
    const token = await refreshAccessToken();
    headers.set("Authorization", `Bearer ${token}`);
    response = await request();
  }
  if (!response.ok) {
    throw await parseError(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}


type FormPrimitive = string | number | boolean | Date;
type FormValue =
  | FormPrimitive
  | File
  | Blob
  | null
  | undefined
  | FormPrimitive[];

export function createFormData(values: Record<string, FormValue>): FormData {
  const formData = new FormData();

  for (const [key, rawValue] of Object.entries(values)) {
    if (rawValue === null || rawValue === undefined) {
      continue;
    }

    if (Array.isArray(rawValue)) {
      for (const value of rawValue) {
        formData.append(key, value instanceof Date ? value.toISOString() : String(value));
      }
      continue;
    }

    if (rawValue instanceof Date) {
      formData.append(key, rawValue.toISOString());
      continue;
    }

    if (rawValue instanceof Blob) {
      formData.append(key, rawValue);
      continue;
    }

    formData.append(key, String(rawValue));
  }

  return formData;
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function getFileUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) {
    return path;
  }
  return `${API_BASE_URL}/${path.startsWith("/") ? path.slice(1) : path}`;
}
