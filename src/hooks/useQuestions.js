import { useState } from "react";
import axios from "axios";

export const useQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isReview, setIsReview] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [maxSteps, setMaxSteps] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateAnswers = (answers) => {
    return answers.map((answer, index) => {
      const question = questions[index];
      const isTextValid = question.required 
        ? Array.isArray(answer.text)
          ? answer.text.length > 0 // Для массива проверяем, что есть выбранные элементы
          : answer.text.trim() !== "" // Для строки проверяем, что она не пустая
        : true; // Если required=false, текст не проверяется.
  
      const isCommentValid =
        !question.requireComment || answer.comment.trim() !== "";
      const isPhotoValid = !question.requirePhoto || answer.photos.length > 0;
  
      return {
        text: !isTextValid,
        comment: !isCommentValid,
        photo: !isPhotoValid,
      };
    });
  };

  const handleNext = () => {
    if (isReview) {
      setIsReview(false);
      setActiveStep(0);
    } else if (activeStep === questions.length - 1) {
      setActiveStep(0);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    if (isReview) {
      setIsReview(false);
    } else if (activeStep === 0) {
      setActiveStep(questions.length - 1);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const handleReview = () => {
    const errors = validateAnswers(answers);
    setValidationErrors(errors);
    setIsReview(true);
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async (chatId, token, selectedUnit, selectedModel) => {
    const errors = validateAnswers(answers);
    setValidationErrors(errors);
    const hasErrors = errors.some(
      (error) => error.text || error.comment || error.photo
    );

    if (hasErrors) {
      alert("Пожалуйста заполните все обязательные поля.");
    } else {
      try {
        setLoading(true);
        const answersWithBase64Photos = await Promise.all(
          answers.map(async (answer) => {
            const photos = await Promise.all(
              answer.photos.map((photo) => convertFileToBase64(photo))
            );
            return {
              ...answer,
              photos,
            };
          })
        );

        const url = "https://server.salescontrol.kz/api/questions/done";

        const data = {
          token,
          chat_id: chatId,
          selected_unit: selectedUnit,
          selected_model: selectedModel,
          answers: answersWithBase64Photos,
        };

        const response = await axios.post(url, data);

        console.log({ response });

        setLoading(false);
        // navigate("/");
        setSuccess(true);
      } catch (error) {
        setLoading(false);
        alert("Ошибка при отправке. Пожалуйста, попробуйте снова.");
      }
    }
  };

  const handleChange = (index, field, value) => {
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[index][field] = value;
      return newAnswers;
    });
  };

  const handleEdit = (index) => {
    setActiveStep(index);
    setIsReview(false);
  };

  const handleRemovePhoto = (index, photoIndex) => {
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[index].photos = newAnswers[index].photos.filter(
        (_, i) => i !== photoIndex
      );
      return newAnswers;
    });
  };

  return {
    setAnswers,
    questions,
    setQuestions,
    activeStep,
    answers,
    isReview,
    validationErrors,
    handleNext,
    handleBack,
    handleReview,
    handleSave,
    handleChange,
    handleEdit,
    handleRemovePhoto,
    maxSteps,
    setMaxSteps,
    loading,
    success,
    setSuccess,
  };
};
