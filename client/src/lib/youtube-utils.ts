// YouTube URL parsing and validation utilities

export interface YouTubeUrlResult {
  videoId: string | null;
  isValid: boolean;
  originalUrl: string;
}

/**
 * Extracts YouTube video ID from various URL formats
 * Supports:
 * - youtube.com/watch?v=VIDEO_ID
 * - youtu.be/VIDEO_ID
 * - youtube.com/embed/VIDEO_ID
 * - youtube.com/shorts/VIDEO_ID
 * - youtube.com/v/VIDEO_ID
 * - Raw video ID (11 characters)
 */
export function extractYouTubeVideoId(url: string): YouTubeUrlResult {
  const originalUrl = url.trim();
  
  if (!originalUrl) {
    return { videoId: null, isValid: false, originalUrl };
  }

  // Check if it's already a video ID (11 characters, alphanumeric and dashes/underscores)
  const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/;
  if (videoIdRegex.test(originalUrl)) {
    return { videoId: originalUrl, isValid: true, originalUrl };
  }

  // YouTube URL patterns
  const patterns = [
    // youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // youtu.be/VIDEO_ID
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // youtube.com/embed/VIDEO_ID
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // youtube.com/shorts/VIDEO_ID
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    // youtube.com/v/VIDEO_ID
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = originalUrl.match(pattern);
    if (match && match[1]) {
      return { videoId: match[1], isValid: true, originalUrl };
    }
  }

  return { videoId: null, isValid: false, originalUrl };
}

/**
 * Generates a privacy-enhanced YouTube embed URL
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0`;
}

/**
 * Generates a fallback YouTube embed URL (regular YouTube)
 */
export function getYouTubeFallbackEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0`;
}

/**
 * Validates if a YouTube video can be embedded
 */
export function validateYouTubeVideoId(videoId: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}