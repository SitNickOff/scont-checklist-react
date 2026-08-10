import { useState, useRef, useCallback } from "react";
import { sendDraftAnswer, doneDraft } from "../api";
import { hasRequiredPhotoMedia, normalizeMediaUrls } from "../utils/media";

export const useQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isReview, setIsReview] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [maxSteps, setMaxSteps] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const debounceTimers = useRef({});
  const generatedDraftIdRef = useRef(null);

  const buildAnswerPayload = useCallback((answer, questionId) => {
    const photos = (answer.photos || [])
      .map((photo) => (typeof photo === "string" ? photo : null))
      .filter(Boolean);
    const media = normalizeMediaUrls(answer.media);

    return {
      text: answer.text !== undefined && answer.text !== null ? answer.text : "",
      comment: answer.comment || "",
      photos,
      media,
      questionId: questionId || answer.questionId,
    };
  }, []);

  const validateAnswers = (answersList) => {
    return answersList.map((answer, index) => {
      const question = questions[index];
      const isTextValid = question.required
        ? Array.isArray(answer.text)
          ? answer.text.length > 0
          : answer.text.trim() !== ""
        : true;

      const isCommentValid =
        !question.requireComment || answer.comment.trim() !== "";
      const isPhotoValid =
        !question.requirePhoto || hasRequiredPhotoMedia(answer);

      return {
        text: !isTextValid,
        comment: !isCommentValid,
        photo: !isPhotoValid,
      };
    });
  };

  const handleNext = async (
    token,
    chatId,
    agent,
    objectId,
    checklistId,
    draftId,
    setDraftId
  ) => {
    if (
      !isReview &&
      answers[activeStep] &&
      questions.length > 0 &&
      questions[activeStep]
    ) {
      await saveAnswerToDraft(
        answers[activeStep],
        questions[activeStep].id,
        token,
        chatId,
        agent,
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

  const generateDraftId = useCallback((chatId) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
    return `${timestamp}_${chatId || "unknown"}`;
  }, []);

  const resolveDraftId = useCallback(
    (draftId, chatId, setDraftId) => {
      let currentDraftId = draftId;
      if (!currentDraftId) {
        if (!generatedDraftIdRef.current) {
          generatedDraftIdRef.current = generateDraftId(chatId);
        }
        currentDraftId = generatedDraftIdRef.current;
        if (setDraftId) {
          setDraftId(currentDraftId);
        }
      }
      return currentDraftId;
    },
    [generateDraftId]
  );

  const persistAnswer = useCallback(
    async (
      answer,
      questionId,
      token,
      chatId,
      agent,
      objectId,
      checklistId,
      draftId,
      setDraftId
    ) => {
      const currentDraftId = resolveDraftId(draftId, chatId, setDraftId);
      const answerData = buildAnswerPayload(answer, questionId);

      const response = await sendDraftAnswer(
        token,
        chatId || "",
        answerData,
        objectId,
        checklistId,
        currentDraftId,
        questionId || answer.questionId,
        agent
      );

      if (response.draft_id && response.draft_id !== currentDraftId) {
        if (setDraftId) {
          setDraftId(response.draft_id);
        }
        generatedDraftIdRef.current = response.draft_id;
      }
    },
    [buildAnswerPayload, resolveDraftId]
  );

  const saveAnswerToDraft = async (
    answer,
    questionId,
    token,
    chatId,
    agent,
    objectId,
    checklistId,
    draftId,
    setDraftId
  ) => {
    try {
      await persistAnswer(
        answer,
        questionId,
        token,
        chatId,
        agent,
        objectId,
        checklistId,
        draftId,
        setDraftId
      );
    } catch (error) {
      console.error("Ошибка сохранения черновика:", error);
    }
  };

  const debouncedSaveAnswer = useCallback(
    (
      answer,
      questionId,
      token,
      chatId,
      agent,
      objectId,
      checklistId,
      draftId,
      setDraftId
    ) => {
      const timerKey = questionId || "default";

      if (debounceTimers.current[timerKey]) {
        clearTimeout(debounceTimers.current[timerKey]);
      }

      debounceTimers.current[timerKey] = setTimeout(async () => {
        try {
          await persistAnswer(
            answer,
            questionId,
            token,
            chatId,
            agent,
            objectId,
            checklistId,
            draftId,
            setDraftId
          );
        } catch (error) {
          console.error("Ошибка сохранения черновика:", error);
        }
        delete debounceTimers.current[timerKey];
      }, 1000);
    },
    [persistAnswer]
  );

  const handleSave = async (
    chatId,
    token,
    agent,
    selectedUnit,
    selectedModel,
    draftId,
    clearDraftId
  ) => {
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

        if (draftId) {
          const response = await doneDraft(
            token,
            chatId || "",
            draftId,
            agent,
            questions
          );
          console.log({ response });

          if (response.status === "ok") {
            if (clearDraftId) {
              clearDraftId();
            }
            generatedDraftIdRef.current = null;
            setLoading(false);
            setSuccess(true);
          } else {
            setLoading(false);
            alert(
              "Ошибка при завершении черновика. Пожалуйста, попробуйте снова."
            );
          }
        } else {
          alert("Ошибка: черновик не найден. Пожалуйста, попробуйте снова.");
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        if (error && error.code === "INCOMPLETE_DRAFT") {
          alert(error.message);
        } else {
          alert("Ошибка при отправке. Пожалуйста, попробуйте снова.");
        }
      }
    }
  };

  const handleChange = (
    index,
    field,
    value,
    token,
    chatId,
    agent,
    objectId,
    checklistId,
    draftId,
    setDraftId
  ) => {
    const patch =
      field && typeof field === "object" && value === undefined
        ? field
        : { [field]: value };

    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[index] = {
        ...newAnswers[index],
        ...patch,
      };

      if (token && questions.length > 0 && questions[index]) {
        debouncedSaveAnswer(
          newAnswers[index],
          questions[index].id,
          token,
          chatId,
          agent,
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
    agent,
    objectId,
    checklistId,
    draftId,
    setDraftId
  ) => {
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      const current = { ...newAnswers[index] };
      const photos = [...(current.photos || [])];
      const removedUrl = photos[photoIndex];
      current.photos = photos.filter((_, i) => i !== photoIndex);
      if (removedUrl && typeof removedUrl === "string") {
        current.media = normalizeMediaUrls(current.media).filter(
          (url) => url !== removedUrl
        );
      }
      newAnswers[index] = current;

      if (token && questions.length > 0 && questions[index]) {
        debouncedSaveAnswer(
          newAnswers[index],
          questions[index].id,
          token,
          chatId,
          agent,
          objectId,
          checklistId,
          draftId,
          setDraftId
        );
      }

      return newAnswers;
    });
  };

  const handleRemoveMedia = (
    index,
    mediaIndex,
    token,
    chatId,
    agent,
    objectId,
    checklistId,
    draftId,
    setDraftId
  ) => {
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      const current = { ...newAnswers[index] };
      const media = normalizeMediaUrls(current.media);
      const removedUrl = media[mediaIndex];
      current.media = media.filter((_, i) => i !== mediaIndex);
      if (removedUrl) {
        current.photos = (current.photos || []).filter(
          (photo) => photo !== removedUrl
        );
      }
      newAnswers[index] = current;

      if (token && questions.length > 0 && questions[index]) {
        debouncedSaveAnswer(
          newAnswers[index],
          questions[index].id,
          token,
          chatId,
          agent,
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
    handleRemoveMedia,
    maxSteps,
    setMaxSteps,
    loading,
    success,
    setSuccess,
  };
};
