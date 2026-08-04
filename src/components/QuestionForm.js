import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  TextField,
  Typography,
  IconButton,
  Checkbox,
  FormControlLabel,
  Link,
  LinearProgress,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import VideocamIcon from "@mui/icons-material/Videocam";
import HomeButton from "./HomeButton";
import { uploadFileToS3 } from "../api";
import { isVideoUrl, normalizeMediaUrls } from "../utils/media";

const MEDIA_ACCEPT = "image/*,video/*,.mp4,.mov,.m4v,.webm,.3gp";

const messages = {
  ru: {
    comment: "Комментарий",
    links: "Ссылки:",
    photos: "Фото:",
    media: "Медиа:",
    requiredQuestion: "Обязательный вопрос",
    requiredComment: "Обязательный комментарий",
    uploadError: "Не удалось загрузить файл в хранилище",
    uploading: "Загрузка",
  },
  en: {
    comment: "Comment",
    links: "Links:",
    photos: "Photos:",
    media: "Media:",
    requiredQuestion: "Required question",
    requiredComment: "Required comment",
    uploadError: "Failed to upload file to storage",
    uploading: "Uploading",
  },
};

const QuestionForm = ({
  questionIndex,
  answer,
  validationErrors,
  handleChange,
  handleRemovePhoto,
  handleRemoveMedia,
  question,
}) => {
  const {
    lang,
    only_cam_inspector_bot,
    token,
    chatId,
    agent,
    objectId,
    checklistId,
  } = useSelector((state) => state.app);
  const texts = messages[lang] || messages.ru;
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              resolve(
                new File([blob], file.name || "photo.jpg", {
                  type: blob.type || file.type || "image/jpeg",
                })
              );
            },
            file.type || "image/jpeg",
            0.7
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const prepareFile = async (file) => {
    if (file.type?.startsWith("image/")) {
      return resizeImage(file);
    }
    return file;
  };

  const handleFilesChange = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length || uploading) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadError("");

    try {
      const prepared = await Promise.all(files.map((file) => prepareFile(file)));
      const uploaded = [];

      for (let i = 0; i < prepared.length; i += 1) {
        const file = prepared[i];
        const result = await uploadFileToS3(
          token,
          chatId,
          file,
          agent,
          (eventProgress) => {
            if (!eventProgress.total) return;
            const filePart = eventProgress.loaded / eventProgress.total;
            const overall = ((i + filePart) / prepared.length) * 100;
            setUploadProgress(Math.round(overall));
          },
          {
            objectId,
            checklistId,
            questionId: question.id,
          }
        );
        uploaded.push(result);
      }

      const nextPhotos = [...(answer.photos || [])];
      const nextMedia = normalizeMediaUrls(answer.media);

      uploaded.forEach((item) => {
        if (!item?.url) return;
        if (!nextMedia.includes(item.url)) {
          nextMedia.push(item.url);
        }
        if (item.type === "photo" && !nextPhotos.includes(item.url)) {
          nextPhotos.push(item.url);
        }
      });

      handleChange(questionIndex, {
        photos: nextPhotos,
        media: nextMedia,
      });
    } catch (error) {
      console.error("Question media upload error:", error);
      setUploadError(texts.uploadError);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCheckboxChange = (option) => {
    const currentAnswers = answer.text || [];
    if (currentAnswers.includes(option)) {
      handleChange(
        questionIndex,
        "text",
        currentAnswers.filter((item) => item !== option)
      );
    } else {
      handleChange(questionIndex, "text", [...currentAnswers, option]);
    }
  };

  if (!question || !answer) {
    return null;
  }

  const mediaUrls = normalizeMediaUrls(answer.media);
  const photos = Array.isArray(answer.photos) ? answer.photos : [];

  return (
    <Box>
      <Box display="flex" alignItems="start" justifyContent="space-between">
        <Typography
          variant="h5"
          sx={{
            color: "inherit",
            marginBottom: 2,
          }}
        >
          {`${questionIndex + 1}. ${question.text}`}
          {question.requirePhoto && (
            <PhotoCameraIcon
              sx={{
                margin: "0 0 10px 4px",
                color: "red",
                width: 16,
                height: 16,
              }}
            />
          )}
        </Typography>
        <HomeButton />
      </Box>
      <Box sx={{ marginBottom: 2 }}>
        {question.optionDescriptions.map((desc, index) => (
          <Typography
            variant="body2"
            sx={{
              color: "inherit",
            }}
            key={index}
          >
            <b>{desc.values}:</b> {desc.values_description}
          </Typography>
        ))}
      </Box>
      {question.required && (
        <Chip
          label={texts.requiredQuestion}
          size="small"
          color="error"
          variant="outlined"
          sx={{ mb: 1 }}
        />
      )}
      <Box>
        {question &&
          question.options.map((option, index) =>
            question.multi === "single" ? (
              <Chip
                key={index}
                label={option}
                onClick={() => handleChange(questionIndex, "text", option)}
                color={answer.text === option ? "primary" : "default"}
                clickable
                sx={{ m: 1 }}
              />
            ) : (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={
                      Array.isArray(answer.text) &&
                      answer.text.includes(option)
                    }
                    onChange={() => handleCheckboxChange(option)}
                  />
                }
                label={option}
              />
            )
          )}
      </Box>

      {question.links && question.links.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">{texts.links}</Typography>
          {question.links.map((linkObj, index) => (
            <Typography key={index} sx={{ mb: 1 }}>
              {linkObj.link !== "Без ссылки" ? (
                <Link href={linkObj.link} target="_blank" rel="noopener">
                  {linkObj.name}
                </Link>
              ) : (
                linkObj.name
              )}
            </Typography>
          ))}
        </Box>
      )}

      {question.has_comments && (
        <TextField
          label={texts.comment}
          fullWidth
          value={answer.comment}
          onChange={(e) =>
            handleChange(questionIndex, "comment", e.target.value)
          }
          margin="normal"
          required={question.requireComment}
          error={question.requireComment && !answer.comment}
        />
      )}

      {question.has_files && (
        <Button
          variant="contained"
          component="label"
          color={question.requirePhoto ? "error" : "primary"}
          disabled={uploading}
          sx={{
            mt: 2,
            mr: 1,
            display: { xs: "inline-flex", md: "none" },
          }}
        >
          {uploading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            <AddAPhotoIcon />
          )}
          <input
            type="file"
            hidden
            multiple
            onChange={handleFilesChange}
            accept={MEDIA_ACCEPT}
            capture="environment"
          />
        </Button>
      )}

      {question.has_files && !only_cam_inspector_bot && (
        <Button
          variant="contained"
          component="label"
          color={question.requirePhoto ? "error" : "primary"}
          disabled={uploading}
          sx={{ mt: 2, mr: 1 }}
        >
          {uploading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            <AddPhotoAlternateIcon />
          )}
          <input
            type="file"
            hidden
            multiple
            onChange={handleFilesChange}
            accept={MEDIA_ACCEPT}
          />
        </Button>
      )}

      {question.has_files && (
        <Button
          variant="contained"
          component="label"
          color="primary"
          disabled={uploading}
          sx={{ mt: 2 }}
        >
          {uploading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            <VideocamIcon />
          )}
          <input
            type="file"
            hidden
            multiple
            onChange={handleFilesChange}
            accept="video/*,.mp4,.mov,.m4v,.webm,.3gp"
            capture="environment"
          />
        </Button>
      )}

      {uploading && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption">
            {texts.uploading} {uploadProgress}%
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {uploadError && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {uploadError}
        </Typography>
      )}

      {photos.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography>{texts.photos}</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            {photos.map((photo, index) => {
              const photoSrc =
                typeof photo === "string" ? photo : URL.createObjectURL(photo);

              return (
                <Box key={index} sx={{ position: "relative", m: 1 }}>
                  <img
                    src={photoSrc}
                    alt="Preview"
                    style={{ maxHeight: "200px", maxWidth: "200px" }}
                  />
                  <IconButton
                    color="secondary"
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      color: "red",
                    }}
                    onClick={() => handleRemovePhoto(questionIndex, index)}
                    disabled={uploading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {mediaUrls.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography>{texts.media}</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
            {mediaUrls.map((url, index) => (
              <Box
                key={`${url}-${index}`}
                sx={{
                  position: "relative",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                }}
              >
                {isVideoUrl(url) ? (
                  <video
                    src={url}
                    controls
                    preload="metadata"
                    style={{
                      width: "100%",
                      maxHeight: 220,
                      borderRadius: 4,
                      background: "#000",
                    }}
                  />
                ) : (
                  <img
                    src={url}
                    alt="Media"
                    style={{ maxHeight: 200, maxWidth: "100%" }}
                  />
                )}
                <Typography
                  variant="body2"
                  sx={{ mt: 0.5, wordBreak: "break-all" }}
                >
                  <Link href={url} target="_blank" rel="noopener noreferrer">
                    {url}
                  </Link>
                </Typography>
                {handleRemoveMedia && (
                  <IconButton
                    color="secondary"
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      color: "red",
                      backgroundColor: "rgba(255,255,255,0.8)",
                    }}
                    onClick={() => handleRemoveMedia(questionIndex, index)}
                    disabled={uploading}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {validationErrors?.photo && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {texts.requiredQuestion}
        </Typography>
      )}
    </Box>
  );
};

export default QuestionForm;
