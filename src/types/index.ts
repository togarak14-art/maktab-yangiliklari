export type NewsCategory =
  | 'tadbir'
  | 'sport'
  | 'olimpiada'
  | 'yutuq'
  | 'tatil'
  | 'dars_jadvali'
  | 'elon'
  | 'boshqa';

export interface School {
  id: string;
  name: string;
  number: string;
  region: string;
  director: string;
  phone: string;
  code: string;
  adminLogin: string;
  createdAt: string;
  description?: string;
  memberCount: number;
  newsCount: number;
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
  category: NewsCategory;
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
  read?: boolean;
}

export interface AdminUser {
  login: string;
  name: string;
  schoolId: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: 'student' | 'parent' | 'teacher' | 'guest';
  connectedSchoolIds: string[];
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export const CATEGORY_LABELS: Record<NewsCategory, string> = {
  tadbir: 'Maktab tadbirlari',
  sport: 'Sport musobaqalari',
  olimpiada: 'Fan olimpiadalari',
  yutuq: "O'quvchilar yutuqlari",
  tatil: "Ta'til va bayramlar",
  dars_jadvali: "Dars jadvalidagi o'zgarishlar",
  elon: "Muhim e'lonlar",
  boshqa: "Boshqa voqealar",
};
