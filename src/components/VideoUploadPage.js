import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadVideo } from '../api';
import { loadSentVideos, saveSentVideo } from '../utils/videoStorage';

const MAX_VIDEO_SIZE_MB = 50;

const messages = {
  ru: {
    title: 'Отправка видео',
    select: 'Выбрать видео',
    record: 'Снять видео',
    upload: 'Отправить',
    uploading: 'Отправка…',
    sentList: 'Отправленные видео',
    emptyList: 'Пока нет отправленных видео',
    preview: 'Предпросмотр',
    success: 'Видео успешно отправлено',
    errorUpload: 'Не удалось отправить видео',
    errorType: 'Выберите файл в формате видео',
    errorSize: `Размер файла не должен превышать ${MAX_VIDEO_SIZE_MB} МБ`,
    statusOk: 'Отправлено',
    statusError: 'Ошибка',
  },
  en: {
    title: 'Video upload',
    select: 'Choose video',
    record: 'Record video',
    upload: 'Send',
    uploading: 'Uploading…',
    sentList: 'Sent videos',
    emptyList: 'No videos sent yet',
    preview: 'Preview',
    success: 'Video sent successfully',
    errorUpload: 'Failed to send video',
    errorType: 'Please select a video file',
    errorSize: `File size must not exceed ${MAX_VIDEO_SIZE_MB} MB`,
    statusOk: 'Sent',
    statusError: 'Error',
  },
};

const formatSentAt = (iso, lang) => {
  try {
    return new Date(iso).toLocaleString(lang === 'en' ? 'en-US' : 'ru-RU');
  } catch {
    return iso;
  }
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const VideoUploadPage = () => {
  const { chatId, token, lang, agent } = useSelector((state) => state.app);
  const texts = messages[lang] || messages.ru;

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [sentVideos, setSentVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const refreshList = useCallback(() => {
    setSentVideos(loadSentVideos(chatId));
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
    if (!file.type.startsWith('video/')) {
      setError(texts.errorType);
      return false;
    }
    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      setError(texts.errorSize);
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

    setUploading(true);
    setError('');
    setSuccessMessage('');

    const sentAt = new Date().toISOString();
    const entryBase = {
      id: `${Date.now()}`,
      name: selectedFile.name,
      size: selectedFile.size,
      sentAt,
    };

    try {
      const videoBase64 = await fileToBase64(selectedFile);
      const data = await uploadVideo(token, chatId, videoBase64, agent);

      const entry = {
        ...entryBase,
        status: 'ok',
        response: data,
      };
      saveSentVideo(chatId, entry);
      refreshList();
      setSelectedFile(null);
      setSuccessMessage(texts.success);
    } catch (err) {
      console.error('Video upload error:', err);
      saveSentVideo(chatId, {
        ...entryBase,
        status: 'error',
        error: err?.response?.data?.error || err?.message,
      });
      refreshList();
      setError(texts.errorUpload);
    } finally {
      setUploading(false);
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
        accept="video/*"
        hidden
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="video/*"
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

      {previewUrl && (
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
            {selectedFile?.name}
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
        {uploading ? texts.uploading : texts.upload}
      </Button>

      {uploading && <LinearProgress sx={{ mb: 3 }} />}

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
              }}
            >
              <ListItemText
                primary={item.name}
                secondary={formatSentAt(item.sentAt, lang)}
                primaryTypographyProps={{ fontWeight: 500 }}
              />
              <Typography
                variant="caption"
                color={item.status === 'ok' ? 'success.main' : 'error.main'}
              >
                {item.status === 'ok' ? texts.statusOk : texts.statusError}
              </Typography>
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
};

export default VideoUploadPage;
