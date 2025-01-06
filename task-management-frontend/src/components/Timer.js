import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Stack, LinearProgress, Alert } from '@mui/material';

const Timer = ({ duration, onComplete, onCancel, isBreak = false, taskDeadline }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(true);
  const [showComplete, setShowComplete] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        // Check if deadline is reached
        const now = new Date();
        const deadline = new Date(taskDeadline._seconds * 1000);
        
        if (now >= deadline) {
          clearInterval(interval);
          const audio = new Audio('/sounds/notification.mp3');
          audio.play().catch(e => console.log('Audio play failed:', e));
          
          setShowComplete(true);
          setIsActive(false);
          onComplete(elapsedTime, true); // true indicates deadline reached
          return;
        }

        setTimeLeft((prevTime) => prevTime - 1);
        setElapsedTime((prevElapsed) => prevElapsed + 1);
      }, 1000);
    } else if (timeLeft <= 0) {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(e => console.log('Audio play failed:', e));
      
      setShowComplete(true);
      setIsActive(false);
      onComplete(elapsedTime);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete, elapsedTime, taskDeadline]);


  const handleCancel = () => {
    console.log('elapsedTime:', elapsedTime);
    onCancel(elapsedTime);
  };

  const toggleTimer = () => setIsActive(!isActive);
  const progress = ((duration - timeLeft) / duration) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Box sx={{ width: '100%', textAlign: 'center' }}>
      {showComplete && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {isBreak ? 'Break time is over!' : 'Focus session completed!'}
        </Alert>
      )}
      
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ 
          mb: 2,
          height: 10,
          backgroundColor: isBreak ? '#e8f5e9' : '#fce4ec',
          '& .MuiLinearProgress-bar': {
            backgroundColor: isBreak ? '#4caf50' : '#f50057'
          }
        }} 
      />

      <Typography variant="h2" sx={{ 
        fontFamily: 'monospace', 
        mb: 3,
        color: isBreak ? 'success.main' : 'primary.main'
      }}>
        {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
      </Typography>

      <Stack direction="row" spacing={2} justifyContent="center">
        {timeLeft > 0 && (
          <Button 
            variant="contained" 
            onClick={toggleTimer}
            color={isBreak ? 'success' : 'primary'}
          >
            {isActive ? 'Pause' : 'Resume'}
          </Button>
        )}
        <Button 
          variant="outlined" 
          color="error" 
          onClick={handleCancel}
        >
          End Session
        </Button>
      </Stack>
    </Box>
  );
};

export default Timer;