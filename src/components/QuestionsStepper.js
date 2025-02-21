import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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
import { getQuestions } from "../api";
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
  const { chatId, token, objectId, checklistId, lang } = useSelector(
    (state) => state.app
  );
  const texts = messages[lang];

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

        setQuestions(
          data.map((i, index) => ({
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
          }))
        );
        setAnswers(
          data.map((i) => ({
            text: i.multi === "single" ? "" : [],
            comment: "",
            photos: [],
            questionId: i.yardstick,
          }))
        );
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
        <Preview 
          answers={answers}
          questions={questions}
          handleEdit={handleEdit}
          setIsPreview={setIsPreview}
          handleReview={handleReviewInPreview}
        />
      ) : (
        <Box sx={{ p: 2 }}>
          {isReview ? (
            <Review
              answers={answers}
              questions={questions}
              validationErrors={validationErrors}
              handleEdit={handleEdit}
              handleSave={() =>
                handleSave(chatId, token, objectId, checklistId)
              }
              loading={savingLoading}
            />
          ) : (
            <QuestionForm
              questionIndex={activeStep}
              question={questions[activeStep]}
              answer={answers[activeStep]}
              validationErrors={validationErrors[activeStep]}
              handleChange={handleChange}
              handleRemovePhoto={handleRemovePhoto}
            />
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
            <Button size="small" onClick={handleNext}>
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
