import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Typography, Container, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setObjectId } from '../store';
import { getObjects } from '../api';

const ObjectsList = () => {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { chatId, token } = useSelector((state) => state.app);

  useEffect(() => {
    const fetchObjects = async () => {
      try {
        const data = await getObjects(token, chatId);
        setObjects(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching objects:", error);
        setLoading(false);
      }
    };

    fetchObjects();
  }, [chatId, token]);

  const handleSelectObject = (objectId) => {
    dispatch(setObjectId(objectId));
    navigate(`/checklists`);
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
