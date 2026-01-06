import React from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Typography,
  Alert,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
} from "@mui/material";
import HomeButton from "./HomeButton";

const messages = {
  ru: {
    reviewTitle: "Результаты заполнения чек-листа",
    answer: "Ответ:",
    comment: "Комментарий:",
    photo: "Фото:",
    edit: "Редактировать",
    save: "Сохранить (Завершить)",
    errorText: "Требуется ответ",
    errorComment: "Требуется комментарий",
    errorPhoto: "Требуется фото",
  },
  en: {
    reviewTitle: "Checklist Completion Results",
    answer: "Answer:",
    comment: "Comment:",
    photo: "Photos:",
    edit: "Edit",
    save: "Save (Finish)",
    errorText: "Answer required",
    errorComment: "Comment required",
    errorPhoto: "Photo required",
  },
};

const Review = ({
  answers,
  validationErrors,
  handleEdit,
  handleSave,
  questions,
  loading,
}) => {
  const { lang } = useSelector((state) => state.app);
  const texts = messages[lang];

  return (
    <Box sx={{ position: "relative" }}>
      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={60} />
        </Box>
      )}

      <Box
        sx={{
          filter: loading ? "blur(2px)" : "none",
          pointerEvents: loading ? "none" : "auto",
        }}
      >
        <Box display="flex" alignItems="start" justifyContent="space-between">
          <Typography variant="h5">{texts.reviewTitle}</Typography>
          <HomeButton />
        </Box>
        {answers.map((answer, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>{`${index + 1}. ${
                questions[index].text
              }`}</Typography>
              {answer.text && <Typography>{texts.answer} {answer.text}</Typography>}
              {validationErrors[index]?.text && (
                <Alert severity="error">{texts.errorText}</Alert>
              )}
              {answer.comment && (
                <Typography>{texts.comment} {answer.comment}</Typography>
              )}
              {validationErrors[index]?.comment && (
                <Alert severity="error">{texts.errorComment}</Alert>
              )}
              {answer.photos && answer.photos.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography>{texts.photo}</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                    {answer.photos.map((photo, i) => {
                      // Если photo - это base64 строка, используем напрямую, иначе создаем ObjectURL
                      const photoSrc = typeof photo === 'string' 
                        ? photo 
                        : URL.createObjectURL(photo);
                      
                      return (
                        <Box key={i} sx={{ position: "relative", m: 1 }}>
                          <img
                            src={photoSrc}
                            alt="Preview"
                            style={{ maxHeight: "200px", maxWidth: "200px" }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
              {validationErrors[index]?.photo && (
                <Alert severity="error">{texts.errorPhoto}</Alert>
              )}
            </CardContent>
            <CardActions>
              <Button onClick={() => handleEdit(index)} disabled={loading}>
                {texts.edit}
              </Button>
            </CardActions>
          </Card>
        ))}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={
            validationErrors.some(
              (error) => error.text || error.comment || error.photo
            ) || loading
          }
          fullWidth
        >
          {texts.save}
        </Button>
      </Box>
    </Box>
  );
};

export default Review;
