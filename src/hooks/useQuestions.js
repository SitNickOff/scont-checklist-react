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

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const handleSave = async (chatId, token, selectedUnit, selectedModel) => {
        const errors = validateAnswers(answers);
        setValidationErrors(errors);
        const hasErrors = errors.some(error => error.text || error.comment || error.photo);

        if (hasErrors) {
            alert('Please fill all the required fields.');
        } else {
            try {
                const answersWithBase64Photos = await Promise.all(answers.map(async answer => {
                    const photos = await Promise.all(answer.photos.map(photo => convertFileToBase64(photo)));
                    return {
                        ...answer,
                        photos: photos.map(photo => photo.substring('data:image/webp;base64,'.length))
                    };
                }));

                const url = 'https://server.salescontrol.kz/api/questions/done';

                console.log({ answersWithBase64Photos });

                const response = await axios.post(url, {
                    token,
                    chat_id: chatId,
                    selected_unit: selectedUnit,
                    selected_model: selectedModel,
                    answers : answersWithBase64Photos
                });

                // const {status, checklist_id } = response.data;
                
                console.log('Response:', response.data);

                // // const url1 = 'https://server.salescontrol.kz/api/questions/upload';
                // const url1 = 'https://app.scont.io/Remotes/checklist_bot_rwett64iu';


                // if (status === 'ok' && checklist_id.length > 0) {
                //     console.log({ photo: answersWithBase64Photos[4].photos[0] });

                //     const response1 = await axios.post(url1, {
                //             command: "question_file",
                //             token,
                //             chat_id: chatId,
                //             checklist_id,
                //             question_id: answers[4],
                //             value: answersWithBase64Photos[4].photos[0],

                //         // photo: answersWithBase64Photos[4].photos[0],
                //         // checklist_id: response.data.checklist_id[0],
                //         // selected_unit: selectedUnit,
                //         // selected_model: selectedModel,
                //         // answer: answers[4]
                //     });

                //     console.log('Response:', response1.data);
                // }
                
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
