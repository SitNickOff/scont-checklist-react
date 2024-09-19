import React from "react";
import {
  Box,
  Button,
  Chip,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";

const QuestionForm = ({
  questionIndex,
  answer,
  validationErrors,
  handleChange,
  handleRemovePhoto,
  question,
}) => {
  const navigate = useNavigate();

  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 800; // Задаем максимальную ширину
          const maxHeight = 800; // Задаем максимальную высоту
          let width = img.width;
          let height = img.height;

          // Сохранение пропорций
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Преобразование изображения обратно в файл
          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            file.type,
            0.7
          ); // Сжимаем до 70% качества
        };
      };
    });
  };

  const handleFilesChange = async (event) => {
    const files = Array.from(event.target.files);
    const resizedFiles = await Promise.all(
      files.map((file) => resizeImage(file))
    );
    handleChange(questionIndex, "photos", [...answer.photos, ...resizedFiles]);
  };

  const handleGoHome = () => navigate("/");

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
        <IconButton color="primary" onClick={handleGoHome}>
          <HomeIcon />
        </IconButton>
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
      <Box>
        {question.options.map((option, index) => (
          <Chip
            key={index}
            label={option}
            onClick={() => handleChange(questionIndex, "text", option)}
            color={answer.text === option ? "primary" : "default"}
            clickable
            sx={{ m: 1 }}
          />
        ))}
      </Box>
      <TextField
        label="Комментарий"
        fullWidth
        value={answer.comment}
        onChange={(e) => handleChange(questionIndex, "comment", e.target.value)}
        margin="normal"
        required={question.requireComment}
      />
      <Button variant="contained" component="label" sx={{ mt: 2 }}>
        Загрузить фото
        <input
          type="file"
          hidden
          multiple
          onChange={handleFilesChange}
          accept="image/*" // Ограничение на изображения
          capture="camera" // Открытие камеры по умолчанию
        />
      </Button>
      {answer.photos && answer.photos.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography>Фото:</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            {answer.photos.map((photo, index) => (
              <Box key={index} sx={{ position: "relative", m: 1 }}>
                <img
                  src={URL.createObjectURL(photo)}
                  alt="Preview"
                  style={{ maxHeight: "200px", maxWidth: "200px" }}
                />
                <IconButton
                  variant="contained"
                  color="secondary"
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    color: "red",
                  }}
                  onClick={() => handleRemovePhoto(questionIndex, index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default QuestionForm;
