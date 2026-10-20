import { School, NewsItem, SchoolMember, AppNotification, AdminUser, UserProfile } from '../types';

const STORAGE_KEY_SCHOOLS = 'maktab_local_schools';
const STORAGE_KEY_NEWS = 'maktab_local_news';
const STORAGE_KEY_MEMBERS = 'maktab_local_members';
const STORAGE_KEY_NOTIFICATIONS = 'maktab_local_notifications';
const STORAGE_KEY_CURRENT_ADMIN = 'maktab_local_current_admin';

// Helper to generate unique code MK-XXXXXX
function generateCode(existingCodes: Set<string>): string {
  let code = '';
  do {
    const num = Math.floor(100000 + Math.random() * 900000);
    code = `MK-${num}`;
  } while (existingCodes.has(code));
  return code;
}

// Initial demo data if empty
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEY_SCHOOLS)) {
    const demoSchool: School = {
      id: 'school-25-demo',
      name: "25-sonli umumiy o'rta ta'lim maktabi",
      number: "25",
      region: "Toshkent shahri, Chilonzor tumani",
      director: "Alisher Vohidov",
      phone: "+998 90 123 45 67",
      code: "MK-252525",
      adminLogin: "admin25",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Aniq va tabiiy fanlarga ixtisoslashtirilgan zamonaviy maktab",
      memberCount: 2,
      newsCount: 2,
    };
    localStorage.setItem(STORAGE_KEY_SCHOOLS, JSON.stringify([demoSchool]));

    const demoNews: NewsItem[] = [
      {
        id: 'news-demo-1',
        schoolId: 'school-25-demo',
        title: "Yangi o'quv yili uchun xalqaro robototexnika to'garagi ish boshladi",
        content: "Maktabimizda zamonaviy STEM laboratoriyasi negizida robototexnika va dasturlash to'garagi o'z faoliyatini boshladi. O'quvchilar xalqaro olimpiadalarga tayyorgarlik ko'rishmoqda. Darslar haftada uch marta malakali ustozlar tomonidan olib boriladi.",
        category: 'tadbir',
        isImportant: true,
        images: ['/src/assets/images/school_science_fair_1791986638263.jpg'],
        videoUrl: null,
        authorName: "Alisher Vohidov",
        authorRole: "Maktab direktori",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        viewsCount: 142,
      },
      {
        id: 'news-demo-2',
        schoolId: 'school-25-demo',
        title: "Maktabimiz jamoasi shahar fan olimpiadasida 1-o'rinni egalladi",
        content: "Chilonzor tumani bo'yicha o'tkazilgan fizika va matematika fanlari bellashuvida 10-sinf o'quvchilarimiz mutlaq g'oliblikni qo'lga kiritishdi. Barcha o'quvchilarimiz va ustozlarni ushbu yuksak natija bilan tabriklaymiz!",
        category: 'olimpiada',
        isImportant: false,
        images: ['/src/assets/images/modern_uzbek_school_1791986638152.jpg'],
        videoUrl: null,
        authorName: "Nodira Karimova",
        authorRole: "O'quv ishlari bo'yicha direktor o'rinbosari",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        viewsCount: 98,
      },
    ];
    localStorage.setItem(STORAGE_KEY_NEWS, JSON.stringify(demoNews));

    const demoMembers: SchoolMember[] = [
      {
        id: 'member-1',
        schoolId: 'school-25-demo',
        userId: 'user-sample-1',
        name: "Jasur Rahimov",
        phone: "+998 90 987 65 43",
        role: "student",
        joinedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'member-2',
        schoolId: 'school-25-demo',
        userId: 'user-sample-2',
        name: "Malika Yusupova",
        phone: "+998 93 555 44 33",
        role: "parent",
        joinedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(demoMembers));

    const demoNotifs: AppNotification[] = [
      {
        id: 'notif-1',
        schoolId: 'school-25-demo',
        schoolName: "25-sonli umumiy o'rta ta'lim maktabi",
        newsId: 'news-demo-1',
        title: "Robototexnika to'garagi ish boshladi",
        message: "STEM laboratoriyasida yangi to'garaklar ochildi.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(demoNotifs));
  }
}

function getStored<T>(key: string, def: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : def;
  } catch {
    return def;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage quota exceeded or error:', e);
  }
}

export const localDb = {
  init() {
    initStorage();
  },

  getSchools(): School[] {
    initStorage();
    const schools = getStored<School[]>(STORAGE_KEY_SCHOOLS, []);
    const news = getStored<NewsItem[]>(STORAGE_KEY_NEWS, []);
    const members = getStored<SchoolMember[]>(STORAGE_KEY_MEMBERS, []);

    return schools.map((s) => ({
      ...s,
      newsCount: news.filter((n) => n.schoolId === s.id).length,
      memberCount: members.filter((m) => m.schoolId === s.id).length,
    }));
  },

  getSchool(id: string): School {
    const schools = this.getSchools();
    const s = schools.find((x) => x.id === id);
    if (!s) throw new Error("Maktab topilmadi");
    return s;
  },

  getSchoolByCode(code: string): School {
    const raw = code.trim();
    const clean = raw.toUpperCase().replace(/\s+/g, '');
    const cleanAlphaNum = clean.replace(/[^A-Z0-9]/g, '');
    const cleanDigits = raw.replace(/\D/g, '');
    const schools = this.getSchools();

    let s = schools.find((x) => x.code.toUpperCase() === clean);
    if (!s && cleanAlphaNum) {
      s = schools.find((x) => x.code.toUpperCase().replace(/[^A-Z0-9]/g, '') === cleanAlphaNum);
    }
    if (!s && cleanDigits) {
      s = schools.find((x) => x.code.replace(/\D/g, '') === cleanDigits || x.number === cleanDigits);
    }
    if (!s) {
      const q = raw.toLowerCase();
      s = schools.find((x) => (x.number && x.number.toLowerCase() === q) || x.name.toLowerCase().includes(q));
    }
    if (!s) throw new Error(`"${code}" bo'yicha maktab topilmadi. Kod yoki maktab raqamini tekshirib qayta kiriting.`);
    return s;
  },

  createSchool(payload: {
    name: string;
    number: string;
    region: string;
    director: string;
    phone: string;
    login: string;
    password: string;
    description?: string;
    creationCode?: string;
  }): { school: School; token: string; admin: AdminUser } {
    if (payload.creationCode !== '201311') {
      throw new Error("Maktab yaratish uchun maxsus ruxsat kodi noto'g'ri.");
    }
    initStorage();
    const schools = getStored<any[]>(STORAGE_KEY_SCHOOLS, []);

    const existingLogin = schools.find(
      (s) => (s.adminLogin || '').toLowerCase() === payload.login.trim().toLowerCase()
    );
    if (existingLogin) {
      throw new Error("Bu login allaqachon band. Boshqa login tanlang.");
    }

    const existingCodes = new Set<string>(schools.map((s) => s.code));
    const newCode = generateCode(existingCodes);
    const newId = 'school-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    const newSchool: any = {
      id: newId,
      name: payload.name.trim(),
      number: (payload.number || '').trim(),
      region: payload.region.trim(),
      director: payload.director.trim(),
      phone: payload.phone.trim(),
      code: newCode,
      adminLogin: payload.login.trim(),
      password: payload.password.trim(),
      createdAt: new Date().toISOString(),
      description: payload.description ? payload.description.trim() : undefined,
      memberCount: 0,
      newsCount: 0,
    };

    schools.unshift(newSchool);
    setStored(STORAGE_KEY_SCHOOLS, schools);

    const admin: AdminUser = {
      login: newSchool.adminLogin,
      name: newSchool.director,
      schoolId: newId,
    };
    const token = 'local-token-' + Date.now();
    setStored(STORAGE_KEY_CURRENT_ADMIN, { admin, token });

    // CRITICAL: Guaranteed 0 news items for the newly created school!
    return { school: newSchool, token, admin };
  },

  updateSchool(schoolId: string, payload: Partial<School>): School {
    const schools = getStored<any[]>(STORAGE_KEY_SCHOOLS, []);
    const idx = schools.findIndex((s) => s.id === schoolId);
    if (idx === -1) throw new Error("Maktab topilmadi");

    schools[idx] = { ...schools[idx], ...payload };
    setStored(STORAGE_KEY_SCHOOLS, schools);
    return schools[idx];
  },

  regenerateCode(schoolId: string): string {
    const schools = getStored<any[]>(STORAGE_KEY_SCHOOLS, []);
    const idx = schools.findIndex((s) => s.id === schoolId);
    if (idx === -1) throw new Error("Maktab topilmadi");

    const existingCodes = new Set<string>(schools.map((s) => s.code));
    const newCode = generateCode(existingCodes);
    schools[idx].code = newCode;
    setStored(STORAGE_KEY_SCHOOLS, schools);
    return newCode;
  },

  joinSchool(schoolId: string, payload: {
    code: string;
    userName: string;
    userPhone: string;
    role: string;
    userId: string;
  }): School {
    const school = this.getSchool(schoolId);
    if (school.code.toUpperCase() !== payload.code.trim().toUpperCase()) {
      throw new Error("Kiritilgan ulanish kodi noto'g'ri.");
    }

    const members = getStored<SchoolMember[]>(STORAGE_KEY_MEMBERS, []);
    const exists = members.find(
      (m) => m.schoolId === schoolId && (m.userId === payload.userId || m.phone === payload.userPhone)
    );

    if (!exists) {
      members.unshift({
        id: 'member-' + Date.now(),
        schoolId,
        userId: payload.userId,
        name: payload.userName,
        phone: payload.userPhone,
        role: (payload.role as any) || 'student',
        joinedAt: new Date().toISOString(),
      });
      setStored(STORAGE_KEY_MEMBERS, members);
    }

    return school;
  },

  getMembers(schoolId: string): SchoolMember[] {
    const members = getStored<SchoolMember[]>(STORAGE_KEY_MEMBERS, []);
    return members.filter((m) => m.schoolId === schoolId);
  },

  removeMember(schoolId: string, memberId: string): void {
    const members = getStored<SchoolMember[]>(STORAGE_KEY_MEMBERS, []);
    const filtered = members.filter((m) => !(m.id === memberId && m.schoolId === schoolId));
    setStored(STORAGE_KEY_MEMBERS, filtered);
  },

  getSchoolNews(schoolId: string): { school: School; news: NewsItem[] } {
    const school = this.getSchool(schoolId);
    const allNews = getStored<NewsItem[]>(STORAGE_KEY_NEWS, []);
    const schoolNews = allNews
      .filter((n) => n.schoolId === schoolId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { school, news: schoolNews };
  },

  createNews(schoolId: string, payload: any): NewsItem {
    const school = this.getSchool(schoolId);
    const allNews = getStored<NewsItem[]>(STORAGE_KEY_NEWS, []);

    const newNews: NewsItem = {
      id: 'news-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      schoolId,
      title: payload.title.trim(),
      content: payload.content.trim(),
      category: payload.category || 'tadbir',
      isImportant: Boolean(payload.isImportant),
      images: payload.images || [],
      videoUrl: payload.videoUrl || null,
      videos: Array.isArray(payload.videos) ? payload.videos : payload.videoUrl ? [payload.videoUrl] : [],
      authorName: payload.authorName || school.director,
      authorRole: payload.authorRole || "Maktab ma'muriyati",
      createdAt: new Date().toISOString(),
      viewsCount: 1,
    };

    allNews.unshift(newNews);
    setStored(STORAGE_KEY_NEWS, allNews);

    if (newNews.isImportant) {
      const notifs = getStored<AppNotification[]>(STORAGE_KEY_NOTIFICATIONS, []);
      notifs.unshift({
        id: 'notif-' + Date.now(),
        schoolId,
        schoolName: school.name,
        newsId: newNews.id,
        title: newNews.title,
        message: newNews.content.slice(0, 120),
        createdAt: new Date().toISOString(),
      });
      setStored(STORAGE_KEY_NOTIFICATIONS, notifs);
    }

    return newNews;
  },

  updateNews(schoolId: string, newsId: string, payload: Partial<NewsItem>): NewsItem {
    const allNews = getStored<NewsItem[]>(STORAGE_KEY_NEWS, []);
    const idx = allNews.findIndex((n) => n.id === newsId && n.schoolId === schoolId);
    if (idx === -1) throw new Error("Yangilik topilmadi");

    allNews[idx] = { ...allNews[idx], ...payload, updatedAt: new Date().toISOString() };
    setStored(STORAGE_KEY_NEWS, allNews);
    return allNews[idx];
  },

  deleteNews(schoolId: string, newsId: string): void {
    const allNews = getStored<NewsItem[]>(STORAGE_KEY_NEWS, []);
    const filtered = allNews.filter((n) => !(n.id === newsId && n.schoolId === schoolId));
    setStored(STORAGE_KEY_NEWS, filtered);
  },

  async uploadFiles(
    files: File[],
    onProgress?: (percent: number) => void
  ): Promise<{ urls: string[]; files: Array<{ url: string; originalName: string; size: number; type: 'video' | 'image' }> }> {
    const results: Array<{ url: string; originalName: string; size: number; type: 'video' | 'image' }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo =
        (file.type && file.type.toLowerCase().startsWith('video/')) ||
        /\.(mp4|webm|mov|mkv|avi|3gp|m4v|ogg|ogv|ts)$/i.test(file.name);

      // Convert to base64 Data URL for standalone APK / client offline support
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      results.push({
        url: dataUrl,
        originalName: file.name,
        size: file.size,
        type: isVideo ? 'video' : 'image',
      });

      if (onProgress) {
        onProgress(Math.round(((i + 1) / files.length) * 100));
      }
    }

    return {
      urls: results.map((r) => r.url),
      files: results,
    };
  },

  loginAdmin(login: string, password: string): { token: string; school: School; admin: AdminUser } {
    initStorage();
    const schools = getStored<any[]>(STORAGE_KEY_SCHOOLS, []);
    const school = schools.find(
      (s) => (s.adminLogin || '').toLowerCase() === login.trim().toLowerCase()
    );

    if (!school) throw new Error("Login yoki parol noto'g'ri.");
    if (school.password && school.password !== password.trim()) {
      throw new Error("Login yoki parol noto'g'ri.");
    }

    const admin: AdminUser = {
      login: school.adminLogin,
      name: school.director,
      schoolId: school.id,
    };
    const token = 'local-token-' + Date.now();
    setStored(STORAGE_KEY_CURRENT_ADMIN, { admin, token });

    return { token, school, admin };
  },

  getCurrentAdmin(): { admin: AdminUser; school: School } | null {
    const current = getStored<any>(STORAGE_KEY_CURRENT_ADMIN, null);
    if (!current || !current.admin) return null;
    const schools = this.getSchools();
    const school = schools.find((s) => s.id === current.admin.schoolId);
    if (!school) return null;
    return { admin: current.admin, school };
  },

  logoutAdmin(): void {
    localStorage.removeItem(STORAGE_KEY_CURRENT_ADMIN);
  },

  getNotifications(schoolIds: string[]): AppNotification[] {
    const notifs = getStored<AppNotification[]>(STORAGE_KEY_NOTIFICATIONS, []);
    if (schoolIds.length === 0) return notifs.slice(0, 30);
    return notifs.filter((n) => schoolIds.includes(n.schoolId)).slice(0, 30);
  },
};
