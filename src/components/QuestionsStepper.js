import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Chip,
    MobileStepper,
    Paper
} from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { mockQuestions } from '../mocks/mockData';

const QuestionsStepper = ({ chatId }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [answers, setAnswers] = useState(mockQuestions.map(() => ({ text: '', comment: '', photo: null })));
    const [isReview, setIsReview] = useState(false);

    const handleNext = () => {
        if (activeStep === mockQuestions.length - 1) {
            setIsReview(true);
        } else {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const handleBack = () => {
        if (isReview) {
            setIsReview(false);
        } else {
            setActiveStep((prevActiveStep) => prevActiveStep - 1);
        }
    };

    const handleSave = () => {
        const allFieldsFilled = answers.every((answer, index) => {
            const question = mockQuestions[index];
            const isTextValid = answer.text.trim() !== '';
            const isCommentValid = !question.requireComment || answer.comment.trim() !== '';
            const isPhotoValid = !question.requirePhoto || answer.photo !== null;

            return isTextValid && isCommentValid && isPhotoValid;
        });

        if (allFieldsFilled) {
            console.log('Saving answers:', answers);
            // Add API call to save answers here
        } else {
            alert('Please fill all the required fields.');
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

    const maxSteps = mockQuestions.length;

    return (
        <Box sx={{ width: '100%' }}>
            <Paper square elevation={0} sx={{ p: 2 }}>
                <Typography variant="h6">{isReview ? "Review Your Answers" : mockQuestions[activeStep].name}</Typography>
            </Paper>
            <Box sx={{ p: 2 }}>
                {isReview ? (
                    <Box>
                        {answers.map((answer, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                                <Typography variant="h6">{mockQuestions[index].name}</Typography>
                                <Typography>Answer: {answer.text}</Typography>
                                <Typography>Comment: {answer.comment}</Typography>
                                {answer.photo && <Typography>Photo: {answer.photo.name}</Typography>}
                                <Button onClick={() => handleEdit(index)}>Edit</Button>
                            </Box>
                        ))}
                        <Button variant="contained" color="primary" onClick={handleSave}>
                            Save All
                        </Button>
                    </Box>
                ) : (
                    <Box>
                        <Box>
                            {mockQuestions[activeStep].options.map((option, index) => (
                                <Chip
                                    key={index}
                                    label={option}
                                    onClick={() => handleChange(activeStep, 'text', option)}
                                    color={answers[activeStep].text === option ? 'primary' : 'default'}
                                    clickable
                                    sx={{ m: 1 }}
                                />
                            ))}
                        </Box>
                        <TextField
                            label="Comment"
                            fullWidth
                            value={answers[activeStep].comment}
                            onChange={(e) => handleChange(activeStep, 'comment', e.target.value)}
                            margin="normal"
                            required={mockQuestions[activeStep].requireComment}
                        />
                        <Button
                            variant="contained"
                            component="label"
                            sx={{ mt: 2 }}
                        >
                            Upload Photo
                            <input
                                type="file"
                                hidden
                                onChange={(e) => handleChange(activeStep, 'photo', e.target.files[0])}
                            />
                        </Button>
                        {answers[activeStep].photo && <Typography>{answers[activeStep].photo.name}</Typography>}
                    </Box>
                )}
            </Box>
            <MobileStepper
                variant="text"
                steps={maxSteps}
                position="static"
                activeStep={activeStep}
                nextButton={
                    <Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1 && !isReview}>
                        {activeStep === maxSteps - 1 ? 'Review' : 'Next'}
                        <KeyboardArrowRight />
                    </Button>
                }
                backButton={
                    <Button size="small" onClick={handleBack} disabled={activeStep === 0 && !isReview}>
                        <KeyboardArrowLeft />
                        Back
                    </Button>
                }
            />
        </Box>
    );
};

export default QuestionsStepper;
