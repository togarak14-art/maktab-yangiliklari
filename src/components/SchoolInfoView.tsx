import React, { useState } from 'react';
import { School, AdminUser, SchoolMember } from '../types';
import {
  School as SchoolIcon,
  MapPin,
  User,
  Phone,
  Copy,
  Check,
  Share2,
  Calendar,
  Users,
  FileText,
  ShieldCheck,
  Sliders,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

interface SchoolInfoViewProps {
  school: School;
  isAdmin: boolean;
  onOpenCreateNews: () => void;
  onOpenAdminPanel: () => void;
  onNavigateToNews: () => void;
}

export const SchoolInfoView: React.FC<SchoolInfoViewProps> = ({
  school,
  isAdmin,
  onOpenCreateNews,
  onOpenAdminPanel,
  onNavigateToNews,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(school.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    const text = `«${school.name}» yangiliklariga ulanish uchun maxsus kod: ${school.code}\nUshbu kod orqali maktab e'lonlari, dars jadvali va fotolavhalarni kuzating!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: school.name,
          text,
        });
      } catch {}
    } else {
      handleCopyCode();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero School Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Cover banner */}
        <div className="h-44 sm:h-56 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 sm:p-8 flex flex-col justify-end text-white relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {isAdmin && (
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                Administrator
              </span>
            )}
          </div>

          <div className="space-y-1 z-10">
            <span className="text-xs uppercase tracking-widest text-blue-200 font-bold">
              {school.number ? `${school.number}-sonli maktab` : "Umumta'lim muassasasi"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {school.name}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {school.region}
            </p>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Connection Code Callout */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">
                Maktabga ulanish kodi:
              </span>
              <div className="font-mono text-3xl font-extrabold text-blue-900 tracking-wider">
                {school.code}
              </div>
              <p className="text-xs text-blue-600">
                Ushbu kodni o'quvchilar va ota-onalarga berib, ularni maktabga ulang.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyCode}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                {copied ? "Nusxalandi!" : "Kodni nusxalash"}
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2.5 bg-white border border-blue-300 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                Ulashish
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Direktor / Mas'ul shaxs
              </div>
              <div className="text-sm font-bold text-slate-900">{school.director}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                Bog'lanish telefoni
              </div>
              <div className="text-sm font-bold text-slate-900">{school.phone}</div>
            </div>
          </div>

          {/* Description if present */}
          {school.description && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Maktab haqida
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {school.description}
              </p>
            </div>
          )}

          {/* Quick Stats Strip (Tabular discipline) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl border border-slate-200 bg-white text-center space-y-1">
              <Users className="w-5 h-5 text-blue-600 mx-auto" />
              <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                {school.memberCount || 0}
              </div>
              <div className="text-xs text-slate-500">Ulangan a'zolar</div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-white text-center space-y-1">
              <FileText className="w-5 h-5 text-purple-600 mx-auto" />
              <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                {school.newsCount || 0}
              </div>
              <div className="text-xs text-slate-500">Chop etilgan yangiliklar</div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-white text-center space-y-1 col-span-2 sm:col-span-1">
              <Calendar className="w-5 h-5 text-emerald-600 mx-auto" />
              <div className="text-sm font-mono font-bold text-slate-900 tabular-nums mt-1">
                {new Date(school.createdAt).toLocaleDateString('uz-UZ')}
              </div>
              <div className="text-xs text-slate-500">Ro'yxatdan o'tgan sana</div>
            </div>
          </div>

          {/* Admin Buttons / Quick navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={onNavigateToNews}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Yangiliklar lentasiga o'tish
            </button>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenCreateNews}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Yangilik qo'shish
                </button>
                <button
                  onClick={onOpenAdminPanel}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-4 h-4" />
                  Admin paneli
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
