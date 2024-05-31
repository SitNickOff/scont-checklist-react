import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { mockObjects } from '../mocks/mockData';

const ObjectsList = ({ chatId }) => {
    const [objects, setObjects] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Use mock data initially
        setObjects(mockObjects);
    }, [chatId]);

    const handleSelectObject = (obj) => {
        console.log(obj); // Вы можете использовать этот объект по необходимости
        navigate('/checklists');
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Objects List
            </Typography>
            <List>
                {objects.map((obj, index) => (
                    <ListItem button key={index} onClick={() => handleSelectObject(obj)}>
                        <ListItemText primary={obj} />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

export default ObjectsList;
