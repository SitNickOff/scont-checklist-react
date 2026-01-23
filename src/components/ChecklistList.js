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
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import HomeIcon from "@mui/icons-material/Home";
import { setChecklistId } from "../store";
import { getChecklists } from "../api";
import { CHECKLIST, MODELS, SELECT } from "./messages";

const ChecklistList = () => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { chatId, token, objectId, lang } = useSelector((state) => state.app);

  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        const data = await getChecklists(token, chatId, objectId);
        
        // Проверяем, есть ли статус "Заполнение чек-листа не допускается"
        if (data && data.status === "Заполнение чек-листа не допускается") {
          setSnackbarMessage(data.status);
          setSnackbarOpen(true);
          setChecklists([]);
        } else {
          setChecklists(data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching checklists:", error);
        setLoading(false);
      }
    };

    fetchChecklists();
  }, [objectId, chatId, token]);

  const handleSelectChecklist = (checklistId, only_cam_inspector_bot) => {
    dispatch(setChecklistId({checklistId, only_cam_inspector_bot}));
    navigate(`/questions`);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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
          { MODELS[lang] }
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
          >
            <ListItemText
              primary={
                checklist.description
                  ? checklist.description
                  : `${CHECKLIST[lang]}: ${checklist.model_id}`
              }
            />
            <Button variant="contained" color="primary" onClick={() => handleSelectChecklist(checklist.model_id, checklist.only_cam_inspector_bot)}>
              {SELECT[lang]}
            </Button>
          </ListItem>
        ))}
      </List>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="warning"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ChecklistList;
