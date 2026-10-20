import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface MediaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: 'image' | 'video';
  images?: string[];
  initialImageIndex?: number;
  videoUrl?: string | null;
  title?: string;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  isOpen,
  onClose,
  mediaType,
  images = [],
  initialImageIndex = 0,
  videoUrl,
  title,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialImageIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    setCurrentIndex(initialImageIndex);
  }, [initialImageIndex]);

  if (!isOpen) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none"
      onClick={onClose}
    >
      {/* Top action bar */}
      <div
        className="absolute inset-x-3 sm:inset-x-6 flex items-center justify-between text-white z-20 pointer-events-auto"
        style={{ top: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-[70%] truncate text-xs sm:text-sm font-medium text-slate-200">
          {title || "Media ko'rish"}
          {mediaType === 'image' && images.length > 1 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-mono">
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div
        className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {mediaType === 'image' && images.length > 0 ? (
          <div className="relative flex items-center justify-center w-full h-full">
            <img
              src={images[currentIndex]}
              alt={title || "Kattalashtirilgan rasm"}
              referrerPolicy="no-referrer"
              className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl transition-all duration-200"
            />

            {/* Navigation arrows if multiple images */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-4 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        ) : mediaType === 'video' && videoUrl ? (
          <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden bg-black shadow-2xl">
            {videoUrl.includes('youtube') || videoUrl.includes('youtu.be') ? (
              <div className="relative aspect-video w-full max-h-[80vh]">
                <iframe
                  src={
                    videoUrl.includes('embed')
                      ? videoUrl
                      : `https://www.youtube.com/embed/${
                          videoUrl.match(/(?:watch\?.*v=|embed\/|shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || ''
                        }?autoplay=1&rel=0`
                  }
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={title || "Video ko'rish"}
                />
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  autoPlay
                  controls
                  playsInline
                  className="w-full max-h-[75vh] object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Custom overlay controls */}
                <div className="p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between gap-3 text-white">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    onClick={handleFullscreen}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
