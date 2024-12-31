import React, { useState } from "react";
import { auth, provider } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Handle login with email and password
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Logged in successfully!");
      navigate("/dashboard");
    } catch (error) {
      alert(`Login failed: ${error.message}`);
    }
  };

  // Handle login with Google
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      alert(`Logged in successfully with Google as ${user.email}`);
      navigate("/dashboard");
    } catch (error) {
      if (error.code === "auth/account-exists-with-different-credential") {
        const email = error.customData?.email;

        if (email) {
          try {
            const methods = await fetchSignInMethodsForEmail(auth, email);
            alert(
              `This email is already associated with another sign-in method: ${methods.join(
                ", "
              )}. Please use that method to log in.`
            );
          } catch (fetchError) {
            console.error("Failed to fetch sign-in methods:", fetchError);
            alert("Failed to resolve sign-in conflict.");
          }
        }
      } else {
        console.error("Google login failed:", error);
        alert(`Google login failed: ${error.message}`);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          p: 4,
          border: "1px solid #ddd",
          borderRadius: "12px",
          boxShadow: 3,
          backgroundColor: "white",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Login
        </Typography>

        <form onSubmit={handleLogin}>
          <Stack spacing={2}>
            <TextField
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              variant="outlined"
            />
            <TextField
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              variant="outlined"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              Login
            </Button>
          </Stack>
        </form>

        <Button
          onClick={handleGoogleLogin}
          variant="outlined"
          startIcon={<GoogleIcon />}
          sx={{ mt: 2, width: "100%" }}
        >
          Login with Google
        </Button>

        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ textDecoration: "none" }}>
            Register here
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
