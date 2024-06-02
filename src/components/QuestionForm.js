import React from 'react';
import { Box, Button, Chip, TextField, Typography } from '@mui/material';
import { mockQuestions } from '../mocks/mockData';

const QuestionForm = ({ questionIndex, answer, validationErrors, handleChange, handleRemovePhoto }) => {
    const question = mockQuestions[questionIndex];

    return (
        <Box>
            <Box>
                {question.options.map((option, index) => (
                    <Chip
                        key={index}
                        label={option}
                        onClick={() => handleChange(questionIndex, 'text', option)}
                        color={answer.text === option ? 'primary' : 'default'}
                        clickable
                        sx={{ m: 1 }}
                    />
                ))}
            </Box>
            <TextField
                label="Comment"
                fullWidth
                value={answer.comment}
                onChange={(e) => handleChange(questionIndex, 'comment', e.target.value)}
                margin="normal"
                required={question.requireComment}
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
                    onChange={(e) => handleChange(questionIndex, 'photo', e.target.files[0])}
                />
            </Button>
            {answer.photo && (
                <Button
                    variant="contained"
                    // color="secondary"
                    onClick={() => handleRemovePhoto(questionIndex)}
                    sx={{ mt: 2 }}
                    style={{ marginLeft: 8 }}
                >
                    Remove Photo
                </Button>
            )}
            {answer.photo && (
                <Box sx={{ mt: 2 }}>
                    <Typography>Photo:</Typography>
                    <img src={URL.createObjectURL(answer.photo)} alt="Preview" style={{ maxHeight: '200px', maxWidth: '200px' }} />
                    
                </Box>
            )}
        </Box>
    );
};

export default QuestionForm;
