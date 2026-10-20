import React from 'react';
import { School, AdminUser, UserProfile, AppNotification } from '../types';
import {
  GraduationCap,
  PlusCircle,
  Link as LinkIcon,
  Bell,
  User,
  ShieldCheck,
  ChevronDown,
  School as SchoolIcon,
  LogOut,
  Sliders,
  Radio,
  Search,
} from 'lucide-react';

interface HeaderProps {
  currentSchool: School | null;
  connectedSchools: School[];
  allSchools?: School[];
  onSelectSchool: (school: School) => void;
  onOpenCreateSchool: () => void;
  onOpenJoinSchool: () => void;
  onOpenAdminPanel: () => void;
  onOpenAdminLogin: () => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onOpenPortal: () => void;
  isPortalActive: boolean;
  adminUser: AdminUser | null;
  userProfile: UserProfile;
  unreadCount: number;
  activeTab: 'news' | 'school_info' | 'members';
  onTabChange: (tab: 'news' | 'school_info' | 'members') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSchool,
  connectedSchools,
  allSchools = [],
  onSelectSchool,
  onOpenCreateSchool,
  onOpenJoinSchool,
  onOpenAdminPanel,
  onOpenAdminLogin,
  onOpenProfile,
  onOpenNotifications,
  onOpenPortal,
  isPortalActive,
  adminUser,
  userProfile,
  unreadCount,
  activeTab,
  onTabChange,
}) => {
  const [schoolMenuOpen, setSchoolMenuOpen] = React.useState(false);
  const [dropdownSearch, setDropdownSearch] = React.useState('');
  const isCurrentAdmin = adminUser && currentSchool && adminUser.schoolId === currentSchool.id;

  // Filter schools for dropdown
  const filteredDropdownSchools = React.useMemo(() => {
    const q = dropdownSearch.trim().toLowerCase();
    const source = q ? allSchools : (connectedSchools.length > 0 ? connectedSchools : allSchools);
    if (!q) return source;
    return allSchools.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.number && s.number.toLowerCase() === q)
    );
  }, [allSchools, connectedSchools, dropdownSearch]);

  return (
    <header
      className="w-full sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs"
      style={{ paddingTop: !currentSchool ? 'env(safe-area-inset-top, 0px)' : undefined }}
    >
      {/* Top Banner for School Context */}
      {currentSchool && (
        <div
          className="w-full bg-blue-900 text-white text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 overflow-hidden"
          style={{ paddingTop: 'calc(0.375rem + env(safe-area-inset-top, 0px))' }}
        >
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <SchoolIcon className="w-3.5 h-3.5 shrink-0 text-blue-300" />
            <span className="font-medium truncate">{currentSchool.name}</span>
            <span className="hidden sm:inline text-blue-300">·</span>
            <span className="hidden sm:inline text-blue-200">Kodi: <span className="font-mono font-bold tracking-wider bg-blue-800/80 px-1.5 py-0.5 rounded text-white">{currentSchool.code}</span></span>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-[10px] sm:text-[11px]">
            {isCurrentAdmin ? (
              <span className="flex items-center gap-1 text-emerald-300 font-medium whitespace-nowrap">
                <ShieldCheck className="w-3 h-3" />
                Admin
              </span>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="text-blue-200 hover:text-white underline cursor-pointer whitespace-nowrap"
              >
                Admin kirish
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Top Bar */}
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4 w-full">
          {/* Zone 1: Brand Wordmark */}
          <div
            onClick={onOpenPortal}
            className="flex items-center gap-2 sm:gap-3 shrink-0 cursor-pointer group min-w-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="hidden min-[460px]:block min-w-0">
              <span className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight truncate block group-hover:text-blue-700 transition-colors">
                Maktab Yangiliklari
              </span>
              <p className="text-[10px] text-slate-500 font-medium leading-none hidden sm:block">
                O'zbekiston maktablari rasmiy axborot portali
              </p>
            </div>
          </div>

          {/* School Selector Dropdown */}
          <div className="relative min-w-0 max-w-[135px] sm:max-w-[200px]">
            <button
              onClick={() => setSchoolMenuOpen(!schoolMenuOpen)}
              className="w-full flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-white text-xs font-medium text-slate-700 transition-colors"
            >
              <SchoolIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">
                {currentSchool ? currentSchool.name : 'Maktabni tanlang'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-auto" />
            </button>

            {schoolMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setSchoolMenuOpen(false)}
                />
                <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:left-0 sm:top-auto sm:mt-1.5 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  {/* Search input in dropdown */}
                  <div className="px-3 pb-2 pt-1">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Maktab nomi, raqami yoki kodi..."
                        value={dropdownSearch}
                        onChange={(e) => setDropdownSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>{dropdownSearch ? 'Qidiruv natijalari' : (connectedSchools.length > 0 ? 'Ulangan maktablar' : 'Mavjud maktablar')}</span>
                    <span className="text-[10px] text-slate-400">{filteredDropdownSchools.length} ta</span>
                  </div>

                  {filteredDropdownSchools.length === 0 ? (
                    <div className="px-3 py-4 text-xs text-slate-500 text-center">
                      «{dropdownSearch}» bo'yicha maktab topilmadi
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto">
                      {filteredDropdownSchools.map((school) => (
                        <button
                          key={school.id}
                          onClick={() => {
                            onSelectSchool(school);
                            setSchoolMenuOpen(false);
                            setDropdownSearch('');
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-blue-50 transition-colors cursor-pointer ${
                            currentSchool?.id === school.id ? 'bg-blue-50/80 font-semibold text-blue-700' : 'text-slate-700'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="truncate font-medium flex items-center gap-1.5">
                              {school.number && (
                                <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">
                                  {school.number}
                                </span>
                              )}
                              <span className="truncate">{school.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{school.region}</div>
                          </div>
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0">
                            {school.code}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setSchoolMenuOpen(false);
                        onOpenJoinSchool();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      Yangi maktabga ulanish (Kod bilan)
                    </button>
                    <button
                      onClick={() => {
                        setSchoolMenuOpen(false);
                        onOpenCreateSchool();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Yangi maktab ochish
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
            <button
              onClick={onOpenPortal}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                isPortalActive ? 'text-blue-600 bg-blue-50 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Bosh sahifa
            </button>
            {currentSchool && (
              <>
                <button
                  onClick={() => onTabChange('news')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    !isPortalActive && activeTab === 'news' ? 'text-blue-600 bg-blue-50 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Yangiliklar
                </button>
                <button
                  onClick={() => onTabChange('school_info')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    !isPortalActive && activeTab === 'school_info' ? 'text-blue-600 bg-blue-50 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Mening maktabim
                </button>
              </>
            )}
            <button
              onClick={onOpenJoinSchool}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
              Maktabga ulanish
            </button>
            <button
              onClick={onOpenCreateSchool}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              Maktab ochish
            </button>
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Admin Panel Button if admin */}
            {isCurrentAdmin && (
              <button
                onClick={onOpenAdminPanel}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                Admin paneli
              </button>
            )}

            {/* Notifications Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Bildirishnomalar"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-rose-600 rounded-full px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Profile Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Foydalanuvchi profili"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <span className="hidden md:inline font-medium max-w-[100px] truncate">
                {userProfile.name || 'Profil'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
