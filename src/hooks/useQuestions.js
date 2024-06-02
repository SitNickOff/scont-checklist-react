import { useState } from 'react';
import { mockQuestions } from '../mocks/mockData';

export const useQuestions = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [answers, setAnswers] = useState(mockQuestions.map(() => ({ text: '', comment: '', photo: null })));
    const [isReview, setIsReview] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);

    const validateAnswers = (answers) => {
        return answers.map((answer, index) => {
            const question = mockQuestions[index];
            const isTextValid = answer.text.trim() !== '';
            const isCommentValid = !question.requireComment || answer.comment.trim() !== '';
            const isPhotoValid = !question.requirePhoto || answer.photo !== null;

            return {
                text: !isTextValid,
                comment: !isCommentValid,
                photo: !isPhotoValid
            };
        });
    };

    const handleNext = () => {
        if (isReview) {
            setIsReview(false);
            setActiveStep(0);
        } else if (activeStep === mockQuestions.length - 1) {
            setActiveStep(0);
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

    const handleReview = () => {
        const errors = validateAnswers(answers);
        setValidationErrors(errors);
        setIsReview(true);
    };

    const handleSave = () => {
        const errors = validateAnswers(answers);
        setValidationErrors(errors);
        const hasErrors = errors.some(error => error.text || error.comment || error.photo);

        if (hasErrors) {
            alert('Please fill all the required fields.');
        } else {
            console.log('Saving answers:', answers);
            // Add API call to save answers here
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

    const handleRemovePhoto = (index) => {
        setAnswers((prevAnswers) => {
            const newAnswers = [...prevAnswers];
            newAnswers[index].photo = null;
            return newAnswers;
        });
    };

    const maxSteps = mockQuestions.length;

    return {
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
    };
};
