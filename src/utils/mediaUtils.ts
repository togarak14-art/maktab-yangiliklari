/**
 * Media detection and processing utilities for schools platform
 * Supports videos (MP4, MOV, WebM, 3GP, MKV, base64 Data URLs, YouTube embeds) and images
 */

export function isVideoSource(url: string | null | undefined): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  if (clean.startsWith('data:video/')) return true;
  if (/youtu(\.be|be\.com)/i.test(clean)) return true;
  if (/\.(mp4|webm|mov|mkv|avi|3gp|m4v|ogg|ogv|ts)($|\?)/i.test(clean)) return true;
  return false;
}

export function isVideoFile(file: File, explicitIsVideo = false): boolean {
  if (explicitIsVideo) return true;
  if (file.type && file.type.toLowerCase().startsWith('video/')) return true;
  const name = file.name.toLowerCase();
  return /\.(mp4|webm|mov|mkv|avi|3gp|m4v|ogg|ogv|ts)$/i.test(name);
}

export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const clean = url.trim();
  const watchMatch = clean.match(
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}?rel=0&modestbranding=1`;
  }
  return null;
}
