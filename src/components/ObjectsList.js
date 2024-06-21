import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Typography, Container, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
// import { mockObjects } from '../mocks/mockData';
import { getObjects } from '../api';

const ObjectsList = ({ chatId }) => {
    const [objects, setObjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchObjects = async () => {
            try {
                const data = await getObjects();
                setObjects(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching objects:", error);
                setLoading(false);
            }
        };

        fetchObjects();
    }, [chatId]);

    const handleSelectObject = (objectId) => {
        navigate(`/checklists?objectId=${objectId}`);
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Objects List
            </Typography>
            <List>
                {objects.map((obj, index) => (
                    <ListItem button key={index} onClick={() => handleSelectObject(obj.uid)}>
                        <ListItemText primary={obj.name} />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

export default ObjectsList;
