import React, { useState } from 'react';
import { School, UserProfile } from '../types';
import { api } from '../services/api';
import {
  X,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  School as SchoolIcon,
  Search,
  User,
  Phone,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface JoinSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSchoolJoined: (school: School, updatedProfile: UserProfile) => void;
  availableSchools: School[];
  initialCode?: string;
}

export const JoinSchoolModal: React.FC<JoinSchoolModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSchoolJoined,
  availableSchools,
  initialCode = '',
}) => {
  const [code, setCode] = useState(initialCode);
  const [checking, setChecking] = useState(false);
  const [foundSchool, setFoundSchool] = useState<School | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode, isOpen]);

  const [userName, setUserName] = useState(userProfile.name || '');
  const [userPhone, setUserPhone] = useState(userProfile.phone || '+998 ');
  const [role, setRole] = useState<'student' | 'parent' | 'teacher'>('student');

  const [joining, setJoining] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCheckCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setFoundSchool(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError("Iltimos, maktab ulanish kodini kiriting.");
      return;
    }

    setChecking(true);
    try {
      const school = await api.getSchoolByCode(cleanCode);
      setFoundSchool(school);
    } catch (err: any) {
      setError(err.message || "Bunday kodli maktab topilmadi. Kodni qayta tekshiring.");
    } finally {
      setChecking(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundSchool) return;

    if (!userName.trim()) {
      setError("Ism-familiyangizni kiriting.");
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const joinedSchool = await api.joinSchool(foundSchool.id, {
        code: foundSchool.code,
        userName: userName.trim(),
        userPhone: userPhone.trim(),
        role,
        userId: userProfile.id,
      });

      // Update user profile in local state
      const updatedConnected = Array.from(
        new Set([...userProfile.connectedSchoolIds, joinedSchool.id])
      );
      const updatedProfile: UserProfile = {
        ...userProfile,
        name: userName.trim(),
        phone: userPhone.trim(),
        role,
        connectedSchoolIds: updatedConnected,
      };

      api.saveUserProfile(updatedProfile);
      setSuccess(true);

      setTimeout(() => {
        onSchoolJoined(joinedSchool, updatedProfile);
        onClose();
        // Reset state
        setSuccess(false);
        setFoundSchool(null);
        setCode('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Maktabga ulanishda xatolik yuz berdi.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Maktabga ulanish</h2>
              <p className="text-[11px] sm:text-xs text-blue-100">
                Maktab ma'muriyati bergan maxsus kodni kiriting
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Muvaffaqiyatli ulandingiz!</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                {foundSchool?.name} yangiliklar lentasi ochilmoqda...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Code / Name input form */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Maktab kodi yoki raqami (Masalan: MK-560465 yoki 40)
                </label>
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    placeholder="Masalan: 40 yoki MK-560465"
                    value={code}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCode(val);
                      setError(null);
                      // Auto-check if exact code matches
                      const exact = availableSchools.find(
                        (s) => s.code.toUpperCase() === val.trim().toUpperCase()
                      );
                      if (exact) {
                        setFoundSchool(exact);
                      }
                    }}
                    className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 text-sm sm:text-base font-mono uppercase font-bold border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => handleCheckCode()}
                    disabled={checking || !code.trim()}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {checking ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    Tekshirish
                  </button>
                </div>
              </div>

              {/* Live search matching suggestions or all available schools */}
              {!foundSchool && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <span>
                      {code.trim()
                        ? `Mos keluvchi maktablar (${
                            availableSchools.filter((s) => {
                              const q = code.trim().toLowerCase();
                              return (
                                s.name.toLowerCase().includes(q) ||
                                s.code.toLowerCase().includes(q) ||
                                s.region.toLowerCase().includes(q) ||
                                (s.number && s.number.toLowerCase() === q)
                              );
                            }).length
                          }):`
                        : `Mavjud maktablar (${availableSchools.length}):`}
                    </span>
                    <span className="text-slate-400 font-normal">Tanlash uchun bosing</span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {availableSchools
                      .filter((s) => {
                        if (!code.trim()) return true;
                        const q = code.trim().toLowerCase();
                        const cleanDigits = q.replace(/\D/g, '');
                        return (
                          s.name.toLowerCase().includes(q) ||
                          s.code.toLowerCase().includes(q) ||
                          s.region.toLowerCase().includes(q) ||
                          (s.number && (s.number.toLowerCase() === q || (cleanDigits && s.number === cleanDigits))) ||
                          (cleanDigits && s.code.includes(cleanDigits))
                        );
                      })
                      .map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setCode(s.code);
                            setFoundSchool(s);
                            setError(null);
                          }}
                          className="w-full text-left p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/70 flex items-center justify-between text-xs transition-all cursor-pointer shadow-xs group"
                        >
                          <div className="truncate pr-2">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800 group-hover:text-blue-700">
                              {s.number && (
                                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded text-[10px]">
                                  {s.number}-maktab
                                </span>
                              )}
                              <span className="truncate">{s.name}</span>
                            </div>
                            <span className="text-slate-400 block text-[10px] truncate mt-0.5">
                              {s.region}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-lg border border-blue-200 shrink-0">
                            {s.code}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* School Preview and confirmation */}
              {foundSchool && (
                <form onSubmit={handleJoin} className="space-y-4 pt-2 border-t border-slate-200 animate-in fade-in duration-200">
                  <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                      <SchoolIcon className="w-4 h-4 text-blue-600" />
                      {foundSchool.name}
                    </div>
                    <div className="text-xs text-slate-600">
                      Joylashuvi: <span className="font-medium text-slate-800">{foundSchool.region}</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Direktor: <span className="font-medium text-slate-800">{foundSchool.director}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        Sizning ism-familiyangiz *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Masalan: Sardor Ergashev"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        Telefon raqamingiz
                      </label>
                      <input
                        type="text"
                        placeholder="+998 90 123 45 67"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Maktabdagi maqomingiz:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'student', label: "O'quvchi" },
                          { id: 'parent', label: "Ota-ona" },
                          { id: 'teacher', label: "O'qituvchi" },
                        ].map((item) => (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => setRole(item.id as any)}
                            className={`py-2 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
                              role === item.id
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2 text-[11px] text-slate-500">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>Ulanish kodi faqat yangiliklarni ko'rish va bildirishnomalarni olish imkonini beradi.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={joining}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {joining ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                    {joining ? "Ulanmoqda..." : "Maktabga ulanish"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
