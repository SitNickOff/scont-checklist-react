/** Нормализует media из draft/API к массиву URL-строк. */
export const normalizeMediaUrls = (media) => {
  if (!Array.isArray(media)) return [];
  return media
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item.url === 'string') return item.url;
      return null;
    })
    .filter(Boolean);
};

export const isVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /\.(mp4|mov|webm|m4v|3gp|avi|mkv)(\?|$)/i.test(url);
};

export const mediaItemType = (url) => (isVideoUrl(url) ? 'video' : 'photo');

export const hasRequiredPhotoMedia = (answer) => {
  const photos = Array.isArray(answer?.photos) ? answer.photos : [];
  if (photos.length > 0) return true;

  const media = normalizeMediaUrls(answer?.media);
  return media.some((url) => mediaItemType(url) === 'photo');
};
