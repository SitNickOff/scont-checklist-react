import { useState, useRef, useCallback } from "react";
import { sendDraftAnswer, doneDraft } from "../api";

export const useQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isReview, setIsReview] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [maxSteps, setMaxSteps] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Ref для хранения debounce таймеров
  const debounceTimers = useRef({});

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

  const handleNext = async (token, chatId, objectId, checklistId, draftId, setDraftId) => {
    // Сохраняем текущий ответ перед переходом (только если вопросы загружены)
    if (!isReview && answers[activeStep] && questions.length > 0 && questions[activeStep]) {
      await saveAnswerToDraft(
        answers[activeStep],
        questions[activeStep].id,
        token,
        chatId,
        objectId,
        checklistId,
        draftId,
        setDraftId
      );
    }
    
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

  const convertFileToBase64 = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }, []);

  const saveAnswerToDraft = async (
    answer,
    questionId,
    token,
    chatId,
    objectId,
    checklistId,
    draftId,
    setDraftId
  ) => {
    try {
      // Конвертируем фотографии в base64
      const photos = await Promise.all(
        (answer.photos || []).map((photo) => {
          // Если уже base64 строка, возвращаем как есть
          if (typeof photo === 'string') {
            return photo;
          }
          // Иначе конвертируем Blob в base64
          return convertFileToBase64(photo);
        })
      );

      const answerData = {
        text: answer.text !== undefined ? answer.text : (Array.isArray(answer.text) ? [] : ""),
        comment: answer.comment || "",
        photos: photos,
        questionId: questionId || answer.questionId,
      };

      const response = await sendDraftAnswer(
        token,
        chatId || "",
        answerData,
        objectId,
        checklistId,
        draftId,
        questionId || answer.questionId
      );

      // Если получили draft_id - сохранить в Redux
      if (response.draft_id && !draftId) {
        setDraftId(response.draft_id);
      }
    } catch (error) {
      console.error("Ошибка сохранения черновика:", error);
      // Продолжаем без сохранения при ошибке
    }
  };

  const debouncedSaveAnswer = useCallback((
    answer,
    questionId,
    token,
    chatId,
    objectId,
    checklistId,
    draftId,
    setDraftId
  ) => {
    const timerKey = questionId || 'default';
    
    // Очищаем предыдущий таймер для этого вопроса
    if (debounceTimers.current[timerKey]) {
      clearTimeout(debounceTimers.current[timerKey]);
    }
    
    // Устанавливаем новый таймер
    debounceTimers.current[timerKey] = setTimeout(async () => {
      try {
        // Конвертируем фотографии в base64
        const photos = await Promise.all(
          (answer.photos || []).map((photo) => {
            // Если уже base64 строка, возвращаем как есть
            if (typeof photo === 'string') {
              return photo;
            }
            // Иначе конвертируем Blob в base64
            return convertFileToBase64(photo);
          })
        );

        const answerData = {
          text: answer.text !== undefined ? answer.text : (Array.isArray(answer.text) ? [] : ""),
          comment: answer.comment || "",
          photos: photos,
          questionId: questionId || answer.questionId,
        };

        const response = await sendDraftAnswer(
          token,
          chatId || "",
          answerData,
          objectId,
          checklistId,
          draftId,
          questionId || answer.questionId
        );

        // Если получили draft_id - сохранить в Redux
        if (response.draft_id && !draftId) {
          setDraftId(response.draft_id);
        }
      } catch (error) {
        console.error("Ошибка сохранения черновика:", error);
        // Продолжаем без сохранения при ошибке
      }
      delete debounceTimers.current[timerKey];
    }, 1000); // Debounce 1 секунда
  }, [convertFileToBase64]);

  const handleSave = async (chatId, token, selectedUnit, selectedModel, draftId, clearDraftId) => {
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
        
        // Если есть draft_id, используем /draft/done
        if (draftId) {
          const response = await doneDraft(token, chatId || "", draftId);
          console.log({ response });
          
          // Очищаем draft_id после успешного завершения
          if (response.status === "ok" && clearDraftId) {
            clearDraftId();
          }
          
          setLoading(false);
          setSuccess(true);
        } else {
          // Fallback на старый метод, если draft_id нет (не должно происходить)
          alert("Ошибка: черновик не найден. Пожалуйста, попробуйте снова.");
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        alert("Ошибка при отправке. Пожалуйста, попробуйте снова.");
      }
    }
  };

  const handleChange = (
    index,
    field,
    value,
    token,
    chatId,
    objectId,
    checklistId,
    draftId,
    setDraftId
  ) => {
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[index][field] = value;
      
      // Автосохранение с debounce (только если вопросы загружены)
      if (token && questions.length > 0 && questions[index]) {
        debouncedSaveAnswer(
          newAnswers[index],
          questions[index].id,
          token,
          chatId,
          objectId,
          checklistId,
          draftId,
          setDraftId
        );
      }
      
      return newAnswers;
    });
  };

  const handleEdit = (index) => {
    setActiveStep(index);
    setIsReview(false);
  };

  const handleRemovePhoto = (
    index,
    photoIndex,
    token,
    chatId,
    objectId,
    checklistId,
    draftId,
    setDraftId
  ) => {
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[index].photos = newAnswers[index].photos.filter(
        (_, i) => i !== photoIndex
      );
      
      // Автосохранение после удаления фото (только если вопросы загружены)
      if (token && questions.length > 0 && questions[index]) {
        debouncedSaveAnswer(
          newAnswers[index],
          questions[index].id,
          token,
          chatId,
          objectId,
          checklistId,
          draftId,
          setDraftId
        );
      }
      
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
