import { School, NewsItem, SchoolMember, AppNotification, AdminUser, UserProfile } from '../types';

const ADMIN_TOKEN_KEY = 'maktab_admin_token';
const USER_PROFILE_KEY = 'maktab_user_profile';

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
    const res = await fetch('/api/schools');
    if (!res.ok) throw new Error('Maktablar ro\'yxatini yuklab bo\'lmadi');
    const data = await res.json();
    return data.schools;
  },

  async getSchool(id: string): Promise<School> {
    const res = await fetch(`/api/schools/${id}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Maktab ma\'lumotlarini yuklab bo\'lmadi');
    }
    const data = await res.json();
    return data.school;
  },

  async getSchoolByCode(code: string): Promise<School> {
    const clean = code.trim().toUpperCase();
    const res = await fetch(`/api/schools/by-code/${encodeURIComponent(clean)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Bu kod bo\'yicha maktab topilmadi');
    }
    const data = await res.json();
    return data.school;
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
  }): Promise<{ school: School; token: string; admin: AdminUser }> {
    const res = await fetch('/api/schools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Maktab yaratishda xatolik yuz berdi');
    }
    this.setToken(data.token);
    return data;
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
    const res = await fetch(`/api/schools/${schoolId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Maktabni yangilashda xatolik yuz berdi');
    return data.school;
  },

  async regenerateCode(schoolId: string): Promise<string> {
    const token = this.getToken();
    const res = await fetch(`/api/schools/${schoolId}/regenerate-code`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Kodni yangilashda xatolik');
    return data.code;
  },

  async joinSchool(
    schoolId: string,
    payload: { code: string; userName: string; userPhone: string; role: string; userId: string }
  ): Promise<School> {
    const res = await fetch(`/api/schools/${schoolId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Maktabga ulanib bo\'lmadi');
    return data.school;
  },

  async getMembers(schoolId: string): Promise<SchoolMember[]> {
    const token = this.getToken();
    const res = await fetch(`/api/schools/${schoolId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'A\'zolarni yuklab bo\'lmadi');
    return data.members;
  },

  async removeMember(schoolId: string, memberId: string): Promise<void> {
    const token = this.getToken();
    const res = await fetch(`/api/schools/${schoolId}/members/${memberId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'A\'zoni o\'chirib bo\'lmadi');
    }
  },

  // News CRUD
  async getSchoolNews(schoolId: string): Promise<{ school: School; news: NewsItem[] }> {
    const res = await fetch(`/api/schools/${schoolId}/news`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Yangiliklarni yuklab bo\'lmadi');
    return { school: data.school, news: data.news };
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
      authorName?: string;
      authorRole?: string;
    }
  ): Promise<NewsItem> {
    const token = this.getToken();
    const res = await fetch(`/api/schools/${schoolId}/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Yangilik chop etishda xatolik');
    return data.newsItem;
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
    }>
  ): Promise<NewsItem> {
    const token = this.getToken();
    const res = await fetch(`/api/schools/${schoolId}/news/${newsId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Yangilikni tahrirlashda xatolik');
    return data.newsItem;
  },

  async deleteNews(schoolId: string, newsId: string): Promise<void> {
    const token = this.getToken();
    const res = await fetch(`/api/schools/${schoolId}/news/${newsId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Yangilikni o\'chirib bo\'lmadi');
    }
  },

  // File Upload with Progress Tracking
  uploadFiles(
    files: File[],
    onProgress?: (percent: number) => void
  ): Promise<{ urls: string[]; files: Array<{ url: string; originalName: string; size: number }> }> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }

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
          } catch (e) {
            reject(new Error('Server javobini o\'qishda xatolik'));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error || 'Yuklashda xatolik yuz berdi'));
          } catch (e) {
            reject(new Error(`Yuklashda xatolik (${xhr.status})`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Internet yoki server bilan aloqa uzildi. Qayta urinib ko\'ring.'));
      };

      xhr.send(formData);
    });
  },

  // Admin Auth
  async loginAdmin(login: string, password: string): Promise<{ token: string; school: School; admin: AdminUser }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Kirishda xatolik yuz berdi');
    this.setToken(data.token);
    return data;
  },

  async getCurrentAdmin(): Promise<{ admin: AdminUser; school: School } | null> {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        this.clearToken();
        return null;
      }
      return await res.json();
    } catch {
      return null;
    }
  },

  async logoutAdmin(): Promise<void> {
    const token = this.getToken();
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    this.clearToken();
  },

  // Notifications
  async getNotifications(schoolIds: string[]): Promise<AppNotification[]> {
    const query = schoolIds.length > 0 ? `?schools=${encodeURIComponent(schoolIds.join(','))}` : '';
    const res = await fetch(`/api/notifications${query}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.notifications || [];
  },
};
