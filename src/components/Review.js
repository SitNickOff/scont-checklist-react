import React from "react";
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

const Review = ({
  answers,
  validationErrors,
  handleEdit,
  handleSave,
  questions,
  loading,
}) => {
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
          <Typography variant="h5">Результаты заполнения чек-листа</Typography>
          <HomeButton />
        </Box>
        {answers.map((answer, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>{`${index + 1}. ${
                questions[index].text
              }`}</Typography>
              {answer.text && <Typography>Ответ: {answer.text}</Typography>}
              {validationErrors[index]?.text && (
                <Alert severity="error">Требуется ответ</Alert>
              )}
              {answer.comment && (
                <Typography>Комментарий: {answer.comment}</Typography>
              )}
              {validationErrors[index]?.comment && (
                <Alert severity="error">Требуется комментарий</Alert>
              )}
              {answer.photos && answer.photos.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography>Фото:</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                    {answer.photos.map((photo, i) => (
                      <Box key={i} sx={{ position: "relative", m: 1 }}>
                        <img
                          src={URL.createObjectURL(photo)}
                          alt="Preview"
                          style={{ maxHeight: "200px", maxWidth: "200px" }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              {validationErrors[index]?.photo && (
                <Alert severity="error">Требуется фото</Alert>
              )}
            </CardContent>
            <CardActions>
              <Button onClick={() => handleEdit(index)} disabled={loading}>
                Редактировать
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
          Сохранить (Завершить)
        </Button>
      </Box>
    </Box>
  );
};

export default Review;
