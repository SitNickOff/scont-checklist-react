import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Button, CircularProgress, MobileStepper, Paper, Typography } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { useQuestions } from '../hooks/useQuestions';
import { getQuestions } from '../api';
import QuestionForm from './QuestionForm';
import Review from './Review';

const QuestionsStepper = () => {
    const [loading, setLoading] = useState(true);
    const { chatId, token, objectId, checklistId } = useSelector((state) => state.app);

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
        setMaxSteps
    } = useQuestions();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const data = await getQuestions(token, chatId, checklistId);

                setQuestions(data.map((i, index) => ({
                    id: i.yardstick,
                    name: `Вопрос ${index + 1}`,
                    text: i.yardstick_name_for_report,
                    options: [...i.scores],
                    requireComment: i.req_comments,
                    requirePhoto: i.req_files,
                })));
                setAnswers(data.map((i) => ({ text: '', comment: '', photos: [], questionId: i.yardstick })));
                setMaxSteps(data.length);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching questions:", error);
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [checklistId, chatId, token, setAnswers, setMaxSteps, setQuestions]);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Paper square elevation={0} sx={{ p: 2 }}>
                <Typography variant="h6">{isReview ? "Результаты заполнения чек-листа" : `Вопрос ${activeStep + 1}`}</Typography>
            </Paper>
            <Box sx={{ p: 2 }}>
                {isReview ? (
                    <Review
                        answers={answers}
                        questions={questions}
                        validationErrors={validationErrors}
                        handleEdit={handleEdit}
                        handleSave={() => handleSave(chatId, token, objectId, checklistId)}
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
            {!isReview && (
                <MobileStepper
                    variant="text"
                    steps={maxSteps}
                    position="static"
                    activeStep={activeStep}
                    nextButton={
                        <Button size="small" onClick={handleNext}>
                            Вперед
                            <KeyboardArrowRight />
                        </Button>
                    }
                    backButton={
                        <Button size="small" onClick={handleBack}>
                            <KeyboardArrowLeft />
                            Назад
                        </Button>
                    }
                />
            )}
            {!isReview && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleReview}>
                        Завершить
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default QuestionsStepper;
