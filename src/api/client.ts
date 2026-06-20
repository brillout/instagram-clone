export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function parse(res: Response) {
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw new ApiError(data?.error ?? `Request failed (${res.status})`, res.status)
  }
  return data
}

const BASE = '/api'

export const api = {
  get: (path: string) =>
    fetch(BASE + path, { credentials: 'include' }).then(parse),

  post: (path: string, body?: unknown) =>
    fetch(BASE + path, {
      method: 'POST',
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then(parse),

  /** POST multipart form data (used for image uploads). */
  upload: (path: string, form: FormData) =>
    fetch(BASE + path, {
      method: 'POST',
      credentials: 'include',
      body: form,
    }).then(parse),
}
