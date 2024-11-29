import { useState } from "react";
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

const HomeButton = () => {
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
      <DialogTitle>Подтверждение действия</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Вы уверены, что хотите вернуться на главную страницу? Все
          несохраненные данные будут потеряны.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelGoHome} color="primary">
          Отмена
        </Button>
        <Button onClick={handleConfirmGoHome} color="secondary" autoFocus>
          Подтвердить
        </Button>
      </DialogActions>
    </Dialog>
  </>
  );
}

export default HomeButton;