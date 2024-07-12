// src/components/ChecklistList.js
import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Typography, Container, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { getChecklists } from '../api';

const ChecklistList = ({ chatId, token }) => {
    const [checklists, setChecklists] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const objectId = new URLSearchParams(location.search).get('objectId');

    useEffect(() => {
        const fetchChecklists = async () => {
            try {
                const data = await getChecklists(token, chatId, objectId);
                setChecklists(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching checklists:", error);
                setLoading(false);
            }
        };

        fetchChecklists();
    }, [objectId, chatId, token]);

    const handleSelectChecklist = (checklistId) => {
        navigate(`/questions?checklistId=${checklistId}`);
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Checklists
            </Typography>
            <List>
                {checklists.map((checklist, index) => (
                    <ListItem button key={index} onClick={() => handleSelectChecklist(checklist.model_id)}>
                        <ListItemText primary={
                            checklist.description 
                                ? checklist.description 
                                : `Чек-лист: ${checklist.model_id}`
                        } />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

export default ChecklistList;
