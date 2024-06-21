import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Typography, Container, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
// import { mockChecklists } from '../mocks/mockData';
import { getChecklists } from '../api';

const ChecklistList = ({ chatId }) => {
    const [checklists, setChecklists] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const objectId = new URLSearchParams(location.search).get('objectId');

    // useEffect(() => {
    //     // Use mock data initially
    //     setChecklists(mockChecklists);
    // }, [chatId]);

    useEffect(() => {
        const fetchChecklists = async () => {
            try {
                const data = await getChecklists(objectId);
                setChecklists(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching checklists:", error);
                setLoading(false);
            }
        };

        fetchChecklists();
    }, [objectId, chatId]);

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
                        <ListItemText primary={checklist.description} />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

export default ChecklistList;
