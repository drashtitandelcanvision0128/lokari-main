import { apiUrl, authHeaders } from './api'

export interface ProfileAddress {
  street:  string
  city:    string
  state:   string
  pincode: string
  country: string
}

export interface UserProfile {
  id: string
  fullName: string
  email: string
  phone?: string
  role: string
  avatarUrl?: string
  bio?: string
  location?: string
  listings?: number
  completed?: number
  createdAt?: string
  address?: ProfileAddress | null
}

/** Fetch current user's profile from DB */
export async function fetchMyProfile(): Promise<UserProfile | null> {
  try {
    const res = await fetch(apiUrl('/profile/me'), {
      headers: authHeaders(),
      credentials: 'include',
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.success ? (json.data as UserProfile) : null
  } catch {
    return null
  }
}

/** Update name, phone, bio, address */
export async function updateMyProfile(data: {
  name?: string
  phone?: string
  bio?: string
  address?: Partial<ProfileAddress>
}): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(apiUrl('/profile/me'), {
      method: 'PUT',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    })
    return await res.json()
  } catch {
    return { success: false, message: 'Network error' }
  }
}

/** Upload avatar — pass the File object directly (multipart/form-data via multer) */
export async function uploadAvatar(
  file: File,
): Promise<{ success: boolean; avatarUrl?: string; message?: string }> {
  try {
    const form = new FormData()
    form.append('avatar', file)

    // Do NOT set Content-Type — browser sets it with the correct boundary
    const headers: Record<string, string> = {}
    const token = (await import('./api')).getAuthToken()
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(apiUrl('/profile/me/avatar'), {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: form,
    })
    return await res.json()
  } catch {
    return { success: false, message: 'Network error' }
  }
}

/** Remove avatar */
export async function deleteAvatar(): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(apiUrl('/profile/me/avatar'), {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include',
    })
    return await res.json()
  } catch {
    return { success: false, message: 'Network error' }
  }
}
