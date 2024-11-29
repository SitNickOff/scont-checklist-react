import React from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import HomeButton from "./HomeButton";

const Preview = ({
  answers,
  handleEdit,
  questions,
  setIsPreview,
  handleReview
}) => {
  return (
    <Box sx={{ p: 2 }}>
      <Box display="flex" alignItems="start" justifyContent="space-between">
        <Typography variant="h5" sx={{ mb: 2 }}>
          Превью вопросов
        </Typography>
        <HomeButton />
      </Box>
      
      <Box>
        {questions.map((question, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{question.name}</Typography>
              <Typography>{question.text}</Typography>
              <Button
                variant="contained"
                color={(Array.isArray(answers[index].text)
                  ? answers[index].text.length > 0 // Для массива проверяем, что есть выбранные элементы
                  : answers[index].text.trim() !== "" // Для строки проверяем, что она не пустая
                ) ? "primary" : "secondary"}
                onClick={() => {
                  setIsPreview(false);
                  handleEdit(index);
                }}
                sx={{ mt: 2 }}
              >
                {(Array.isArray(answers[index].text)
                  ? answers[index].text.length > 0 // Для массива проверяем, что есть выбранные элементы
                  : answers[index].text.trim() !== "" // Для строки проверяем, что она не пустая
                ) ? "Редактировать" : "Заполнить"}
                
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsPreview(false)}
        >
          Начать заполнение
        </Button>
        <Button variant="contained" color="primary" onClick={handleReview}>
          Завершить
        </Button>
      </Box>
    </Box>
  );
}

export default Preview;