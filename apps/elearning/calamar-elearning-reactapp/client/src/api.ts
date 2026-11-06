// Types and calls of the server's API (all under /api, cookie authenticated).

export type Role = 'admin' | 'creator' | 'enduser';
export interface User { id: number; email: string; role: Role }

export interface Category { id: number; parentId: number | null; name: string; sortOrder: number; courseCount: number }
export interface Tag { id: number; name: string; courseCount: number }

export interface CourseSummary {
  id: number;
  title: string;
  description: string;
  creatorEmail: string;
  categoryId: number | null;
  categoryPath: string[];
  tags: string[];
  published: boolean;
  subscribed: boolean;
  subscriberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OutlineNode { path: string; index: number; title: string; kind: 'chapter' | 'page'; children: OutlineNode[] }
export interface NoteFile { name: string; size: number; updatedAt: string }
export interface PageView { path: string; title: string; kind: 'chapter' | 'page'; markdown: string; files: NoteFile[]; updatedAt: string }
export interface CourseDetails { course: CourseSummary; outline: OutlineNode[]; canRead: boolean; isCreator: boolean }

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const init: RequestInit = { method, credentials: 'same-origin', headers: {} };
  if (body instanceof FormData) init.body = body;
  else if (body !== undefined) {
    init.body = JSON.stringify(body);
    (init.headers as Record<string, string>)['Content-Type'] = 'application/json';
  }
  const res = await fetch('/api' + url, init);
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const serverMessage = data && typeof data === 'object' && 'error' in data ? String((data as { error: unknown }).error) : '';
    const message = serverMessage || (res.status === 401 ? 'Please sign in.' : `Request failed (${res.status}).`);
    throw new ApiError(res.status, message);
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try { return JSON.parse(text); } catch { return null; }
}

export const enc = (path: string) => path.split('/').map(encodeURIComponent).join('/');

export const api = {
  get: <T>(url: string) => request<T>('GET', url),
  post: <T = unknown>(url: string, body?: unknown) => request<T>('POST', url, body ?? {}),
  put: <T = unknown>(url: string, body?: unknown) => request<T>('PUT', url, body ?? {}),
  del: <T = unknown>(url: string) => request<T>('DELETE', url),
  upload: <T = unknown>(url: string, form: FormData) => request<T>('POST', url, form),
};

export function fileUrl(courseId: number, path: string, name: string) {
  return `/api/courses/${courseId}/files/${enc(path)}?name=${encodeURIComponent(name)}`;
}

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Chapters and pages in reading order. */
export function flatten(nodes: OutlineNode[], depth = 0): (OutlineNode & { depth: number })[] {
  return nodes.flatMap((n) => [{ ...n, depth }, ...flatten(n.children, depth + 1)]);
}

export const roleLabel: Record<Role, string> = { admin: 'Administrator', creator: 'Content creator', enduser: 'Learner' };
