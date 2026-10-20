import React, { useState, useMemo } from 'react';
import { School, AdminUser } from '../types';
import {
  GraduationCap,
  PlusCircle,
  Link as LinkIcon,
  School as SchoolIcon,
  ArrowRight,
  Sparkles,
  Users,
  Search,
  CheckCircle,
  LogIn,
  MapPin,
  Newspaper,
  Copy,
  Check,
  Building2,
  X,
  Filter,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Extract unique regions for filter
  const regions = useMemo(() => {
    const set = new Set<string>();
    availableSchools.forEach((s) => {
      if (s.region) {
        const primary = s.region.split(',')[0].trim();
        if (primary) set.add(primary);
      }
    });
    return Array.from(set);
  }, [availableSchools]);

  // Filtered schools matching search
  const filteredSchools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const cleanDigits = q.replace(/\D/g, '');
    const cleanAlphaNum = q.replace(/[^a-z0-9]/g, '');

    return availableSchools.filter((s) => {
      // Region filter
      if (selectedRegion !== 'all' && !s.region.toLowerCase().includes(selectedRegion.toLowerCase())) {
        return false;
      }

      if (!q) return true;

      const sName = s.name.toLowerCase();
      const sRegion = s.region.toLowerCase();
      const sDirector = (s.director || '').toLowerCase();
      const sNumber = (s.number || '').toLowerCase();
      const sCode = s.code.toLowerCase();
      const sCodeClean = sCode.replace(/[^a-z0-9]/g, '');

      return (
        sName.includes(q) ||
        sRegion.includes(q) ||
        sDirector.includes(q) ||
        (sNumber && (sNumber === q || (cleanDigits && sNumber === cleanDigits))) ||
        sCode.includes(q) ||
        (cleanAlphaNum && sCodeClean.includes(cleanAlphaNum)) ||
        (cleanDigits && sCode.includes(cleanDigits))
      );
    });
  }, [availableSchools, searchQuery, selectedRegion]);

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickCode.trim()) {
      onOpenJoinSchool(quickCode.trim());
    } else {
      onOpenJoinSchool();
    }
  };

  const handleCopyCode = async (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="py-4 sm:py-8 max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="text-center space-y-2 sm:space-y-3 px-2 sm:px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-1">
          <GraduationCap className="w-4 h-4 shrink-0" />
          <span className="truncate">O'zbekiston maktablari uchun yagona platforma</span>
        </div>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          Maktab Yangiliklari
        </h1>
        <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Ilovadan foydalanish uchun yangi maktab oching, maktabingizni qidirib toping yoki maxsus kodi orqali unga ulaning.
        </p>
      </div>

      {/* QUICK LIVE SEARCH BAR FOR SCHOOLS (Fixes: "boshqa odam qidirsa men ochgan yangi maktab unda chiqmayapti") */}
      <div className="mx-0 sm:mx-4 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-4 sm:p-7 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-300" />
              <h2 className="text-base sm:text-xl font-bold tracking-tight">
                Maktabni qidirish
              </h2>
              <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full font-medium">
                {availableSchools.length} ta maktab
              </span>
            </div>
            <p className="text-xs text-blue-200 leading-relaxed">
              Maktab nomi, raqami (masalan, <span className="font-bold underline text-white">40</span>), viloyati yoki kodi bo'yicha qidiring:
            </p>
          </div>
        </div>

        {/* Search input with live clear */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5 text-blue-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Maktab raqami (40, 25), nomi, tumani yoki kodi (MK-560465)..."
            className="w-full pl-11 pr-10 py-3 sm:py-3.5 bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base rounded-2xl shadow-inner focus:outline-hidden focus:ring-4 focus:ring-blue-400/50 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Region filter chips */}
        {regions.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setSelectedRegion('all')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer font-medium ${
                selectedRegion === 'all'
                  ? 'bg-white text-blue-900 font-bold shadow-xs'
                  : 'bg-white/10 text-blue-100 hover:bg-white/20'
              }`}
            >
              Barcha hududlar
            </button>
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg === selectedRegion ? 'all' : reg)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer font-medium ${
                  selectedRegion === reg
                    ? 'bg-white text-blue-900 font-bold shadow-xs'
                    : 'bg-white/10 text-blue-100 hover:bg-white/20'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        )}

        {/* Live Search Results List */}
        <div className="pt-2">
          {filteredSchools.length === 0 ? (
            <div className="bg-white/10 rounded-2xl p-6 text-center space-y-2">
              <Building2 className="w-8 h-8 text-blue-300 mx-auto opacity-70" />
              <p className="text-sm font-semibold text-white">
                «{searchQuery}» bo'yicha maktab topilmadi
              </p>
              <p className="text-xs text-blue-200">
                Maktab raqamini tekshiring yoki yangi maktab ochish uchun quyidagi 1-bo'limdan foydalaning.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredSchools.map((s) => (
                <div
                  key={s.id}
                  className="bg-white text-slate-900 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all border border-blue-100 flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {s.number ? (
                          <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {s.number}
                          </span>
                        ) : (
                          <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <SchoolIcon className="w-4 h-4" />
                          </span>
                        )}
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                            {s.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 line-clamp-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{s.region}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats & Code */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Newspaper className="w-3.5 h-3.5 text-blue-500" />
                          <b>{s.newsCount || 0}</b> yangilik
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-indigo-500" />
                          <b>{s.memberCount || 0}</b> a'zo
                        </span>
                      </div>

                      {/* Code badge with copy */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyCode(s.code, e)}
                        title="Kodni nusxalash"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono text-[11px] font-bold border border-blue-200 cursor-pointer transition-colors"
                      >
                        {copiedCode === s.code ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 text-[10px]">Ko'chirildi!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-blue-500" />
                            <span>{s.code}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-3 mt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onSelectSchool(s)}
                      className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Newspaper className="w-3.5 h-3.5" />
                      <span>Yangiliklar</span>
                      <ArrowRight className="w-3 h-3 ml-0.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenJoinSchool(s.code)}
                      className="py-2 px-3 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Qo'shilish</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* The 2 Main Entry Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 px-0 sm:px-4">
        {/* SECTION 1: MAKTAB YARATISH */}
        <div className="relative bg-white rounded-3xl border-2 border-blue-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
          <div className="p-4 sm:p-8 space-y-4 sm:space-y-5">
            {/* Badge & Number */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                1-BO'LIM
              </span>
              <span className="text-xs text-slate-400 font-medium">Direktor va mas'ullar</span>
            </div>

            {/* Icon & Title */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <PlusCircle className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Maktab yaratish
              </h2>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                Yangi maktab profilini ochish
              </p>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Maktabingizni ro‘yxatdan o‘tkazing va takrorlanmaydigan maxsus ulanish kodi (masalan, <span className="font-mono font-bold text-blue-700">MK-560465</span>) oling.
            </p>

            {/* Features checkmarks */}
            <ul className="space-y-2 text-xs text-slate-600 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Har bir maktab uchun takrorlanmas maxsus ulanish kodi</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Yangi ochilgan maktab barcha foydalanuvchilarga qidiruvda ko'rinadi</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Foto va video yangiliklarni erkin chop etish huquqi</span>
              </li>
            </ul>
          </div>

          {/* Action button */}
          <div className="p-4 sm:p-8 pt-0">
            <button
              onClick={onOpenCreateSchool}
              className="w-full py-3.5 sm:py-4 px-4 sm:px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:translate-y-[-1px]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Maktab yaratish</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* SECTION 2: QO'SHILISH */}
        <div className="relative bg-white rounded-3xl border-2 border-indigo-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
          <div className="p-4 sm:p-8 space-y-4 sm:space-y-5">
            {/* Badge & Number */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                2-BO'LIM
              </span>
              <span className="text-xs text-slate-400 font-medium">O'quvchi va ota-onalar</span>
            </div>

            {/* Icon & Title */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                <LinkIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Maktabga qo‘shilish
              </h2>
              <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">
                Kod yoki nom orqali ulanish
              </p>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Maktab ma'muriyati taqdim etgan kodni yoki maktab raqamini kiriting va maktab yangiliklarini doimiy kuzatib boring.
            </p>

            {/* Quick Code Input Box */}
            <form onSubmit={handleQuickJoin} className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Maktab kodi yoki raqami:
              </label>
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  placeholder="Masalan: 40 yoki MK-560465"
                  value={quickCode}
                  onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                  className="flex-1 min-w-0 px-3 py-2.5 text-xs sm:text-sm font-mono uppercase font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
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
          <div className="p-4 sm:p-8 pt-0">
            <button
              onClick={() => onOpenJoinSchool(quickCode)}
              className="w-full py-3.5 sm:py-4 px-4 sm:px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:translate-y-[-1px]"
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
        <div className="mx-0 sm:mx-4 p-4 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <SchoolIcon className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Siz ulangan maktablar ({connectedSchools.length}):</span>
            </h3>
            <span className="text-[11px] text-slate-400">Tezkor o'tish</span>
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
