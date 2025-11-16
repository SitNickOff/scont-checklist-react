import React from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Chip,
  TextField,
  Typography,
  IconButton,
  Checkbox,
  FormControlLabel,
  Link,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import HomeButton from "./HomeButton";

const messages = {
  ru: {
    comment: "Комментарий",
    links: "Ссылки:",
    photos: "Фото:",
    requiredQuestion: "Обязательный вопрос",
    requiredComment: "Обязательный комментарий",
  },
  en: {
    comment: "Comment",
    links: "Links:",
    photos: "Photos:",
    requiredQuestion: "Required question",
    requiredComment: "Required comment",
  },
};

const QuestionForm = ({
  questionIndex,
  answer,
  validationErrors,
  handleChange,
  handleRemovePhoto,
  question,
}) => {
  const { lang, only_cam_inspector_bot } = useSelector((state) => state.app);
  const texts = messages[lang];

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

  // const handleGoHome = () => navigate("/");

  const handleCheckboxChange = (option) => {
    const currentAnswers = answer.text || []; // Массив текущих ответов
    if (currentAnswers.includes(option)) {
      // Удалить из массива, если уже выбрано
      handleChange(
        questionIndex,
        "text",
        currentAnswers.filter((item) => item !== option)
      );
    } else {
      // Добавить в массив
      handleChange(questionIndex, "text", [...currentAnswers, option]);
    }
  };

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
        {/* <IconButton color="primary" onClick={handleGoHomeClick}>
          <HomeIcon />
        </IconButton> */}
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
        {question && question.options.map((option, index) => (
          question.multi === 'single'
            ? <Chip
              key={index}
              label={option}
              onClick={() => handleChange(questionIndex, "text", option)}
              color={answer.text === option ? "primary" : "default"}
              clickable
              sx={{ m: 1 }}
            />
            : <FormControlLabel 
              key={index} 
              control={<Checkbox 
                checked={answer.text?.includes(option) || false}
                onChange={() => handleCheckboxChange(option)}
              />} 
              label={option} 
            />
        ))}
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

      <TextField
        label={texts.comment}
        fullWidth
        value={answer.comment}
        onChange={(e) => handleChange(questionIndex, "comment", e.target.value)}
        margin="normal"
        required={question.requireComment}
        error={question.requireComment && !answer.comment}
      />
      <Button variant="contained" component="label" sx={{ mt: 2, mr: 1 }}>
        <AddAPhotoIcon
          sx={
            {
              // margin: "0 0 10px 4px",
              // color: "red",
              // width: 16,
              // height: 16,
            }
          }
        />
        <input
          type="file"
          hidden
          multiple
          onChange={handleFilesChange}
          accept="image/*" // Ограничение на изображения
          capture // ="environment" // Открытие камеры по умолчанию
        />
      </Button>
      {!only_cam_inspector_bot && <Button variant="contained" component="label" sx={{ mt: 2 }}>
        <AddPhotoAlternateIcon
          sx={
            {
              // margin: "0 0 10px 4px",
              // color: "red",
              // width: 16,
              // height: 16,
            }
          }
        />
        <input
          type="file"
          hidden
          multiple
          onChange={handleFilesChange}
          accept="image/*" // Ограничение на изображения
          // capture // ="environment" // Открытие камеры по умолчанию
        />
      </Button>}
      {answer.photos && answer.photos.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography>{texts.photos}</Typography>
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
