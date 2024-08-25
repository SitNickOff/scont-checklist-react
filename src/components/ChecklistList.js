import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Container,
  CircularProgress,
  IconButton,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import HomeIcon from "@mui/icons-material/Home";
import { setChecklistId } from "../store";
import { getChecklists } from "../api";

const ChecklistList = () => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { chatId, token, objectId } = useSelector((state) => state.app);

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
    dispatch(setChecklistId(checklistId));
    navigate(`/questions`);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 2, mb: 2 }}
      >
        <Typography variant="h5" gutterBottom>
          Модели оценки
        </Typography>
        <IconButton color="primary" onClick={handleGoHome}>
          <HomeIcon />
        </IconButton>
      </Box>

      <List>
        {checklists.map((checklist, index) => (
          <ListItem
            button
            key={index}
            onClick={() => handleSelectChecklist(checklist.model_id)}
          >
            <ListItemText
              primary={
                checklist.description
                  ? checklist.description
                  : `Чек-лист: ${checklist.model_id}`
              }
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default ChecklistList;
