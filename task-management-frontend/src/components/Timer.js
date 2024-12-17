import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Stack } from '@mui/material';

const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const reset = () => {
    setSeconds(0);
    setIsActive(false);
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 5, textAlign: 'center' }}>
      <Box
        sx={{
          p: 3,
          border: '1px solid #ddd',
          borderRadius: '12px',
          boxShadow: 3,
          backgroundColor: '#f9f9f9',
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          Timer
        </Typography>

        <Typography
          variant="h3"
          sx={{ fontFamily: 'monospace', color: 'primary.main', mb: 3 }}
        >
          {Math.floor(seconds / 60)}:
          {seconds % 60 < 10 ? `0${seconds % 60}` : seconds % 60}
        </Typography>

        <Stack direction="row" justifyContent="center" spacing={2}>
          <Button
            variant="contained"
            color={isActive ? 'secondary' : 'primary'}
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button variant="outlined" color="error" onClick={reset}>
            Reset
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default Timer;
