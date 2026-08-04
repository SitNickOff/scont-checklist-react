import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  LinearProgress,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadVideoStream } from '../api';
import { loadSentStreamVideos, saveSentStreamVideo } from '../utils/videoStorage';

const VIDEO_ACCEPT = 'video/*,.mp4,.mov,.m4v,.webm,.3gp,.avi,.mkv';

const MIME_TO_FORMAT = {
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'video/3gpp': '3gp',
  'video/x-m4v': 'm4v',
};

const EXTENSION_TO_FORMAT = {
  mp4: 'mp4',
  mov: 'mov',
  m4v: 'm4v',
  webm: 'webm',
  '3gp': '3gp',
  avi: 'avi',
  mkv: 'mkv',
};

const getVideoFormat = (file) => {
  const fromMime = MIME_TO_FORMAT[file.type?.toLowerCase()];
  if (fromMime) return fromMime;

  const ext = file.name?.split('.').pop()?.toLowerCase();
  return EXTENSION_TO_FORMAT[ext] || ext || null;
};

const isVideoFile = (file) => {
  if (file.type?.startsWith('video/')) return true;
  return Boolean(getVideoFormat(file));
};

const formatFileSize = (bytes) => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} КБ`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
};

const formatSentAt = (iso, lang) => {
  try {
    return new Date(iso).toLocaleString(lang === 'en' ? 'en-US' : 'ru-RU');
  } catch {
    return iso;
  }
};

const messages = {
  ru: {
    title: 'Потоковая загрузка видео',
    select: 'Выбрать видео',
    record: 'Снять видео',
    upload: 'Отправить',
    uploading: 'Загрузка',
    sentList: 'Отправленные видео',
    emptyList: 'Пока нет отправленных видео',
    preview: 'Предпросмотр',
    success: 'Видео успешно отправлено',
    errorUpload: 'Не удалось отправить видео',
    errorType: 'Выберите файл в формате видео',
    errorFormat: 'Не удалось определить формат видео',
    statusOk: 'Отправлено',
    statusError: 'Ошибка',
    sizeLabel: 'Размер',
    openLink: 'Открыть файл',
    copyLink: 'Скопировать ссылку',
    linkCopied: 'Ссылка скопирована',
    errorCopyLink: 'Не удалось скопировать ссылку',
  },
  en: {
    title: 'Stream video upload',
    select: 'Choose video',
    record: 'Record video',
    upload: 'Send',
    uploading: 'Uploading',
    sentList: 'Sent videos',
    emptyList: 'No videos sent yet',
    preview: 'Preview',
    success: 'Video sent successfully',
    errorUpload: 'Failed to send video',
    errorType: 'Please select a video file',
    errorFormat: 'Could not detect video format',
    statusOk: 'Sent',
    statusError: 'Error',
    sizeLabel: 'Size',
    openLink: 'Open file',
    copyLink: 'Copy link',
    linkCopied: 'Link copied',
    errorCopyLink: 'Failed to copy link',
  },
};

const VideoStreamUploadPage = () => {
  const { chatId, token, lang, agent } = useSelector((state) => state.app);
  const texts = messages[lang] || messages.ru;

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [sentVideos, setSentVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const refreshList = useCallback(() => {
    setSentVideos(loadSentStreamVideos(chatId));
  }, [chatId]);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const validateFile = (file) => {
    if (!isVideoFile(file)) {
      setError(texts.errorType);
      return false;
    }
    if (!getVideoFormat(file)) {
      setError(texts.errorFormat);
      return false;
    }
    setError('');
    return true;
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!validateFile(file)) return;
    setSelectedFile(file);
    setSuccessMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;

    const format = getVideoFormat(selectedFile);
    if (!format) {
      setError(texts.errorFormat);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccessMessage('');

    const sentAt = new Date().toISOString();
    const entryBase = {
      id: `${Date.now()}`,
      name: selectedFile.name,
      size: selectedFile.size,
      format,
      sentAt,
    };

    try {
      const data = await uploadVideoStream(
        token,
        chatId,
        selectedFile,
        format,
        agent,
        (event) => {
          if (event.total) {
            setUploadProgress(Math.round((event.loaded * 100) / event.total));
          }
        }
      );

      const videoUrl =
        data?.video_url ||
        (data?.key ? `https://s3.twcstorage.ru/scont/${data.key}` : null);

      saveSentStreamVideo(chatId, {
        ...entryBase,
        status: 'ok',
        videoUrl,
        key: data?.key,
        response: data,
      });
      refreshList();
      setSelectedFile(null);
      setSuccessMessage(texts.success);
    } catch (err) {
      console.error('Stream video upload error:', err);
      saveSentStreamVideo(chatId, {
        ...entryBase,
        status: 'error',
        error: err?.response?.data?.error || err?.message,
      });
      refreshList();
      setError(texts.errorUpload);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Container sx={{ py: 2, pb: 4 }}>
      <Typography variant="h5" gutterBottom>
        {texts.title}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={VIDEO_ACCEPT}
        hidden
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept={VIDEO_ACCEPT}
        capture="environment"
        hidden
        onChange={handleFileChange}
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<VideocamIcon />}
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
        >
          {texts.record}
        </Button>
        <Button
          variant="outlined"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {texts.select}
        </Button>
      </Box>

      {previewUrl && selectedFile && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {texts.preview}
          </Typography>
          <video
            src={previewUrl}
            controls
            style={{ width: '100%', maxHeight: 280, borderRadius: 8 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {selectedFile.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {texts.sizeLabel}: {formatFileSize(selectedFile.size)}
            {getVideoFormat(selectedFile)
              ? ` · ${getVideoFormat(selectedFile).toUpperCase()}`
              : ''}
          </Typography>
        </Box>
      )}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        sx={{ mb: 1 }}
      >
        {uploading ? `${texts.uploading} ${uploadProgress}%` : texts.upload}
      </Button>

      {uploading && (
        <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 3 }} />
      )}

      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        {texts.sentList}
      </Typography>

      {sentVideos.length === 0 ? (
        <Typography color="text.secondary">{texts.emptyList}</Typography>
      ) : (
        <List disablePadding>
          {sentVideos.map((item) => (
            <ListItem
              key={item.id}
              divider
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                py: 1.5,
                gap: 1,
              }}
            >
              <ListItemText
                primary={item.name}
                secondary={
                  item.format
                    ? `${formatSentAt(item.sentAt, lang)} · ${item.format.toUpperCase()}`
                    : formatSentAt(item.sentAt, lang)
                }
                primaryTypographyProps={{ fontWeight: 500 }}
              />
              <Typography
                variant="caption"
                color={item.status === 'ok' ? 'success.main' : 'error.main'}
              >
                {item.status === 'ok' ? texts.statusOk : texts.statusError}
              </Typography>

              {item.videoUrl && (
                <Box sx={{ width: '100%' }}>
                  <video
                    src={item.videoUrl}
                    controls
                    preload="metadata"
                    style={{
                      width: '100%',
                      maxHeight: 220,
                      borderRadius: 8,
                      background: '#000',
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, wordBreak: 'break-all' }}
                  >
                    <Link href={item.videoUrl} target="_blank" rel="noopener noreferrer">
                      {item.videoUrl}
                    </Link>
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      href={item.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {texts.openLink}
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(item.videoUrl);
                          setError('');
                          setSuccessMessage(texts.linkCopied);
                        } catch {
                          setSuccessMessage('');
                          setError(texts.errorCopyLink);
                        }
                      }}
                    >
                      {texts.copyLink}
                    </Button>
                  </Box>
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
};

export default VideoStreamUploadPage;
