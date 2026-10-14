import React, { useState, useRef } from 'react';
import { School, NewsItem, NewsCategory, CATEGORY_LABELS } from '../types';
import { api } from '../services/api';
import {
  X,
  Image as ImageIcon,
  Video,
  Camera,
  AlertTriangle,
  Upload,
  Trash2,
  Send,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

interface CreateNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  editingNews?: NewsItem | null;
  onNewsSaved: (newsItem: NewsItem, isEdit: boolean) => void;
}

export const CreateNewsModal: React.FC<CreateNewsModalProps> = ({
  isOpen,
  onClose,
  school,
  editingNews,
  onNewsSaved,
}) => {
  const [title, setTitle] = useState(editingNews?.title || '');
  const [content, setContent] = useState(editingNews?.content || '');
  const [category, setCategory] = useState<NewsCategory>(editingNews?.category || 'tadbir');
  const [isImportant, setIsImportant] = useState(editingNews?.isImportant || false);

  // Existing uploaded media
  const [images, setImages] = useState<string[]>(editingNews?.images || []);
  const [videoUrl, setVideoUrl] = useState<string | null>(editingNews?.videoUrl || null);

  // Staged files to upload
  const [selectedFiles, setSelectedFiles] = useState<Array<{ file: File; preview: string; isVideo: boolean }>>([]);

  // Uploading state
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFilesSelected = (files: FileList | null, isVideo = false) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    const newStaged: Array<{ file: File; preview: string; isVideo: boolean }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validation
      if (file.size > 100 * 1024 * 1024) {
        setUploadError(`«${file.name}» fayl hajmi 100MB dan katta. Kichikroq fayl tanlang.`);
        continue;
      }

      const fileIsVideo = isVideo || file.type.startsWith('video/');
      const preview = URL.createObjectURL(file);
      newStaged.push({ file, preview, isVideo: fileIsVideo });
    }

    setSelectedFiles((prev) => [...prev, ...newStaged]);
  };

  const removeStagedFile = (index: number) => {
    setSelectedFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const removeExistingImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingVideo = () => {
    setVideoUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!title.trim()) {
      setUploadError("Yangilik sarlavhasini kiriting.");
      return;
    }
    if (!content.trim()) {
      setUploadError("Yangilik matnini kiriting.");
      return;
    }

    setSubmitting(true);

    try {
      let finalImages = [...images];
      let finalVideo = videoUrl;

      // If there are files to upload, upload them first
      if (selectedFiles.length > 0) {
        setUploadProgress(0);
        const filesToUpload = selectedFiles.map((item) => item.file);

        const uploadRes = await api.uploadFiles(filesToUpload, (percent) => {
          setUploadProgress(percent);
        });

        // Sort out images and videos
        for (const f of uploadRes.files) {
          if (f.url.endsWith('.mp4') || f.url.endsWith('.webm') || f.url.endsWith('.mov') || (f as any).type === 'video') {
            finalVideo = f.url;
          } else {
            finalImages.push(f.url);
          }
        }
      }

      let savedItem: NewsItem;
      if (editingNews) {
        savedItem = await api.updateNews(school.id, editingNews.id, {
          title: title.trim(),
          content: content.trim(),
          category,
          isImportant,
          images: finalImages,
          videoUrl: finalVideo,
        });
        onNewsSaved(savedItem, true);
      } else {
        savedItem = await api.createNews(school.id, {
          title: title.trim(),
          content: content.trim(),
          category,
          isImportant,
          images: finalImages,
          videoUrl: finalVideo,
          authorName: school.director,
          authorRole: "Maktab ma'muriyati",
        });
        onNewsSaved(savedItem, false);
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Yangilikni saqlashda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">
              {editingNews ? "Yangilikni tahrirlash" : "Yangi yangilik e'lon qilish"}
            </h2>
            <p className="text-xs text-blue-100">
              {school.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{uploadError}</div>
              <button
                type="button"
                onClick={() => setUploadError(null)}
                className="text-rose-500 hover:text-rose-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Yangilik sarlavhasi *
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: Maktabimizda ochiq eshiklar kuni bo'lib o'tdi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category & Important checkbox */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Mavzu toifasi
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NewsCategory)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 sm:pt-6">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded-sm focus:ring-rose-500"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Muhim yangilik (A'zolarga bildirishnoma)
                </span>
              </label>
            </div>
          </div>

          {/* Content Body */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Yangilik matni *
            </label>
            <textarea
              required
              rows={5}
              placeholder="Yangilik tafsilotlari, qatnashuvchilar, natijalar va muhim eslatmalar..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          {/* Media Pickers */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Foto va video biriktirish
              </span>
              <span className="text-[11px] text-slate-500">
                Maksimal 10 ta rasm va video
              </span>
            </div>

            {/* Hidden inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files, false)}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files, true)}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*,video/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files, false)}
            />

            {/* Upload Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-700 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-medium">Galereya (Rasm)</span>
              </button>

              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="p-3 border border-dashed border-slate-300 hover:border-purple-500 hover:bg-purple-50/50 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-700 transition-colors cursor-pointer"
              >
                <Video className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-medium">Video tanlash</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="p-3 border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-700 transition-colors cursor-pointer"
              >
                <Camera className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-medium">Kameradan olish</span>
              </button>
            </div>

            {/* Existing Media Previews */}
            {(images.length > 0 || videoUrl) && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Mavjud fayllar:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group bg-slate-100">
                      <img src={img} alt="Mavjud rasm" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute top-1 right-1 p-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {videoUrl && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-purple-200 bg-slate-900 flex items-center justify-center group">
                      <Video className="w-6 h-6 text-white/70" />
                      <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
                        Video
                      </span>
                      <button
                        type="button"
                        onClick={removeExistingVideo}
                        className="absolute top-1 right-1 p-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Staged new files previews */}
            {selectedFiles.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                  Yuklashga tayyor yangi fayllar ({selectedFiles.length} ta):
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {selectedFiles.map((item, i) => (
                    <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-blue-200 bg-slate-900 group">
                      {item.isVideo ? (
                        <video src={item.preview} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={item.preview} alt="Yuklanayotgan fayl" className="w-full h-full object-cover" />
                      )}
                      <span className="absolute bottom-1 left-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded truncate max-w-[90%]">
                        {item.file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeStagedFile(i)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress Bar */}
          {uploadProgress !== null && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                <span className="flex items-center gap-1.5">
                  <Upload className="w-4 h-4 animate-bounce text-blue-600" />
                  Serverga yuklanmoqda...
                </span>
                <span className="font-mono text-sm">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {submitting
                ? "Chop etilmoqda..."
                : editingNews
                ? "O'zgarishlarni saqlash"
                : "Yangilikni chop etish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
