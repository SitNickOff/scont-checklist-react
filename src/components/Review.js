import React from 'react';
import { Box, Button, Typography, Alert, Card, CardContent, CardActions } from '@mui/material';

const Review = ({ answers, validationErrors, handleEdit, handleSave }) => {
    return (
        <Box>
            {answers.map((answer, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="h5">{`Question ${index + 1}`}</Typography>
                        {answer.comment && (<Typography>Ответ: {answer.text}</Typography>)}
                        {validationErrors[index]?.text && <Alert severity="error">Требуется ответ</Alert>}
                        {answer.comment && (<Typography>Комментарий: {answer.comment}</Typography>)}
                        {validationErrors[index]?.comment && <Alert severity="error">Требуется комментарий</Alert>}
                        {answer.photo && (
                            <Box sx={{ mt: 2 }}>
                                <Typography>Фото:</Typography>
                                <img src={URL.createObjectURL(answer.photo)} alt="Preview" style={{ maxHeight: '200px', maxWidth: '200px' }} />
                            </Box>
                        )}
                        {validationErrors[index]?.photo && <Alert severity="error">Photo is required</Alert>}
                    </CardContent>
                    <CardActions>
                        <Button onClick={() => handleEdit(index)}>Редактировать</Button>
                    </CardActions>
                </Card>
            ))}
            <Button variant="contained" color="primary" onClick={handleSave} disabled={validationErrors.some(error => error.text || error.comment || error.photo)}>
                Сохранить (Завершить)
            </Button>
        </Box>
    );
};

export default Review;
