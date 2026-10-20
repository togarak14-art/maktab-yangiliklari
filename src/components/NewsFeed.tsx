import React, { useState } from 'react';
import { School, NewsItem, AdminUser, NewsCategory, CATEGORY_LABELS } from '../types';
import {
  FileText,
  PlusCircle,
  Calendar,
  User,
  AlertCircle,
  Edit2,
  Trash2,
  Search,
  Play,
  Volume2,
  Maximize2,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Video,
} from 'lucide-react';
import { isVideoSource, getYouTubeEmbedUrl } from '../utils/mediaUtils';

interface NewsFeedProps {
  school: School;
  news: NewsItem[];
  isAdmin: boolean;
  onOpenCreateNews: () => void;
  onEditNews: (news: NewsItem) => void;
  onDeleteNews: (newsId: string) => void;
  onOpenMediaViewer: (type: 'image' | 'video', images?: string[], index?: number, videoUrl?: string | null, title?: string) => void;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({
  school,
  news,
  isAdmin,
  onOpenCreateNews,
  onEditNews,
  onDeleteNews,
  onOpenMediaViewer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedNewsIds, setExpandedNewsIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedNewsIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filter news
  const filteredNews = news.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchContent = item.content.toLowerCase().includes(q);
      const matchAuthor = item.authorName.toLowerCase().includes(q);
      return matchTitle || matchContent || matchAuthor;
    }
    return true;
  });

  // CRITICAL REQUIREMENT #3:
  // If school has zero news: exactly render the required text!
  if (news.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <FileText className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Hozircha yangiliklar yo‘q
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Maktab yangiliklari shu yerda paydo bo‘ladi
            </p>
          </div>

          {isAdmin ? (
            <div className="pt-4">
              <button
                onClick={onOpenCreateNews}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                Birinchi yangilikni joylash
              </button>
              <p className="text-[11px] text-slate-400 mt-2">
                Siz maktab administratori sifatida yangilik, e'lon yoki foto/video qo'shishingiz mumkin.
              </p>
            </div>
          ) : (
            <div className="pt-2 text-xs text-slate-400 bg-slate-50 rounded-xl p-3 max-w-sm mx-auto">
              Maktab ma'muriyati tez orada yangilik va muhim e'lonlarni ushbu sahifada e'lon qiladi.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Category Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Yangiliklar bo'yicha qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>

          {/* Admin quick add button */}
          {isAdmin && (
            <button
              onClick={onOpenCreateNews}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              Yangi yangilik
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 font-medium transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Barchasi ({news.length})
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
            const count = news.filter((n) => n.category === key).length;
            if (count === 0 && selectedCategory !== key) return null;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 font-medium transition-colors cursor-pointer ${
                  selectedCategory === key
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtered News List */}
      {filteredNews.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
          <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold">Qidiruv bo'yicha yangilik topilmadi</p>
          <p className="text-xs text-slate-400 mt-1">Boshqa so'z bilan qidirib ko'ring yoki toifani o'zgartiring.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredNews.map((item) => {
            const isExpanded = expandedNewsIds.has(item.id);
            const isLong = item.content.length > 280;
            const displayContent = isExpanded || !isLong
              ? item.content
              : item.content.slice(0, 280) + '...';

            return (
              <article
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* News Card Header */}
                <div className="p-4 sm:p-6 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      {/* Quiet Unboxed Metadata (Zero-Pill discipline from frontend-design) */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-blue-700">
                          {CATEGORY_LABELS[item.category] || "Maktab yangiliklari"}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {new Date(item.createdAt).toLocaleDateString('uz-UZ', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        {item.isImportant && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-rose-600 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Muhim e'lon
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                      <div className="flex items-center gap-1 shrink-0 bg-slate-50 p-1 rounded-xl border border-slate-200">
                        <button
                          onClick={() => onEditNews(item)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
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
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <p className="mt-3 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {displayContent}
                  </p>

                  {isLong && (
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                    >
                      {isExpanded ? "Qisqartirish" : "Davomini o'qish..."}
                    </button>
                  )}
                </div>

                {/* Media Section: Photos & Video */}
                {(() => {
                  const itemVideos: string[] = [];
                  if (item.videoUrl) itemVideos.push(item.videoUrl);
                  if (item.videos && Array.isArray(item.videos)) {
                    for (const v of item.videos) {
                      if (v && !itemVideos.includes(v)) itemVideos.push(v);
                    }
                  }
                  for (const media of item.images || []) {
                    if (isVideoSource(media) && !itemVideos.includes(media)) {
                      itemVideos.push(media);
                    }
                  }

                  const itemImages = (item.images || []).filter((img) => !isVideoSource(img));

                  return (
                    <>
                      {/* Video Player(s) */}
                      {itemVideos.length > 0 && (
                        <div className="px-4 sm:px-6 py-2 space-y-3">
                          {itemVideos.map((vid, vidIdx) => {
                            const ytEmbed = getYouTubeEmbedUrl(vid);
                            return (
                              <div
                                key={vidIdx}
                                className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-md border border-slate-200 group"
                              >
                                {ytEmbed ? (
                                  <iframe
                                    src={ytEmbed}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    title={`${item.title} - Video ${vidIdx + 1}`}
                                  />
                                ) : (
                                  <>
                                    <video
                                      src={vid}
                                      controls
                                      playsInline
                                      preload="metadata"
                                      className="w-full h-full object-contain bg-black"
                                    >
                                      Sizning qurilmangiz ushbu videoni ijro etishni qo'llab-quvvatlamaydi.
                                    </video>
                                    <button
                                      onClick={() => onOpenMediaViewer('video', undefined, undefined, vid, item.title)}
                                      className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                                      title="Kattalashtirish"
                                    >
                                      <Maximize2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Images Gallery */}
                      {itemImages.length > 0 && (
                        <div className="px-4 sm:px-6 py-2">
                          {itemImages.length === 1 ? (
                            <div
                              onClick={() => onOpenMediaViewer('image', itemImages, 0, null, item.title)}
                              className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 cursor-pointer group shadow-xs border border-slate-200/80"
                            >
                              <img
                                src={itemImages[0]}
                                alt={item.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5">
                                  <Maximize2 className="w-3.5 h-3.5" />
                                  Kattalashtirish
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {itemImages.map((img, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => onOpenMediaViewer('image', itemImages, idx, null, item.title)}
                                  className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 cursor-pointer group shadow-xs border border-slate-200/80"
                                >
                                  <img
                                    src={img}
                                    alt={`${item.title} - ${idx + 1}`}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="p-2 rounded-full bg-black/60 text-white">
                                      <Maximize2 className="w-4 h-4" />
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* News Card Footer: Author and Share */}
                <div className="px-5 sm:px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                      {item.authorName.charAt(0)}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">{item.authorName}</span>
                      <span className="text-[11px] text-slate-400 block sm:inline sm:ml-1">
                        ({item.authorRole})
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const shareText = `«${school.name}» yangiligi:\n${item.title}\n\n${item.content.slice(0, 150)}...`;
                      if (navigator.share) {
                        navigator.share({ title: item.title, text: shareText }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(shareText);
                        alert("Yangilik matni nusxalandi!");
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    title="Ulashish"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline text-[11px]">Ulashish</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
