import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Typography, Container } from '@mui/material';
import { mockQuestions } from '../mocks/mockData';

const QuestionsList = ({ chatId, onAnswerQuestion }) => {
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        // Use mock data initially
        setQuestions(mockQuestions);
    }, [chatId]);

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Questions
            </Typography>
            <List>
                {questions.map((question, index) => (
                    <ListItem button key={index} onClick={() => onAnswerQuestion(question)}>
                        <ListItemText primary={question.name} />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

export default QuestionsList;
