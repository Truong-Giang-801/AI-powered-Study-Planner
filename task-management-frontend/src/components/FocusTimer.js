import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Box, Typography 
} from '@mui/material';
import axios from 'axios';
import Timer from './Timer';

const FocusTimer = ({ task = null, open, onClose, onRefetch }) => {
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [isInSession, setIsInSession] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  
  const handleStartSession = () => {
    setIsInSession(true);
  };

  const updateTaskFocusTime = async (additionalTime) => {
    try {
      const updatedTask = {
        ...task,
        focusTime: (task.focusTime || 0) + additionalTime
      };
      await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/tasks/${task.id}`, updatedTask);
      onRefetch();
    } catch (error) {
      console.error('Error updating focus time:', error);
    }
  };

  const handleCompleteSession = (elapsedTime) => {
    if (!isBreak) {
      updateTaskFocusTime(elapsedTime);
    }
    setShowCompletionDialog(true);
  };

  const handleRestartSession = () => {
    setShowCompletionDialog(false);
    setIsBreak(false);
    setIsInSession(true);
  };

  const handleStartBreak = () => {
    setShowCompletionDialog(false);
    setIsBreak(true);
    setIsInSession(true);
  };

  const handleMarkComplete = async () => {
    try {
      task.status = 'Done';
      task.isCompleted = true;
      task.statusEnum = 3;
      console.log('Task: ', task);
      await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/tasks/${task.id}`, task);
      setShowCompletionDialog(false);
      onRefetch();
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCancelSession = (elapsedTime) => {
    if (!isBreak) {
      updateTaskFocusTime(elapsedTime);
    }
    setIsInSession(false);
    setIsBreak(false);
    setShowCompletionDialog(false);
    onClose();
  };

  if (!task) return null;

  return (
    <>
      <Dialog 
        open={open && !showCompletionDialog} 
        onClose={onClose}
        fullScreen={isInSession}
        maxWidth="sm"
        fullWidth
      >
      <DialogTitle>
        {isInSession ? (isBreak ? 'Break Time' : `Focus Session: ${task.title}`) : 'Start Focus Session'}
      </DialogTitle>
      <DialogContent>
        {!isInSession ? (
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="number"
              label="Focus Duration (minutes)"
              value={focusDuration}
              onChange={(e) => setFocusDuration(Number(e.target.value))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Break Duration (minutes)"
              value={breakDuration}
              onChange={(e) => setBreakDuration(Number(e.target.value))}
            />
          </Box>
        ) : (
          <Timer
            duration={isBreak ? breakDuration * 60 : focusDuration * 60}
            onComplete={handleCompleteSession}
            onCancel={handleCompleteSession}
          />
        )}
      </DialogContent>
      <DialogActions>
        {!isInSession && (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleStartSession} 
              variant="contained"
              disabled={!task || task.status !== 'Doing'}
            >
              Start Session
            </Button>
          </>
        )}
      </DialogActions>
      </Dialog>

<Dialog
  open={showCompletionDialog}
  onClose={() => setShowCompletionDialog(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>
    {isBreak ? 'Break Time Complete!' : 'Focus Session Complete!'}
  </DialogTitle>
  <DialogContent>
    <Typography variant="body1" gutterBottom>
      Great work! What would you like to do next?
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleRestartSession} color="primary">
      Restart Session
    </Button>
    {!isBreak && (
      <>
        <Button onClick={handleStartBreak} color="secondary">
          Start Break
        </Button>
        <Button onClick={handleMarkComplete} color="success" variant="contained">
          Mark Task Complete
        </Button>
      </>
    )}
    <Button onClick={handleCancelSession} color="error">
      End
    </Button>
  </DialogActions>
</Dialog>
</>
);
};

export default FocusTimer;