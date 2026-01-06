import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setDraftId } from "../store";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MobileStepper,
  Snackbar,
} from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { useQuestions } from "../hooks/useQuestions";
import { getQuestions, getDraftAnswer } from "../api";
import QuestionForm from "./QuestionForm";
import Review from "./Review";
import { useNavigate } from "react-router-dom";
import Preview from "./Preview";

const messages = {
  ru: {
    dataSaved: "Данные успешно сохранены!",
    forward: "Вперед",
    back: "Назад",
    toList: "К списку",
    finish: "Завершить",
    question: "Вопрос"
  },
  en: {
    dataSaved: "Data successfully saved!",
    forward: "Forward",
    back: "Back",
    toList: "To list",
    finish: "Finish",
    question: "Question"
  },
};

const QuestionsStepper = () => {
  const [loading, setLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(true); // Управление первым превью
  const [loadingAnswer, setLoadingAnswer] = useState(false); // Загрузка ответа на текущий вопрос
  const [loadingPreviewAnswers, setLoadingPreviewAnswers] = useState(false); // Загрузка всех ответов для Preview
  const loadedQuestionIdsRef = useRef(new Set()); // Кеш загруженных вопросов
  const { chatId, token, objectId, checklistId, lang, draftId } = useSelector(
    (state) => state.app
  );
  const texts = messages[lang];
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const {
    questions,
    setQuestions,
    activeStep,
    setAnswers,
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
    loading: savingLoading,
    success,
    setSuccess,
  } = useQuestions();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuestions(token, chatId, checklistId);

        const questionsData = data.map((i, index) => ({
          id: i.yardstick,
          name: `${texts.question} ${index + 1}`,
          text: i.yardstick_name_for_report,
          options: [...i.scores],
          optionDescriptions: i.teh_values_descriptions
            ? [...i.teh_values_descriptions]
            : [],
          requireComment: i.req_comments,
          requirePhoto: i.req_files,
          required: i.required,
          multi: i.multi,
          links: i.links
        }));

        setQuestions(questionsData);
        
        const initialAnswers = data.map((i) => ({
          text: i.multi === "single" ? "" : [],
          comment: "",
          photos: [],
          questionId: i.yardstick,
        }));
        
        setAnswers(initialAnswers);
        setMaxSteps(data.length);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [checklistId, chatId, token, setAnswers, setMaxSteps, setQuestions, texts.question]);

  const handleSnackbarClose = () => {
    setSuccess(false);
    navigate("/");
  };

  const handleReviewInPreview = () => {
    setIsPreview(false);
    handleReview();
  }

  // Загружаем все ответы при открытии Preview
  useEffect(() => {
    const loadAllAnswersForPreview = async () => {
      // Загружаем только если открыт Preview, есть вопросы, draftId и еще не загружены все ответы
      if (!isPreview || !questions.length || !draftId || loading) {
        return;
      }

      // Проверяем, загружены ли уже все ответы
      const allLoaded = questions.every(q => loadedQuestionIdsRef.current.has(q.id));
      if (allLoaded) {
        return;
      }

      setLoadingPreviewAnswers(true);
      try {
        const savedAnswers = await Promise.all(
          questions.map((q) =>
            getDraftAnswer(token, chatId || "", draftId, q.id)
          )
        );

        // Обновляем все ответы
        setAnswers((prevAnswers) => {
          const newAnswers = [...prevAnswers];
          
          savedAnswers.forEach((saved, index) => {
            if (saved && saved.status === "ok" && saved.value) {
              const question = questions[index];
              if (!question) return;

              // Если value - массив, находим нужный элемент по questionId
              let savedValue = saved.value;
              if (Array.isArray(saved.value)) {
                savedValue = saved.value.find(
                  (item) => item.questionId === question.id
                ) || saved.value[0] || null;
              }

              if (savedValue) {
                const answerIndex = prevAnswers.findIndex(
                  (a) => a.questionId === question.id
                );

                if (answerIndex !== -1) {
                  newAnswers[answerIndex] = {
                    ...newAnswers[answerIndex],
                    text: savedValue.text !== undefined ? savedValue.text : newAnswers[answerIndex].text,
                    comment: savedValue.comment !== undefined ? savedValue.comment : newAnswers[answerIndex].comment,
                    photos: Array.isArray(savedValue.photos) ? savedValue.photos : (savedValue.photos || newAnswers[answerIndex].photos),
                  };
                }

                // Добавляем в кеш
                loadedQuestionIdsRef.current.add(question.id);
              }
            }
          });

          return newAnswers;
        });
      } catch (error) {
        console.error("Ошибка загрузки сохраненных ответов для Preview:", error);
      } finally {
        setLoadingPreviewAnswers(false);
      }
    };

    loadAllAnswersForPreview();
  }, [isPreview, questions, draftId, token, chatId, loading, setAnswers]);

  // Загружаем ответ на вопрос при открытии формы вопроса
  useEffect(() => {
    const loadAnswerForQuestion = async () => {
      // Пропускаем загрузку, если вопросы еще не загружены, нет draftId, или это preview/review
      if (!questions.length || !draftId || isPreview || isReview || loading) {
        return;
      }

      const currentQuestion = questions[activeStep];
      if (!currentQuestion) {
        return;
      }

      const questionId = currentQuestion.id;
      
      // Пропускаем, если ответ уже загружен
      if (loadedQuestionIdsRef.current.has(questionId)) {
        return;
      }

      setLoadingAnswer(true);
      try {
        const response = await getDraftAnswer(token, chatId || "", draftId, questionId);
        
        if (response && response.status === "ok" && response.value) {
          // Если value - массив, находим нужный элемент по questionId
          let savedValue = response.value;
          if (Array.isArray(response.value)) {
            savedValue = response.value.find(
              (item) => item.questionId === questionId
            ) || response.value[0] || null;
          }
          
          if (savedValue) {
            console.log('Загружен сохраненный ответ для вопроса:', questionId, savedValue);
            
            // Обновляем ответ для текущего вопроса
            setAnswers((prevAnswers) => {
              const newAnswers = [...prevAnswers];
              const answerIndex = prevAnswers.findIndex(
                (a) => a.questionId === questionId
              );
              
              if (answerIndex !== -1) {
                newAnswers[answerIndex] = {
                  ...newAnswers[answerIndex],
                  text: savedValue.text !== undefined ? savedValue.text : newAnswers[answerIndex].text,
                  comment: savedValue.comment !== undefined ? savedValue.comment : newAnswers[answerIndex].comment,
                  photos: Array.isArray(savedValue.photos) ? savedValue.photos : (savedValue.photos || newAnswers[answerIndex].photos),
                };
              }
              
              return newAnswers;
            });
            
            // Добавляем в кеш загруженных вопросов
            loadedQuestionIdsRef.current.add(questionId);
          }
        }
      } catch (error) {
        console.error("Ошибка загрузки сохраненного ответа:", error);
        // Продолжаем работу без загрузки
      } finally {
        setLoadingAnswer(false);
      }
    };

    loadAnswerForQuestion();
  }, [activeStep, questions, draftId, token, chatId, isPreview, isReview, loading, setAnswers]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {texts.dataSaved}
        </Alert>
      </Snackbar>
      {isPreview ? (
        <Box sx={{ position: "relative" }}>
          {loadingPreviewAnswers && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                zIndex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <Preview 
            answers={answers}
            questions={questions}
            handleEdit={handleEdit}
            setIsPreview={setIsPreview}
            handleReview={handleReviewInPreview}
          />
        </Box>
      ) : (
        <Box sx={{ p: 2 }}>
          {isReview ? (
            <Review
              answers={answers}
              questions={questions}
              validationErrors={validationErrors}
              handleEdit={handleEdit}
              handleSave={() =>
                handleSave(
                  chatId,
                  token,
                  objectId,
                  checklistId,
                  draftId,
                  () => dispatch(setDraftId(null))
                )
              }
              loading={savingLoading}
            />
          ) : (
            <Box sx={{ position: "relative" }}>
              {loadingAnswer && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    zIndex: 1,
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
              <QuestionForm
                questionIndex={activeStep}
                question={questions[activeStep]}
                answer={answers[activeStep]}
                validationErrors={validationErrors[activeStep]}
                handleChange={(index, field, value) =>
                  handleChange(
                    index,
                    field,
                    value,
                    token,
                    chatId,
                    objectId,
                    checklistId,
                    draftId,
                    (id) => dispatch(setDraftId(id))
                  )
                }
                handleRemovePhoto={(index, photoIndex) =>
                  handleRemovePhoto(
                    index,
                    photoIndex,
                    token,
                    chatId,
                    objectId,
                    checklistId,
                    draftId,
                    (id) => dispatch(setDraftId(id))
                  )
                }
              />
            </Box>
          )}
        </Box>
      )}
      {!isPreview && !isReview && (
        <MobileStepper
          variant="text"
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          nextButton={
            <Button
              size="small"
              onClick={() =>
                handleNext(
                  token,
                  chatId,
                  objectId,
                  checklistId,
                  draftId,
                  (id) => dispatch(setDraftId(id))
                )
              }
            >
              {texts.forward}
              <KeyboardArrowRight />
            </Button>
          }
          backButton={
            <Button size="small" onClick={handleBack}>
              <KeyboardArrowLeft />
              {texts.back}
            </Button>
          }
        />
      )}
      {!isPreview && !isReview && (
        <Box sx={{ display: "flex", justifyContent: "space-around", mt: 2, mb: 2 }}>
          <Button variant="contained" color="primary" onClick={() => setIsPreview(true)}>
            {texts.toList}
          </Button>
          <Button variant="contained" color="primary" onClick={handleReview}>
            {texts.finish}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default QuestionsStepper;
