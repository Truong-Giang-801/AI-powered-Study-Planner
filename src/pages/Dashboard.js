import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Avatar 
} from '@mui/material';
import { deepPurple } from '@mui/material/colors';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            gap={2}
          >
            <Avatar 
              sx={{ bgcolor: deepPurple[500], width: 56, height: 56 }}
            >
              {currentUser.email[0].toUpperCase()}
            </Avatar>
            <Typography variant="h5" component="div" gutterBottom>
              Welcome, {currentUser.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You're logged into your account dashboard.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleLogout}
              sx={{ mt: 3 }}
            >
              Logout
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Dashboard;
