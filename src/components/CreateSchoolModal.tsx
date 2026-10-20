import React, { useState } from 'react';
import { School, AdminUser } from '../types';
import { api } from '../services/api';
import {
  X,
  School as SchoolIcon,
  CheckCircle,
  Copy,
  Check,
  Share2,
  Lock,
  User,
  Phone,
  MapPin,
  FileText,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
} from 'lucide-react';

interface CreateSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchoolCreated: (school: School, admin: AdminUser) => void;
}

const REGIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Samarqand viloyati",
  "Farg'ona viloyati",
  "Andijon viloyati",
  "Namangan viloyati",
  "Buxoro viloyati",
  "Qashqadaryo viloyati",
  "Surxondaryo viloyati",
  "Xorazm viloyati",
  "Navoiy viloyati",
  "Jizzax viloyati",
  "Sirdaryo viloyati",
  "Qoraqalpog'iston Respublikasi",
];

export const CreateSchoolModal: React.FC<CreateSchoolModalProps> = ({
  isOpen,
  onClose,
  onSchoolCreated,
}) => {
  const [creationCode, setCreationCode] = useState('');
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [region, setRegion] = useState(REGIONS[0]);
  const [district, setDistrict] = useState('');
  const [director, setDirector] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success state with the generated code
  const [createdSchool, setCreatedSchool] = useState<School | null>(null);
  const [createdAdmin, setCreatedAdmin] = useState<AdminUser | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (creationCode.trim() !== '201311') {
      setError("Maktab yaratish uchun maxsus ruxsat kodi noto'g'ri. Iltimos, to'g'ri kodni kiriting.");
      return;
    }

    if (!name.trim()) {
      setError("Maktab nomini kiriting.");
      return;
    }
    if (!director.trim()) {
      setError("Direktor yoki mas'ul shaxs F.I.Sh. kiriting.");
      return;
    }
    if (!phone.trim() || phone.length < 9) {
      setError("To'liq telefon raqamini kiriting.");
      return;
    }
    if (!login.trim()) {
      setError("Admin uchun login kiriting.");
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    setLoading(true);
    try {
      const fullRegion = district.trim() ? `${region}, ${district.trim()}` : region;
      const res = await api.createSchool({
        name: name.trim(),
        number: number.trim(),
        region: fullRegion,
        director: director.trim(),
        phone: phone.trim(),
        login: login.trim(),
        password: password.trim(),
        description: description.trim() || undefined,
        creationCode: creationCode.trim(),
      });

      setCreatedSchool(res.school);
      setCreatedAdmin(res.admin);
    } catch (err: any) {
      setError(err.message || "Maktabni ro'yxatdan o'tkazishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!createdSchool) return;
    try {
      await navigator.clipboard.writeText(createdSchool.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    if (!createdSchool) return;
    const shareText = `«${createdSchool.name}» maktabi yangiliklariga ulanish uchun maxsus kod: ${createdSchool.code}\nUshbu kod orqali maktab yangiliklarini, e'lonlarini va tadbirlarini kuzatib boring!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: createdSchool.name,
          text: shareText,
        });
      } catch {
        // Fallback
      }
    } else {
      handleCopyCode();
    }
  };

  const handleFinish = () => {
    if (createdSchool && createdAdmin) {
      onSchoolCreated(createdSchool, createdAdmin);
      onClose();
      // Reset form
      setCreatedSchool(null);
      setCreatedAdmin(null);
      setCreationCode('');
      setName('');
      setNumber('');
      setDistrict('');
      setDirector('');
      setPhone('+998 ');
      setLogin('');
      setPassword('');
      setDescription('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-5 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <SchoolIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {createdSchool ? "Maktab muvaffaqiyatli ochildi!" : "Yangi maktab ochish"}
              </h2>
              <p className="text-[11px] sm:text-xs text-blue-100">
                {createdSchool
                  ? "Maxsus ulanish kodi yaratildi"
                  : "Maktab ma'lumotlarini to'ldiring va maxsus kod oling"}
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
        {createdSchool ? (
          /* Step 2: Success Screen with Unique Code */
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{createdSchool.name}</h3>
              <p className="text-sm text-slate-500">
                Maktab profili yaratildi va siz avtomatik tarzda administrator vakolatiga ega bo'ldingiz.
              </p>
            </div>

            {/* Special Code Presentation */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 text-center space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Maktabning maxsus ulanish kodi
              </span>
              <div className="font-mono text-3xl sm:text-4xl font-extrabold text-blue-900 tracking-widest selection:bg-blue-200">
                {createdSchool.code}
              </div>
              <p className="text-xs text-blue-600">
                O'quvchilar, o'qituvchilar va ota-onalar ushbu kod orqali maktabga ulanishadi.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Nusxalandi!" : "Kodni nusxalash"}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Kodni ulashish
                </button>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Barcha qurilmalarda ko'rinadi (Kompyuter va telefon)!
              </div>
              <p className="leading-relaxed">
                Maktab markaziy serverga muvaffaqiyatli saqlandi. Kompyuteringizda yoki boshqa istalgan qurilmada qidiruv maydoniga maktab nomi, raqami yoki <b>{createdSchool.code}</b> kodini kiritib kirishingiz mumkin.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              <span className="font-bold">Eslatma:</span> Yangi maktabingiz profili toza va bo'sh holda ochiladi. Birinchi yangilikni administrator paneli orqali e'lon qilishingiz mumkin.
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Maktab profiliga o'tish
            </button>
          </div>
        ) : (
          /* Step 1: School Creation Form */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Special Authorization Code Field */}
            <div className="space-y-1.5 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                Maktab yaratish maxsus ruxsat kodi *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Maxsus ruxsat kodini kiriting"
                  value={creationCode}
                  onChange={(e) => setCreationCode(e.target.value)}
                  className="w-full px-3.5 py-2 pr-10 text-sm font-mono tracking-wider border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Faqat maxsus ruxsat kodiga ega bo'lgan mas'ullar yangi maktab ochishi mumkin.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <SchoolIcon className="w-3.5 h-3.5 text-blue-600" />
                Maktab nomi *
              </label>
              <input
                type="text"
                required
                placeholder="Masalan: 14-sonli umumiy o'rta ta'lim maktabi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Maktab raqami
                </label>
                <input
                  type="text"
                  placeholder="Masalan: 14"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Viloyat / Shahar *
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Tuman yoki shahar (aniq manzili)
              </label>
              <input
                type="text"
                placeholder="Masalan: Chilonzor tumani, Muqimiy ko'chasi"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Direktor yoki mas'ul shaxs *
                </label>
                <input
                  type="text"
                  required
                  placeholder="F.I.Sh."
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  Telefon raqami *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Administrator hisobi ma'lumotlari
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Login (kirish uchun) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="admin_maktab"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    Xavfsiz parol *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Kamida 6 belgi"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Maktab haqida qisqacha ma'lumot (ixtiyoriy)
              </label>
              <textarea
                rows={2}
                placeholder="Ixtisoslashuv, qulayliklar yoki shior..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {loading ? "Maktab ro'yxatdan o'tkazilmoqda..." : "Maktab yaratish"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
