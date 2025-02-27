import React from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import HomeButton from "./HomeButton";

const messages = {
  ru: {
    previewTitle: "Превью вопросов",
    edit: "Редактировать",
    fill: "Заполнить",
    startFilling: "Начать заполнение",
    finish: "Завершить",
  },
  en: {
    previewTitle: "Preview Questions",
    edit: "Edit",
    fill: "Fill in",
    startFilling: "Start Filling",
    finish: "Finish",
  },
};

const Preview = ({
  answers,
  handleEdit,
  questions,
  setIsPreview,
  handleReview
}) => {
  const { lang } = useSelector((state) => state.app);
  const texts = messages[lang];

  return (
    <Box sx={{ p: 2 }}>
      <Box display="flex" alignItems="start" justifyContent="space-between">
        <Typography variant="h5" sx={{ mb: 2 }}>
          {texts.previewTitle}
        </Typography>
        <HomeButton />
      </Box>
      
      <Box>
        {questions.map((question, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{question.text}</Typography>
              {/* <Typography>{question.text}</Typography> */}
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
                ) ? texts.edit : texts.fill}
                
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
          { texts.startFilling }
        </Button>
        <Button variant="contained" color="primary" onClick={handleReview}>
        { texts.finish }
        </Button>
      </Box>
    </Box>
  );
}

export default Preview;