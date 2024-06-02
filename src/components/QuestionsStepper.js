import React from 'react';
import { Box, Button, MobileStepper, Paper, Typography } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import QuestionForm from './QuestionForm';
import Review from './Review';
import { useQuestions } from '../hooks/useQuestions';

const QuestionsStepper = ({ chatId }) => {
    const {
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
        maxSteps
    } = useQuestions();

    return (
        <Box sx={{ width: '100%' }}>
            <Paper square elevation={0} sx={{ p: 2 }}>
                <Typography variant="h6">{isReview ? "Результаты заполнения чек-листа" : `Question ${activeStep + 1}`}</Typography>
            </Paper>
            <Box sx={{ p: 2 }}>
                {isReview ? (
                    <Review
                        answers={answers}
                        validationErrors={validationErrors}
                        handleEdit={handleEdit}
                        handleSave={handleSave}
                    />
                ) : (
                    <QuestionForm
                        questionIndex={activeStep}
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
                            {/* {activeStep === maxSteps - 1 ? 'Первый шаг' : 'Вперед'} */}
                            <KeyboardArrowRight />
                        </Button>
                    }
                    backButton={
                        <Button size="small" onClick={handleBack} /*disabled={activeStep === 0}*/>
                            <KeyboardArrowLeft />
                            Назад
                            {/* {activeStep === 0 ? 'Последний шаг' : 'Назад'} */}
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
