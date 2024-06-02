import React from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';

const Review = ({ answers, validationErrors, handleEdit, handleSave }) => {
    return (
        <Box>
            {answers.map((answer, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="h6">{`Question ${index + 1}`}</Typography>
                    <Typography>Answer: {answer.text}</Typography>
                    {validationErrors[index]?.text && <Alert severity="error">Answer is required</Alert>}
                    <Typography>Comment: {answer.comment}</Typography>
                    {validationErrors[index]?.comment && <Alert severity="error">Comment is required</Alert>}
                    {answer.photo && (
                        <Box sx={{ mt: 2 }}>
                            <Typography>Photo:</Typography>
                            <img src={URL.createObjectURL(answer.photo)} alt="Preview" style={{ maxHeight: '200px', maxWidth: '200px' }} />
                        </Box>
                    )}
                    {validationErrors[index]?.photo && <Alert severity="error">Photo is required</Alert>}
                    <Button onClick={() => handleEdit(index)}>Edit</Button>
                </Box>
            ))}
            <Button variant="contained" color="primary" onClick={handleSave} disabled={validationErrors.some(error => error.text || error.comment || error.photo)}>
                Save All
            </Button>
        </Box>
    );
};

export default Review;
