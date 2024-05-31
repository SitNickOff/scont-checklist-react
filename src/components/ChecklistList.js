import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { mockChecklists } from '../mocks/mockData';

const ChecklistList = ({ chatId }) => {
    const [checklists, setChecklists] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Use mock data initially
        setChecklists(mockChecklists);
    }, [chatId]);

    const handleSelectChecklist = (checklist) => {
        console.log(checklist); // Вы можете использовать этот чек-лист по необходимости
        navigate('/questions');
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Checklists
            </Typography>
            <List>
                {checklists.map((checklist, index) => (
                    <ListItem button key={index} onClick={() => handleSelectChecklist(checklist)}>
                        <ListItemText primary={checklist} />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

export default ChecklistList;
