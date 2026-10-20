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
  Link2,
  Play,
  Plus,
} from 'lucide-react';
import { isVideoSource, isVideoFile, getYouTubeEmbedUrl } from '../utils/mediaUtils';

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

  // Extract existing media separating videos from images
  const initialVideos: string[] = [];
  if (editingNews?.videoUrl) initialVideos.push(editingNews.videoUrl);
  if (editingNews?.videos && Array.isArray(editingNews.videos)) {
    for (const v of editingNews.videos) {
      if (v && !initialVideos.includes(v)) initialVideos.push(v);
    }
  }
  for (const m of editingNews?.images || []) {
    if (isVideoSource(m) && !initialVideos.includes(m)) {
      initialVideos.push(m);
    }
  }

  const initialImages: string[] = (editingNews?.images || []).filter((img) => !isVideoSource(img));

  // Existing uploaded media
  const [images, setImages] = useState<string[]>(initialImages);
  const [videos, setVideos] = useState<string[]>(initialVideos);

  // Video Link Input (YouTube or direct video URL)
  const [showVideoLinkInput, setShowVideoLinkInput] = useState(false);
  const [videoLinkText, setVideoLinkText] = useState('');

  // Staged files to upload
  const [selectedFiles, setSelectedFiles] = useState<
    Array<{ file: File; preview: string; isVideo: boolean }>
  >([]);

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

      // Validation 100MB
      if (file.size > 100 * 1024 * 1024) {
        setUploadError(`«${file.name}» hajmi 100MB dan katta. Kichikroq fayl tanlang.`);
        continue;
      }

      const fileIsVideo = isVideoFile(file, isVideo);
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

  const removeExistingVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddVideoLink = () => {
    const clean = videoLinkText.trim();
    if (!clean) return;
    if (!videos.includes(clean)) {
      setVideos((prev) => [...prev, clean]);
    }
    setVideoLinkText('');
    setShowVideoLinkInput(false);
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
      const finalImages = [...images];
      const finalVideos = [...videos];

      // If user left link text in the input box, add it automatically
      if (videoLinkText.trim() && !finalVideos.includes(videoLinkText.trim())) {
        finalVideos.push(videoLinkText.trim());
      }

      // If there are files to upload, upload them
      if (selectedFiles.length > 0) {
        setUploadProgress(0);
        const filesToUpload = selectedFiles.map((item) => item.file);

        const uploadRes = await api.uploadFiles(filesToUpload, (percent) => {
          setUploadProgress(percent);
        });

        // Match uploaded files with staged files to preserve video/image classification
        for (let i = 0; i < uploadRes.files.length; i++) {
          const uploaded = uploadRes.files[i];
          const staged = selectedFiles[i];

          const isVid =
            staged?.isVideo ||
            (staged?.file && isVideoFile(staged.file, false)) ||
            (uploaded as any).type === 'video' ||
            isVideoSource(uploaded.url) ||
            (uploaded.originalName && isVideoSource(uploaded.originalName));

          if (isVid) {
            finalVideos.push(uploaded.url);
          } else {
            finalImages.push(uploaded.url);
          }
        }
      }

      // Sanitize: move any video sources that might have slipped into images array into finalVideos
      const cleanImages: string[] = [];
      for (const item of finalImages) {
        if (isVideoSource(item)) {
          if (!finalVideos.includes(item)) finalVideos.push(item);
        } else {
          cleanImages.push(item);
        }
      }

      const primaryVideo = finalVideos.length > 0 ? finalVideos[0] : null;

      let savedItem: NewsItem;
      if (editingNews) {
        savedItem = await api.updateNews(school.id, editingNews.id, {
          title: title.trim(),
          content: content.trim(),
          category,
          isImportant,
          images: cleanImages,
          videoUrl: primaryVideo,
          videos: finalVideos,
        });
        onNewsSaved(savedItem, true);
      } else {
        savedItem = await api.createNews(school.id, {
          title: title.trim(),
          content: content.trim(),
          category,
          isImportant,
          images: cleanImages,
          videoUrl: primaryVideo,
          videos: finalVideos,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-5 sm:px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold">
              {editingNews ? "Yangilikni tahrirlash" : "Yangi yangilik e'lon qilish"}
            </h2>
            <p className="text-[11px] sm:text-xs text-blue-100">
              {school.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
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
              placeholder="Masalan: Maktabimiz o'quvchilari olimpiadada 1-o'rinni egalladi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Category & Important row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Kategoriya
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NewsCategory)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center pt-2 sm:pt-6">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Muhim e'lon sifatida belgilash
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
                MP4, MOV, WebM, 3GP, Rasm va YouTube
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
              accept="video/*,video/mp4,video/quicktime,video/webm,video/3gpp,video/x-matroska,.mp4,.mov,.webm,.3gp,.mkv"
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                className="p-3 border border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/30 hover:bg-purple-50 rounded-xl flex flex-col items-center justify-center gap-1 text-purple-900 transition-colors cursor-pointer"
              >
                <Video className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-semibold">Video yuklash</span>
              </button>

              <button
                type="button"
                onClick={() => setShowVideoLinkInput((prev) => !prev)}
                className={`p-3 border border-dashed rounded-xl flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                  showVideoLinkInput
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                    : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/40 text-slate-700'
                }`}
              >
                <Link2 className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-medium">YouTube / Havola</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="p-3 border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-700 transition-colors cursor-pointer"
              >
                <Camera className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-medium">Kamera</span>
              </button>
            </div>

            {/* Video Link Input Drawer */}
            {showVideoLinkInput && (
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2 animate-in fade-in duration-200">
                <label className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-purple-600" />
                  Video havola (YouTube yoki to'g'ridan-to'g'ri video link)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... yoki https://...mp4"
                    value={videoLinkText}
                    onChange={(e) => setVideoLinkText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddVideoLink();
                      }
                    }}
                    className="flex-1 px-3 py-2 text-xs border border-purple-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddVideoLink}
                    disabled={!videoLinkText.trim()}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Qo'shish
                  </button>
                </div>
                <p className="text-[11px] text-purple-700">
                  YouTube video havolasi (watch, shorts, yoki youtu.be) kiritilganda avtomatik ravishda video pleerda namoyish etiladi.
                </p>
              </div>
            )}

            {/* Existing Media Previews */}
            {(images.length > 0 || videos.length > 0) && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Biriktirilgan fayllar ({images.length + videos.length} ta):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* Videos */}
                  {videos.map((vid, i) => {
                    const ytEmbed = getYouTubeEmbedUrl(vid);
                    return (
                      <div
                        key={`vid-${i}`}
                        className="relative aspect-video rounded-xl overflow-hidden border-2 border-purple-400 bg-slate-950 flex items-center justify-center group shadow-xs"
                      >
                        {ytEmbed ? (
                          <iframe
                            src={ytEmbed}
                            className="w-full h-full pointer-events-none border-0"
                            title="YouTube video"
                          />
                        ) : (
                          <video src={vid} className="w-full h-full object-cover" muted playsInline />
                        )}
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none">
                          <Play className="w-7 h-7 text-white/90 drop-shadow-md" />
                        </div>
                        <span className="absolute top-1.5 left-1.5 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                          <Video className="w-3 h-3" />
                          {ytEmbed ? 'YouTube' : 'Video'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExistingVideo(i)}
                          className="absolute top-1.5 right-1.5 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer shadow-md"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Images */}
                  {images.map((img, i) => (
                    <div
                      key={`img-${i}`}
                      className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group bg-slate-100 shadow-xs"
                    >
                      <img src={img} alt="Mavjud rasm" className="w-full h-full object-cover" />
                      <span className="absolute top-1.5 left-1.5 bg-blue-600/90 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-xs">
                        Rasm
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer shadow-md"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Staged new files previews */}
            {selectedFiles.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                  Yuklashga tayyor yangi fayllar ({selectedFiles.length} ta):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedFiles.map((item, i) => (
                    <div
                      key={`staged-${i}`}
                      className={`relative aspect-video rounded-xl overflow-hidden shadow-xs group ${
                        item.isVideo
                          ? 'border-2 border-purple-400 bg-slate-950'
                          : 'border border-blue-300 bg-slate-100'
                      }`}
                    >
                      {item.isVideo ? (
                        <>
                          <video
                            src={item.preview}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                            <Play className="w-7 h-7 text-white/90 drop-shadow-md" />
                          </div>
                          <span className="absolute top-1.5 left-1.5 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                            <Video className="w-3 h-3" />
                            Video
                          </span>
                        </>
                      ) : (
                        <>
                          <img
                            src={item.preview}
                            alt="Yuklanayotgan fayl"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                            Rasm
                          </span>
                        </>
                      )}
                      <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/80 text-white px-1.5 py-0.5 rounded truncate max-w-[75%]">
                        {item.file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeStagedFile(i)}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer shadow-md"
                        title="O'chirish"
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
