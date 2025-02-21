import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

const messages = {
  ru: {
    confirmTitle: "Подтверждение действия",
    confirmText: "Вы уверены, что хотите вернуться на главную страницу? Все несохраненные данные будут потеряны.",
    cancel: "Отмена",
    confirm: "Подтвердить",
  },
  en: {
    confirmTitle: "Action Confirmation",
    confirmText: "Are you sure you want to return to the homepage? All unsaved data will be lost.",
    cancel: "Cancel",
    confirm: "Confirm",
  },
};

const HomeButton = () => {
  const { lang } = useSelector((state) => state.app);
  const [openDialog, setOpenDialog] = useState(false); 
  const navigate = useNavigate();

  const handleGoHomeClick = () => {
    setOpenDialog(true); // Открыть диалог подтверждения
  };

  const handleConfirmGoHome = () => {
    setOpenDialog(false); // Закрыть диалог
    navigate("/"); // Выполнить переход
  };

  const handleCancelGoHome = () => {
    setOpenDialog(false); // Закрыть диалог без перехода
  };
  return (
    <>
    <IconButton color="primary" onClick={handleGoHomeClick}>
      <HomeIcon />
    </IconButton>
    {/* Диалог подтверждения */}
    <Dialog open={openDialog} onClose={handleCancelGoHome}>
      <DialogTitle>{ messages[lang].confirmTitle }</DialogTitle>
      <DialogContent>
        <DialogContentText>
          { messages[lang].confirmText }
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelGoHome} color="primary">
        { messages[lang].cancel }
        </Button>
        <Button onClick={handleConfirmGoHome} color="secondary" autoFocus>
        { messages[lang].confirm }
        </Button>
      </DialogActions>
    </Dialog>
  </>
  );
}

export default HomeButton;