import React, { useState, useEffect } from 'react';
import { School, AdminUser, SchoolMember, NewsItem } from '../types';
import { api } from '../services/api';
import {
  X,
  ShieldCheck,
  PlusCircle,
  RefreshCw,
  Copy,
  Check,
  Edit2,
  Trash2,
  Users,
  Settings,
  FileText,
  School as SchoolIcon,
  Phone,
  User,
  AlertTriangle,
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  adminUser: AdminUser;
  newsList: NewsItem[];
  onOpenCreateNews: () => void;
  onEditNews: (news: NewsItem) => void;
  onDeleteNews: (newsId: string) => void;
  onSchoolUpdated: (updated: School) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  school,
  adminUser,
  newsList,
  onOpenCreateNews,
  onEditNews,
  onDeleteNews,
  onSchoolUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'news' | 'members' | 'school_settings'>('news');
  const [members, setMembers] = useState<SchoolMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // School edit state
  const [schoolName, setSchoolName] = useState(school.name);
  const [schoolNumber, setSchoolNumber] = useState(school.number || '');
  const [director, setDirector] = useState(school.director);
  const [phone, setPhone] = useState(school.phone);
  const [region, setRegion] = useState(school.region);
  const [description, setDescription] = useState(school.description || '');
  const [updatingSchool, setUpdatingSchool] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  // Code refresh
  const [currentCode, setCurrentCode] = useState(school.code);
  const [copiedCode, setCopiedCode] = useState(false);
  const [regeneratingCode, setRegeneratingCode] = useState(false);

  // Load members on tab change
  useEffect(() => {
    if (activeTab === 'members' && isOpen) {
      loadMembers();
    }
  }, [activeTab, isOpen]);

  if (!isOpen) return null;

  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      const data = await api.getMembers(school.id);
      setMembers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegenerateCode = async () => {
    if (!window.confirm("Haqiqatan ham maktab ulanish kodini yangilamoqchimisiz? Eski kod orqali yangi a'zolar ulana olmaydi.")) {
      return;
    }
    setRegeneratingCode(true);
    try {
      const newCode = await api.regenerateCode(school.id);
      setCurrentCode(newCode);
      onSchoolUpdated({ ...school, code: newCode });
    } catch (err: any) {
      alert(err.message || "Kodni yangilashda xatolik");
    } finally {
      setRegeneratingCode(false);
    }
  };

  const handleUpdateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingSchool(true);
    setUpdateMsg(null);
    try {
      const updated = await api.updateSchool(school.id, {
        name: schoolName.trim(),
        number: schoolNumber.trim(),
        director: director.trim(),
        phone: phone.trim(),
        region: region.trim(),
        description: description.trim(),
      });
      onSchoolUpdated(updated);
      setUpdateMsg("Maktab ma'lumotlari muvaffaqiyatli saqlandi!");
      setTimeout(() => setUpdateMsg(null), 3000);
    } catch (err: any) {
      setUpdateMsg("Xatolik: " + (err.message || "Saqlanmadi"));
    } finally {
      setUpdatingSchool(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm("Ushbu foydalanuvchini maktab ro'yxatidan o'chirmoqchimisiz?")) return;
    try {
      await api.removeMember(school.id, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (e: any) {
      alert(e.message || "O'chirishda xatolik");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="bg-slate-900 px-4 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold truncate">Administrator Paneli</h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                {school.name} · Mas'ul: {adminUser.name} ({adminUser.login})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Bar */}
        <div className="bg-blue-50 border-b border-blue-200 px-4 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-900">Ulanish kodi:</span>
            <span className="font-mono text-sm sm:text-base font-extrabold text-blue-700 bg-white px-2.5 py-0.5 rounded-lg border border-blue-200">
              {currentCode}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-white border border-blue-300 hover:bg-blue-100/50 text-blue-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? "Nusxalandi" : "Nusxalash"}
            </button>
            <button
              onClick={handleRegenerateCode}
              disabled={regeneratingCode}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              title="Kodni yangilash"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regeneratingCode ? 'animate-spin' : ''}`} />
              <span className="hidden min-[400px]:inline">Kodni yangilash</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-slate-200 px-2 sm:px-6 bg-slate-50 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('news')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'news'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Yangiliklar ({newsList.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'members'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Ulangan a'zolar
          </button>
          <button
            onClick={() => setActiveTab('school_settings')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'school_settings'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            Maktab ma'lumotlari
          </button>
        </div>

        {/* Body content based on tab */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'news' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Maktab yangiliklari ro'yxati</h3>
                  <p className="text-xs text-slate-500">Yangiliklarni tahrirlang yoki yangi e'lon qo'shing</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenCreateNews();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Yangi yangilik joylash
                </button>
              </div>

              {newsList.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl p-6">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Hozircha hech qanday yangilik joylanmagan</p>
                  <p className="text-xs text-slate-500 mb-4">Birinchi yangilikni e'lon qilib o'quvchilar va ota-onalarni xabardor qiling.</p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreateNews();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 cursor-pointer"
                  >
                    Birinchi yangilikni joylash
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {newsList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-200 bg-white flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="truncate flex-1">
                        <div className="flex items-center gap-2">
                          {item.isImportant && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              MUHIM
                            </span>
                          )}
                          <span className="font-semibold text-slate-900 text-sm truncate">{item.title}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{item.content}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span>{new Date(item.createdAt).toLocaleDateString('uz-UZ')}</span>
                          {item.images.length > 0 && <span>· {item.images.length} ta rasm</span>}
                          {(item.videoUrl || (item.videos && item.videos.length > 0)) && (
                            <span className="text-purple-600 font-semibold">· Video mavjud</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            onClose();
                            onEditNews(item);
                          }}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Haqiqatan ham ushbu yangilikni o'chirmoqchimisiz?")) {
                              onDeleteNews(item.id);
                            }
                          }}
                          className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ulangan o'quvchilar va ota-onalar</h3>
                  <p className="text-xs text-slate-500">
                    Maktab kodi ({currentCode}) orqali bog'langan a'zolar
                  </p>
                </div>
                <button
                  onClick={loadMembers}
                  className="p-2 text-slate-500 hover:text-slate-800 rounded-lg"
                  title="Yangilash"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingMembers ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loadingMembers ? (
                <div className="text-center py-8 text-xs text-slate-500">Yuklanmoqda...</div>
              ) : members.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl p-6">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Hozircha a'zolar ulanmagan</p>
                  <p className="text-xs text-slate-500">
                    O'quvchilar va ota-onalarga <span className="font-mono font-bold text-blue-600">{currentCode}</span> kodini bering.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {members.map((m) => (
                    <div key={m.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="font-semibold text-xs text-slate-900">{m.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {m.phone || "Telefon ko'rsatilmagan"} · {m.role === 'student' ? "O'quvchi" : m.role === 'parent' ? "Ota-ona" : "O'qituvchi"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">
                          {new Date(m.joinedAt).toLocaleDateString('uz-UZ')}
                        </span>
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Ro'yxatdan chiqarish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'school_settings' && (
            <form onSubmit={handleUpdateSchool} className="space-y-4">
              {updateMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                  {updateMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Maktab nomi</label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Maktab raqami</label>
                  <input
                    type="text"
                    value={schoolNumber}
                    onChange={(e) => setSchoolNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Viloyat / Shahar</label>
                  <input
                    type="text"
                    required
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Direktor F.I.Sh.</label>
                  <input
                    type="text"
                    required
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Telefon raqami</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tavsif</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updatingSchool}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {updatingSchool ? "Saqlanmoqda..." : "Ma'lumotlarni yangilash"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
