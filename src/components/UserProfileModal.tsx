import React, { useState } from 'react';
import { UserProfile, School, AdminUser } from '../types';
import { api } from '../services/api';
import {
  X,
  User,
  Phone,
  School as SchoolIcon,
  Bell,
  Volume2,
  Trash2,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Save,
  Check,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  connectedSchools: School[];
  currentSchool: School | null;
  adminUser: AdminUser | null;
  onProfileUpdated: (updated: UserProfile) => void;
  onSelectSchool: (school: School) => void;
  onDisconnectSchool: (schoolId: string) => void;
  onAdminLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  connectedSchools,
  currentSchool,
  adminUser,
  onProfileUpdated,
  onSelectSchool,
  onDisconnectSchool,
  onAdminLogout,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [phone, setPhone] = useState(userProfile.phone);
  const [role, setRole] = useState(userProfile.role);
  const [notificationsEnabled, setNotificationsEnabled] = useState(userProfile.notificationsEnabled);
  const [soundEnabled, setSoundEnabled] = useState(userProfile.soundEnabled);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...userProfile,
      name: name.trim(),
      phone: phone.trim(),
      role,
      notificationsEnabled,
      soundEnabled,
    };
    api.saveUserProfile(updated);
    onProfileUpdated(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const requestBrowserNotification = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        alert("Brauzer bildirishnomalari muvaffaqiyatli yoqildi!");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-5 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg shrink-0">
              {name ? name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold">{name || 'Foydalanuvchi profili'}</h2>
              <p className="text-[11px] sm:text-xs text-blue-200">
                {role === 'student' ? "O'quvchi" : role === 'parent' ? "Ota-ona" : role === 'teacher' ? "O'qituvchi" : "Mehmon"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {savedNotice && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              Sozlamalar saqlandi!
            </div>
          )}

          {/* Admin status if logged in */}
          {adminUser && (
            <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-xs font-bold">{adminUser.name}</div>
                  <div className="text-[10px] text-slate-400">Admin login: {adminUser.login}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onAdminLogout}
                className="px-2.5 py-1 text-xs text-rose-300 hover:text-rose-100 hover:bg-white/10 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Chiqish
              </button>
            </div>
          )}

          {/* Personal info form */}
          <form onSubmit={handleSave} className="space-y-3.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Shaxsiy ma'lumotlar
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Ism-familiyangiz
              </label>
              <input
                type="text"
                placeholder="Masalan: Dilnoza Karimova"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                Telefon raqami
              </label>
              <input
                type="text"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Maqomingiz</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'student', label: "O'quvchi" },
                  { id: 'parent', label: "Ota-ona" },
                  { id: 'teacher', label: "O'qituvchi" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id as any)}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      role === item.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification settings */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Bildirishnomalar
              </h3>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-800">
                    Muhim yangiliklar bildirishnomalari
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-sm"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-semibold text-slate-800">
                    Ovozli xabarlar
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-sm"
                />
              </label>

              <button
                type="button"
                onClick={requestBrowserNotification}
                className="w-full text-center text-[11px] text-blue-600 hover:underline pt-1"
              >
                Brauzer bildirishnomalariga ruxsat berish
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Profilni saqlash
            </button>
          </form>

          {/* Connected Schools */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Ulangan maktablar ({connectedSchools.length})</span>
            </h3>

            {connectedSchools.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                Hali hech qanday maktabga ulanmagansiz.
              </p>
            ) : (
              <div className="space-y-2">
                {connectedSchools.map((s) => (
                  <div
                    key={s.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                      currentSchool?.id === s.id
                        ? 'border-blue-500 bg-blue-50/60'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="truncate flex-1">
                      <div className="font-semibold text-slate-900 truncate">{s.name}</div>
                      <div className="text-[10px] text-slate-500">
                        Kodi: <span className="font-mono font-bold text-blue-600">{s.code}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {currentSchool?.id !== s.id && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectSchool(s);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        >
                          O'tish
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDisconnectSchool(s.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="Ulanishni bekor qilish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
