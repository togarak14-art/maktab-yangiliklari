import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'maktab_db.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max for video/images
  },
  fileFilter: (_req, file, cb) => {
    const allowedMime = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-matroska',
    ];
    if (allowedMime.includes(file.mimetype) || file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error("Faqat rasm va video fayllar qo'llab-quvvatlanadi."));
    }
  },
});

// Database Interfaces
export interface School {
  id: string;
  name: string;
  number: string;
  region: string;
  director: string;
  phone: string;
  code: string;
  adminLogin: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  description?: string;
}

export interface SchoolMember {
  id: string;
  schoolId: string;
  userId: string;
  name: string;
  phone: string;
  role: 'student' | 'parent' | 'teacher' | 'other';
  joinedAt: string;
}

export interface NewsItem {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  category: 'tadbir' | 'sport' | 'olimpiada' | 'yutuq' | 'tatil' | 'dars_jadvali' | 'elon' | 'boshqa';
  isImportant: boolean;
  images: string[];
  videoUrl?: string | null;
  authorName: string;
  authorRole: string;
  createdAt: string;
  updatedAt?: string;
  viewsCount?: number;
}

export interface AppNotification {
  id: string;
  schoolId: string;
  schoolName: string;
  newsId: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface AdminSession {
  token: string;
  schoolId: string;
  adminLogin: string;
  directorName: string;
  createdAt: string;
}

interface DB {
  schools: School[];
  members: SchoolMember[];
  news: NewsItem[];
  notifications: AppNotification[];
  sessions: AdminSession[];
}

function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function generateSchoolCode(existingCodes: Set<string>): string {
  let code = '';
  do {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    code = `MK-${randomDigits}`;
  } while (existingCodes.has(code));
  return code;
}

function loadDB(): DB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(content);
      return {
        schools: data.schools || [],
        members: data.members || [],
        news: data.news || [],
        notifications: data.notifications || [],
        sessions: data.sessions || [],
      };
    }
  } catch (err) {
    console.error('Error loading DB file:', err);
  }

  // Pre-seed demo school "25-sonli ixtisoslashtirilgan maktab"
  const demoSalt = crypto.randomBytes(16).toString('hex');
  const demoSchool: School = {
    id: 'school-25-demo',
    name: "25-sonli umumiy o'rta ta'lim maktabi",
    number: "25",
    region: "Toshkent shahri, Chilonzor tumani",
    director: "Alisher Vohidov",
    phone: "+998 90 123 45 67",
    code: "MK-252525",
    adminLogin: "admin25",
    passwordHash: hashPassword("admin123", demoSalt),
    salt: demoSalt,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Aniq va tabiiy fanlarga ixtisoslashtirilgan zamonaviy maktab",
  };

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

  const initialDB: DB = {
    schools: [demoSchool],
    members: [
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
    ],
    news: demoNews,
    notifications: [
      {
        id: 'notif-1',
        schoolId: 'school-25-demo',
        schoolName: "25-sonli umumiy o'rta ta'lim maktabi",
        newsId: 'news-demo-1',
        title: "Robototexnika to'garagi ish boshladi",
        message: "Muhim e'lon: STEM laboratoriyasida yangi to'garaklar ochildi.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    sessions: [],
  };

  saveDB(initialDB);
  return initialDB;
}

function saveDB(db: DB): void {
  try {
    const tmp = DB_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tmp, DB_FILE);
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

let db = loadDB();

// Express app setup
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded media statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Auth Middleware
function authAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Avtorizatsiya talab qilinadi (token topilmadi)." });
  }
  const token = authHeader.substring(7);
  const session = db.sessions.find((s) => s.token === token);
  if (!session) {
    return res.status(401).json({ error: "Sessiya muddati tugagan yoki token noto'g'ri. Qayta kiring." });
  }
  (req as any).adminSession = session;
  next();
}

// Helper: Strip sensitive data
function sanitizeSchool(school: School) {
  const { passwordHash, salt, ...safe } = school;
  const memberCount = db.members.filter((m) => m.schoolId === school.id).length;
  const newsCount = db.news.filter((n) => n.schoolId === school.id).length;
  return {
    ...safe,
    memberCount,
    newsCount,
  };
}

// ================= API ROUTES =================

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// GET /api/schools - List all registered schools (public directory)
app.get('/api/schools', (_req, res) => {
  const safeSchools = db.schools.map(sanitizeSchool);
  res.json({ schools: safeSchools });
});

// GET /api/schools/:id - Single school info
app.get('/api/schools/:id', (req, res) => {
  const school = db.schools.find((s) => s.id === req.params.id);
  if (!school) {
    return res.status(404).json({ error: "Maktab topilmadi." });
  }
  res.json({ school: sanitizeSchool(school) });
});

// GET /api/schools/by-code/:code - Find school by unique join code
app.get('/api/schools/by-code/:code', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const school = db.schools.find((s) => s.code.toUpperCase() === code);
  if (!school) {
    return res.status(404).json({ error: `"${code}" kodli maktab topilmadi. Kodni tekshirib qayta kiriting.` });
  }
  res.json({ school: sanitizeSchool(school) });
});

// POST /api/schools - Create a brand new school
app.post('/api/schools', (req, res) => {
  const { name, number, region, director, phone, login, password, description } = req.body;

  if (!name || !region || !director || !phone || !login || !password) {
    return res.status(400).json({ error: "Iltimos, barcha majburiy maydonlarni to'ldiring." });
  }

  // Check login uniqueness across schools
  const existingLogin = db.schools.find(
    (s) => s.adminLogin.toLowerCase() === login.trim().toLowerCase()
  );
  if (existingLogin) {
    return res.status(400).json({ error: "Bu login allaqachon band. Boshqa login tanlang." });
  }

  // Generate unique code (MK-XXXXXX)
  const existingCodes = new Set(db.schools.map((s) => s.code));
  const code = generateSchoolCode(existingCodes);

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const newSchoolId = 'school-' + crypto.randomUUID();

  const newSchool: School = {
    id: newSchoolId,
    name: name.trim(),
    number: (number || '').trim(),
    region: region.trim(),
    director: director.trim(),
    phone: phone.trim(),
    code,
    adminLogin: login.trim(),
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
    description: description ? description.trim() : undefined,
  };

  db.schools.unshift(newSchool);

  // Authenticate creator immediately as administrator
  const token = crypto.randomBytes(32).toString('hex');
  const session: AdminSession = {
    token,
    schoolId: newSchoolId,
    adminLogin: newSchool.adminLogin,
    directorName: newSchool.director,
    createdAt: new Date().toISOString(),
  };
  db.sessions.push(session);

  saveDB(db);

  // CRITICAL: New school has exactly 0 news items in db.news!
  res.status(201).json({
    message: "Maktab muvaffaqiyatli ro'yxatdan o'tkazildi!",
    school: sanitizeSchool(newSchool),
    token,
    admin: {
      login: newSchool.adminLogin,
      name: newSchool.director,
      schoolId: newSchoolId,
    },
  });
});

// POST /api/auth/login - Admin login
app.post('/api/auth/login', (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({ error: "Login va parolni kiriting." });
  }

  const school = db.schools.find(
    (s) => s.adminLogin.toLowerCase() === login.trim().toLowerCase()
  );

  if (!school) {
    return res.status(401).json({ error: "Login yoki parol noto'g'ri." });
  }

  const hash = hashPassword(password, school.salt);
  if (hash !== school.passwordHash) {
    return res.status(401).json({ error: "Login yoki parol noto'g'ri." });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const session: AdminSession = {
    token,
    schoolId: school.id,
    adminLogin: school.adminLogin,
    directorName: school.director,
    createdAt: new Date().toISOString(),
  };
  db.sessions.push(session);
  saveDB(db);

  res.json({
    message: "Tizimga muvaffaqiyatli kirildi.",
    token,
    school: sanitizeSchool(school),
    admin: {
      login: school.adminLogin,
      name: school.director,
      schoolId: school.id,
    },
  });
});

// GET /api/auth/me - Verify admin token
app.get('/api/auth/me', authAdmin, (req, res) => {
  const session: AdminSession = (req as any).adminSession;
  const school = db.schools.find((s) => s.id === session.schoolId);
  if (!school) {
    return res.status(404).json({ error: "Bog'langan maktab topilmadi." });
  }
  res.json({
    admin: {
      login: session.adminLogin,
      name: session.directorName,
      schoolId: session.schoolId,
    },
    school: sanitizeSchool(school),
  });
});

// POST /api/auth/logout - Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    db.sessions = db.sessions.filter((s) => s.token !== token);
    saveDB(db);
  }
  res.json({ message: "Hisobdan chiqildi." });
});

// POST /api/schools/:id/regenerate-code - Regenerate code (admin only)
app.post('/api/schools/:id/regenerate-code', authAdmin, (req, res) => {
  const session: AdminSession = (req as any).adminSession;
  if (session.schoolId !== req.params.id) {
    return res.status(403).json({ error: "Siz faqat o'z maktabingiz kodini yangilashingiz mumkin." });
  }

  const school = db.schools.find((s) => s.id === req.params.id);
  if (!school) {
    return res.status(404).json({ error: "Maktab topilmadi." });
  }

  const existingCodes = new Set(db.schools.map((s) => s.code));
  const newCode = generateSchoolCode(existingCodes);
  school.code = newCode;
  saveDB(db);

  res.json({ message: "Yangi ulanish kodi muvaffaqiyatli yaratildi.", code: newCode });
});

// PUT /api/schools/:id - Update school info (admin only)
app.put('/api/schools/:id', authAdmin, (req, res) => {
  const session: AdminSession = (req as any).adminSession;
  if (session.schoolId !== req.params.id) {
    return res.status(403).json({ error: "Siz faqat o'z maktabingiz ma'lumotlarini o'zgartira olasiz." });
  }

  const school = db.schools.find((s) => s.id === req.params.id);
  if (!school) {
    return res.status(404).json({ error: "Maktab topilmadi." });
  }

  const { name, number, region, director, phone, description } = req.body;
  if (name) school.name = name.trim();
  if (number !== undefined) school.number = number.trim();
  if (region) school.region = region.trim();
  if (director) school.director = director.trim();
  if (phone) school.phone = phone.trim();
  if (description !== undefined) school.description = description.trim();

  saveDB(db);
  res.json({ message: "Maktab ma'lumotlari yangilandi.", school: sanitizeSchool(school) });
});

// POST /api/schools/:id/join - Join school with code
app.post('/api/schools/:id/join', (req, res) => {
  const { code, userName, userPhone, role, userId } = req.body;
  const school = db.schools.find((s) => s.id === req.params.id);
  if (!school) {
    return res.status(404).json({ error: "Maktab topilmadi." });
  }

  if (school.code.toUpperCase() !== (code || '').trim().toUpperCase()) {
    return res.status(400).json({ error: "Kiritilgan ulanish kodi noto'g'ri." });
  }

  const effectiveUserId = userId || 'user-' + crypto.randomUUID();
  // Check if already member
  const existing = db.members.find(
    (m) => m.schoolId === school.id && (m.userId === effectiveUserId || (m.phone && m.phone === userPhone))
  );

  if (!existing) {
    const newMember: SchoolMember = {
      id: 'member-' + crypto.randomUUID(),
      schoolId: school.id,
      userId: effectiveUserId,
      name: (userName || "O'quvchi / Ota-ona").trim(),
      phone: (userPhone || '').trim(),
      role: role || 'student',
      joinedAt: new Date().toISOString(),
    };
    db.members.unshift(newMember);
    saveDB(db);
  }

  res.json({
    message: `${school.name} maktabiga muvaffaqiyatli ulandingiz!`,
    school: sanitizeSchool(school),
    userId: effectiveUserId,
  });
});

// GET /api/schools/:id/members - List members (admin only)
app.get('/api/schools/:id/members', authAdmin, (req, res) => {
  const session: AdminSession = (req as any).adminSession;
  if (session.schoolId !== req.params.id) {
    return res.status(403).json({ error: "Ruxsat etilmagan." });
  }

  const members = db.members.filter((m) => m.schoolId === req.params.id);
  res.json({ members });
});

// DELETE /api/schools/:id/members/:memberId - Remove member (admin only)
app.delete('/api/schools/:id/members/:memberId', authAdmin, (req, res) => {
  const session: AdminSession = (req as any).adminSession;
  if (session.schoolId !== req.params.id) {
    return res.status(403).json({ error: "Ruxsat etilmagan." });
  }

  db.members = db.members.filter((m) => m.id !== req.params.memberId);
  saveDB(db);
  res.json({ message: "Foydalanuvchi maktab ro'yxatidan o'chirildi." });
});

// GET /api/schools/:id/news - Get news for a specific school (strictly isolated)
app.get('/api/schools/:id/news', (req, res) => {
  const schoolId = req.params.id;
  const school = db.schools.find((s) => s.id === schoolId);
  if (!school) {
    return res.status(404).json({ error: "Maktab topilmadi." });
  }

  // Filter strictly by this school's ID
  const schoolNews = db.news
    .filter((n) => n.schoolId === schoolId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    school: sanitizeSchool(school),
    news: schoolNews,
    total: schoolNews.length,
  });
});

// POST /api/schools/:id/news - Create news item (admin only)
app.post('/api/schools/:id/news', authAdmin, (req, res) => {
  const session: AdminSession = (req as any).adminSession;
  if (session.schoolId !== req.params.id) {
    return res.status(403).json({ error: "Siz faqat o'z maktabingiz uchun yangilik yarata olasiz." });
  }

  const school = db.schools.find((s) => s.id === req.params.id);
  if (!school) {
    return res.status(404).json({ error: "Maktab topilmadi." });
  }

  const { title, content, category, isImportant, images, videoUrl, authorName, authorRole } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Sarlavha va yangilik matni kiritilishi shart." });
  }

  const newNews: NewsItem = {
    id: 'news-' + crypto.randomUUID(),
    schoolId: school.id,
    title: title.trim(),
    content: content.trim(),
    category: category || 'tadbir',
    isImportant: Boolean(isImportant),
    images: Array.isArray(images) ? images : [],
    videoUrl: videoUrl ? videoUrl.trim() : null,
    authorName: (authorName || session.directorName || school.director).trim(),
    authorRole: (authorRole || "Maktab ma'muriyati").trim(),
    createdAt: new Date().toISOString(),
    viewsCount: 1,
  };

  db.news.unshift(newNews);

  // If marked as important, create a broadcast notification
  if (newNews.isImportant) {
    const notif: AppNotification = {
      id: 'notif-' + crypto.randomUUID(),
      schoolId: school.id,
      schoolName: school.name,
      newsId: newNews.id,
      title: newNews.title,
      message: newNews.content.slice(0, 120) + (newNews.content.length > 120 ? '...' : ''),
      createdAt: new Date().toISOString(),
    };
    db.notifications.unshift(notif);
  }

  saveDB(db);

  res.status(201).json({
    message: "Yangilik muvaffaqiyatli chop etildi!",
    newsItem: newNews,
  });
});

// PUT /api/schools/:id/news/:newsId - Edit news (admin only)
app.put('/api/schools/:id/news/:newsId', authAdmin, (req, res) => {
  const session: AdminSession = (req as any).adminSession;
  if (session.schoolId !== req.params.id) {
    return res.status(403).json({ error: "Ruxsat etilmagan." });
  }

  const newsItem = db.news.find((n) => n.id === req.params.newsId && n.schoolId === req.params.id);
  if (!newsItem) {
    return res.status(404).json({ error: "Yangilik topilmadi." });
  }

  const { title, content, category, isImportant, images, videoUrl } = req.body;
  if (title) newsItem.title = title.trim();
  if (content) newsItem.content = content.trim();
  if (category) newsItem.category = category;
  if (isImportant !== undefined) newsItem.isImportant = Boolean(isImportant);
  if (Array.isArray(images)) newsItem.images = images;
  if (videoUrl !== undefined) newsItem.videoUrl = videoUrl ? videoUrl.trim() : null;
  newsItem.updatedAt = new Date().toISOString();

  saveDB(db);
  res.json({ message: "Yangilik tahrirlandi.", newsItem });
});

// DELETE /api/schools/:id/news/:newsId - Delete news (admin only)
app.delete('/api/schools/:id/news/:newsId', authAdmin, (req, res) => {
  const session: AdminSession = (req as any).adminSession;
  if (session.schoolId !== req.params.id) {
    return res.status(403).json({ error: "Ruxsat etilmagan." });
  }

  const initialCount = db.news.length;
  db.news = db.news.filter((n) => !(n.id === req.params.newsId && n.schoolId === req.params.id));
  if (db.news.length === initialCount) {
    return res.status(404).json({ error: "Yangilik topilmadi." });
  }

  saveDB(db);
  res.json({ message: "Yangilik o'chirildi." });
});

// POST /api/upload - Upload images and video files
app.post('/api/upload', upload.array('files', 10), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "Hech qanday fayl tanlanmagan." });
    }

    const uploaded = files.map((file) => ({
      url: `/uploads/${file.filename}`,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      type: file.mimetype.startsWith('video/') ? 'video' : 'image',
    }));

    res.json({
      message: "Fayllar muvaffaqiyatli yuklandi.",
      files: uploaded,
      urls: uploaded.map((f) => f.url),
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || "Fayl yuklashda xatolik yuz berdi." });
  }
});

// GET /api/notifications - Get user notifications for subscribed schools
app.get('/api/notifications', (req, res) => {
  const schoolIds = req.query.schools ? (req.query.schools as string).split(',') : [];
  let notifs = db.notifications;
  if (schoolIds.length > 0) {
    notifs = notifs.filter((n) => schoolIds.includes(n.schoolId));
  }
  res.json({ notifications: notifs.slice(0, 30) });
});

// Vite Middleware & Static Production Serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  // API 404 fallback (always return JSON for api routes)
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: "Bunday API marshrut mavjud emas." });
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
