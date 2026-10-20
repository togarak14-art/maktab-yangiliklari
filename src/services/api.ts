import { School, NewsItem, SchoolMember, AppNotification, AdminUser, UserProfile } from '../types';
import { localDb } from './localDb';

const ADMIN_TOKEN_KEY = 'maktab_admin_token';
const USER_PROFILE_KEY = 'maktab_user_profile';

// Safe fetch helper that handles HTML 404/500 responses gracefully
// (especially in APKs, WebViews, or static web hosting)
async function safeFetch(url: string, options?: RequestInit): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    // If server returned HTML (e.g. 404 "The page cannot be found...", 502, SPA index.html)
    if (!contentType.includes('application/json')) {
      return { ok: false, error: `Serverdan kutilmagan javob qaytdi (${res.status})` };
    }

    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error || `Server xatosi: ${res.status}` };
    }
    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Aloqa xatosi' };
  }
}

export const api = {
  // Token management
  getToken(): string | null {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },
  setToken(token: string): void {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },
  clearToken(): void {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localDb.logoutAdmin();
  },

  // User Profile in LocalStorage
  getUserProfile(): UserProfile {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Invalid profile JSON', e);
      }
    }
    const defaultProfile: UserProfile = {
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      name: '',
      phone: '',
      role: 'student',
      connectedSchoolIds: [],
      notificationsEnabled: true,
      soundEnabled: true,
    };
    this.saveUserProfile(defaultProfile);
    return defaultProfile;
  },

  saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  },

  // Schools
  async getSchools(): Promise<School[]> {
    const result = await safeFetch('/api/schools');
    if (result.ok && result.data?.schools) {
      const serverSchools: School[] = result.data.schools;

      // Check if localDb has any schools not yet present on server and sync them
      try {
        const localSchools = localDb.getSchools();
        const serverIds = new Set(serverSchools.map((s) => s.id));
        const unsynced = localSchools.filter((s) => !serverIds.has(s.id) && s.id !== 'school-25-demo');
        if (unsynced.length > 0) {
          safeFetch('/api/schools/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schools: unsynced }),
          }).catch(() => {});
        }
      } catch (e) {
        // Ignore background sync errors
      }

      return serverSchools;
    }
    // Fallback to local storage
    return localDb.getSchools();
  },

  async searchSchools(query: string = '', region?: string): Promise<School[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (region && region !== 'all') params.append('region', region);

    const result = await safeFetch(`/api/schools/search?${params.toString()}`);
    if (result.ok && result.data?.schools) {
      return result.data.schools;
    }

    // Fallback search in local storage
    const all = localDb.getSchools();
    const q = query.trim().toLowerCase();
    const reg = (region || '').trim().toLowerCase();
    const cleanDigits = q.replace(/\D/g, '');

    return all.filter((s) => {
      if (reg && reg !== 'all' && !s.region.toLowerCase().includes(reg)) {
        return false;
      }
      if (!q) return true;

      const nameMatch = s.name.toLowerCase().includes(q);
      const regionMatch = s.region.toLowerCase().includes(q);
      const directorMatch = s.director.toLowerCase().includes(q);
      const numberMatch = s.number.toLowerCase() === q || (cleanDigits && s.number === cleanDigits);
      const codeMatch = s.code.toLowerCase().includes(q) || (cleanDigits && s.code.includes(cleanDigits));
      return nameMatch || regionMatch || directorMatch || numberMatch || codeMatch;
    });
  },

  async getSchool(id: string): Promise<School> {
    const result = await safeFetch(`/api/schools/${id}`);
    if (result.ok && result.data?.school) {
      return result.data.school;
    }
    return localDb.getSchool(id);
  },

  async getSchoolByCode(code: string): Promise<School> {
    const clean = code.trim();
    const result = await safeFetch(`/api/schools/by-code/${encodeURIComponent(clean)}`);
    if (result.ok && result.data?.school) {
      return result.data.school;
    }
    return localDb.getSchoolByCode(clean);
  },

  async createSchool(payload: {
    name: string;
    number: string;
    region: string;
    director: string;
    phone: string;
    login: string;
    password: string;
    description?: string;
    creationCode?: string;
  }): Promise<{ school: School; token: string; admin: AdminUser }> {
    const result = await safeFetch('/api/schools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (result.ok && result.data?.school) {
      this.setToken(result.data.token);
      return result.data;
    }

    // Fallback to local storage (e.g. inside HTML-to-APK or static hosting)
    const localResult = localDb.createSchool(payload);
    this.setToken(localResult.token);

    // Try syncing local creation to server in background if possible
    safeFetch('/api/schools/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schools: [localResult.school] }),
    }).catch(() => {});

    return localResult;
  },

  async updateSchool(
    schoolId: string,
    payload: Partial<{
      name: string;
      number: string;
      region: string;
      director: string;
      phone: string;
      description: string;
    }>
  ): Promise<School> {
    const token = this.getToken();
    const result = await safeFetch(`/api/schools/${schoolId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (result.ok && result.data?.school) {
      return result.data.school;
    }
    return localDb.updateSchool(schoolId, payload);
  },

  async regenerateCode(schoolId: string): Promise<string> {
    const token = this.getToken();
    const result = await safeFetch(`/api/schools/${schoolId}/regenerate-code`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (result.ok && result.data?.code) {
      return result.data.code;
    }
    return localDb.regenerateCode(schoolId);
  },

  async joinSchool(
    schoolId: string,
    payload: { code: string; userName: string; userPhone: string; role: string; userId: string }
  ): Promise<School> {
    const result = await safeFetch(`/api/schools/${schoolId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (result.ok && result.data?.school) {
      return result.data.school;
    }
    return localDb.joinSchool(schoolId, payload);
  },

  async getMembers(schoolId: string): Promise<SchoolMember[]> {
    const token = this.getToken();
    const result = await safeFetch(`/api/schools/${schoolId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (result.ok && result.data?.members) {
      return result.data.members;
    }
    return localDb.getMembers(schoolId);
  },

  async removeMember(schoolId: string, memberId: string): Promise<void> {
    const token = this.getToken();
    const result = await safeFetch(`/api/schools/${schoolId}/members/${memberId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!result.ok) {
      localDb.removeMember(schoolId, memberId);
    }
  },

  // News CRUD
  async getSchoolNews(schoolId: string): Promise<{ school: School; news: NewsItem[] }> {
    const result = await safeFetch(`/api/schools/${schoolId}/news`);
    if (result.ok && result.data?.news) {
      return { school: result.data.school, news: result.data.news };
    }
    return localDb.getSchoolNews(schoolId);
  },

  async createNews(
    schoolId: string,
    payload: {
      title: string;
      content: string;
      category: string;
      isImportant: boolean;
      images: string[];
      videoUrl?: string | null;
      videos?: string[];
      authorName?: string;
      authorRole?: string;
    }
  ): Promise<NewsItem> {
    const token = this.getToken();
    const result = await safeFetch(`/api/schools/${schoolId}/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (result.ok && result.data?.newsItem) {
      return result.data.newsItem;
    }
    return localDb.createNews(schoolId, payload);
  },

  async updateNews(
    schoolId: string,
    newsId: string,
    payload: Partial<{
      title: string;
      content: string;
      category: string;
      isImportant: boolean;
      images: string[];
      videoUrl: string | null;
      videos: string[];
    }>
  ): Promise<NewsItem> {
    const token = this.getToken();
    const result = await safeFetch(`/api/schools/${schoolId}/news/${newsId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (result.ok && result.data?.newsItem) {
      return result.data.newsItem;
    }
    return localDb.updateNews(schoolId, newsId, payload as any);
  },

  async deleteNews(schoolId: string, newsId: string): Promise<void> {
    const token = this.getToken();
    const result = await safeFetch(`/api/schools/${schoolId}/news/${newsId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!result.ok) {
      localDb.deleteNews(schoolId, newsId);
    }
  },

  // File Upload with Progress Tracking and Base64 Fallback
  async uploadFiles(
    files: File[],
    onProgress?: (percent: number) => void
  ): Promise<{ urls: string[]; files: Array<{ url: string; originalName: string; size: number; type?: 'video' | 'image' }> }> {
    try {
      // First attempt server upload
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }

      const res = await new Promise<{ urls: string[]; files: any[] }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload');

        const token = this.getToken();
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch {
              reject(new Error('Invalid response'));
            }
          } else {
            reject(new Error(`Server error ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });

      return res;
    } catch {
      // If server upload failed (offline or APK WebView), fall back to base64 Data URLs!
      return localDb.uploadFiles(files, onProgress);
    }
  },

  // Admin Auth
  async loginAdmin(login: string, password: string): Promise<{ token: string; school: School; admin: AdminUser }> {
    const result = await safeFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    });

    if (result.ok && result.data?.school) {
      this.setToken(result.data.token);
      return result.data;
    }

    // Fallback to localDb
    const localResult = localDb.loginAdmin(login, password);
    this.setToken(localResult.token);
    return localResult;
  },

  async getCurrentAdmin(): Promise<{ admin: AdminUser; school: School } | null> {
    const token = this.getToken();
    if (!token) return null;

    const result = await safeFetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (result.ok && result.data?.school) {
      return result.data;
    }

    return localDb.getCurrentAdmin();
  },

  async logoutAdmin(): Promise<void> {
    const token = this.getToken();
    if (token) {
      await safeFetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    this.clearToken();
  },

  // Notifications
  async getNotifications(schoolIds: string[]): Promise<AppNotification[]> {
    const query = schoolIds.length > 0 ? `?schools=${encodeURIComponent(schoolIds.join(','))}` : '';
    const result = await safeFetch(`/api/notifications${query}`);
    if (result.ok && result.data?.notifications) {
      return result.data.notifications;
    }
    return localDb.getNotifications(schoolIds);
  },
};
