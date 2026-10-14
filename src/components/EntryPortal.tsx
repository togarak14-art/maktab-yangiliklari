import React, { useState } from 'react';
import { School, AdminUser, UserProfile } from '../types';
import {
  GraduationCap,
  PlusCircle,
  Link as LinkIcon,
  School as SchoolIcon,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Users,
  Search,
  CheckCircle,
  Clock,
  Layers,
  LogIn,
} from 'lucide-react';

interface EntryPortalProps {
  onOpenCreateSchool: () => void;
  onOpenJoinSchool: (prefillCode?: string) => void;
  onSelectSchool: (school: School) => void;
  onOpenAdminLogin: () => void;
  connectedSchools: School[];
  availableSchools: School[];
  adminUser: AdminUser | null;
}

export const EntryPortal: React.FC<EntryPortalProps> = ({
  onOpenCreateSchool,
  onOpenJoinSchool,
  onSelectSchool,
  onOpenAdminLogin,
  connectedSchools,
  availableSchools,
  adminUser,
}) => {
  const [quickCode, setQuickCode] = useState('');

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickCode.trim()) {
      onOpenJoinSchool(quickCode.trim());
    } else {
      onOpenJoinSchool();
    }
  };

  return (
    <div className="py-6 sm:py-10 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="text-center space-y-3 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
          <GraduationCap className="w-4 h-4" />
          <span>O'zbekiston maktablari uchun yagona platforma</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          Maktab Yangiliklari
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Ilovadan foydalanish uchun quyidagi 2 ta bo'limdan birini tanlang: yangi maktab oching yoki mavjud maktabingiz kodi orqali unga qo'shiling.
        </p>
      </div>

      {/* The 2 Main Entry Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 px-4">
        {/* SECTION 1: MAKTAB YARATISH */}
        <div className="relative bg-white rounded-3xl border-2 border-blue-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
          <div className="p-6 sm:p-8 space-y-5">
            {/* Badge & Number */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                1-BO'LIM
              </span>
              <span className="text-xs text-slate-400 font-medium">Direktor va mas'ullar</span>
            </div>

            {/* Icon & Title */}
            <div className="space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <PlusCircle className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Maktab yaratish
              </h2>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                Yangi maktab profilini ochish
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed">
              Maktabingizni ro‘yxatdan o‘tkazing va takrorlanmaydigan maxsus ulanish kodi (masalan, <span className="font-mono font-bold text-blue-700">MK-482731</span>) oling.
            </p>

            {/* Features checkmarks */}
            <ul className="space-y-2.5 text-xs text-slate-600 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Har bir maktab uchun takrorlanmas maxsus ulanish kodi</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Yangi maktab ochilganda toza va bo‘sh profil</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Foto va video yangiliklarni erkin chop etish huquqi</span>
              </li>
            </ul>
          </div>

          {/* Action button */}
          <div className="p-6 sm:p-8 pt-0">
            <button
              onClick={onOpenCreateSchool}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:translate-y-[-1px]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Maktab yaratish</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* SECTION 2: QO'SHILISH */}
        <div className="relative bg-white rounded-3xl border-2 border-indigo-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
          <div className="p-6 sm:p-8 space-y-5">
            {/* Badge & Number */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                2-BO'LIM
              </span>
              <span className="text-xs text-slate-400 font-medium">O'quvchi va ota-onalar</span>
            </div>

            {/* Icon & Title */}
            <div className="space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                <LinkIcon className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Maktabga qo‘shilish
              </h2>
              <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">
                Kod orqali ulanish
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed">
              Maktab ma'muriyati taqdim etgan maxsus kodni kiriting va maktabingiz e'lonlari, tadbirlari va yutuqlarini doimiy kuzatib boring.
            </p>

            {/* Quick Code Input Box */}
            <form onSubmit={handleQuickJoin} className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Maktab kodini kiriting:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Masalan: MK-252525"
                  value={quickCode}
                  onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2.5 text-sm font-mono uppercase font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Ulanish
                </button>
              </div>
            </form>

            {/* Features checkmarks */}
            <ul className="space-y-2 text-xs text-slate-600 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bir nechta maktabga ulanish imkoniyati</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Foto va video yangiliklarni to'g'ridan-to'g'ri ko'rish</span>
              </li>
            </ul>
          </div>

          {/* Action button */}
          <div className="p-6 sm:p-8 pt-0">
            <button
              onClick={() => onOpenJoinSchool(quickCode)}
              className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:translate-y-[-1px]"
            >
              <LinkIcon className="w-5 h-5 text-indigo-300" />
              <span>Qo‘shilish</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Connected Schools Quick Navigation (if user is already connected) */}
      {connectedSchools.length > 0 && (
        <div className="mx-4 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SchoolIcon className="w-4 h-4 text-blue-600" />
              Siz ulangan maktablar ({connectedSchools.length}):
            </h3>
            <span className="text-xs text-slate-400">Tezkor o'tish</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {connectedSchools.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSchool(s)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="truncate pr-2">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 block truncate">
                    {s.name}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate block">
                    {s.region}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                    {s.code}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Administrator Login Link */}
      <div className="text-center pt-2">
        <button
          onClick={onOpenAdminLogin}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-700 underline cursor-pointer transition-colors"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Maktab administratori hisobingiz bormi? Tizimga kiring</span>
        </button>
      </div>
    </div>
  );
};
