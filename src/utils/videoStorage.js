const storageKey = (chatId) => `sent_videos_${chatId}`;
const streamStorageKey = (chatId) => `sent_videos_stream_${chatId}`;

export const loadSentVideos = (chatId) => {
  if (!chatId) return [];
  try {
    const raw = localStorage.getItem(storageKey(chatId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveSentVideo = (chatId, entry) => {
  if (!chatId) return;
  const list = loadSentVideos(chatId);
  const next = [entry, ...list];
  localStorage.setItem(storageKey(chatId), JSON.stringify(next));
  return next;
};

export const loadSentStreamVideos = (chatId) => {
  if (!chatId) return [];
  try {
    const raw = localStorage.getItem(streamStorageKey(chatId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveSentStreamVideo = (chatId, entry) => {
  if (!chatId) return;
  const list = loadSentStreamVideos(chatId);
  const next = [entry, ...list];
  localStorage.setItem(streamStorageKey(chatId), JSON.stringify(next));
  return next;
};
