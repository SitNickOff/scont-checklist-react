import { useState } from 'react';
import axios from 'axios';

export const useQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [activeStep, setActiveStep] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isReview, setIsReview] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [maxSteps, setMaxSteps] = useState(0);

    const validateAnswers = (answers) => {
        return answers.map((answer, index) => {
            const question = questions[index];
            const isTextValid = answer.text.trim() !== '';
            const isCommentValid = !question.requireComment || answer.comment.trim() !== '';
            const isPhotoValid = !question.requirePhoto || answer.photos.length > 0;

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

    const handleSave = async (chatId, token) => {
        const errors = validateAnswers(answers);
        setValidationErrors(errors);
        const hasErrors = errors.some(error => error.text || error.comment || error.photo);

        if (hasErrors) {
            alert('Please fill all the required fields.');
        } else {
            try {
                const response = await axios.post('https://server.salescontrol.kz/api/questions/done', {
                    token,
                    chat_id: chatId,
                    answers
                });
                console.log('Response:', response.data);
                alert('Answers successfully submitted!');
            } catch (error) {
                console.error('Error submitting answers:', error);
                alert('Failed to submit answers. Please try again.');
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
            newAnswers[index].photos = newAnswers[index].photos.filter((_, i) => i !== photoIndex);
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
        setMaxSteps
    };
};
