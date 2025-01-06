import React, { useState } from "react";
import { auth, provider, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail, // Add this import
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
      const { isGoogleOnly } = await checkSignInMethods(email);
      
      if (isGoogleOnly) {
        alert("This account had uses Google Sign-In. Please use the 'Login with Google' button below and set password in profile page.");
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert(`Welcome back, ${userCredential.user.email}!`);
      navigate("/dashboard");
    } catch (error) {
      handleAuthError(error);
    }
  };

  // Handle login with Google
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore, if not, create one
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          userId: user.uid,
          email: user.email,
          userType: "normal",
          createdAt: new Date(),
        });
      }

      alert(`Welcome, ${user.email}!`);
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
        handleAuthError(error);
      }
    }
  };
  const checkSignInMethods = async (email) => {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return {
      hasGoogle: methods.includes('google.com'),
      hasPassword: methods.includes('password'),
      isGoogleOnly: methods.includes('google.com') && methods.length === 1
    };
  };
  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address");
      return;
    }

    try {
      const { isGoogleOnly } = await checkSignInMethods(email);
      
      if (isGoogleOnly) {
        alert("This account had uses Google Sign-In. Please use the 'Login with Google' button above and set password in profile page.");
        return;
      }

      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Please check your inbox.");
    } catch (error) {
      switch (error.code) {
        case "auth/user-not-found":
          alert("No account exists with this email.");
          break;
        case "auth/invalid-email":
          alert("Invalid email address.");
          break;
        default:
          alert(`Failed to send reset email: ${error.message}`);
          console.error("Reset password error:", error);
      }
    }
  };

  // Handle Firebase Auth errors
  const handleAuthError = (error) => {
    switch (error.code) {
      case "auth/user-not-found":
        alert("No account found with this email. Please register.");
        break;
      case "auth/wrong-password":
        alert("Incorrect password. Please try again.");
        break;
      case "auth/too-many-requests":
        alert("Too many login attempts. Please try again later.");
        break;
      default:
        alert(`Login failed: ${error.message}`);
        console.error("Login error:", error);
        break;
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
        <Button
          onClick={handleForgotPassword}
          sx={{ mt: 1, width: "100%" }}
          color="secondary"
        >
          Forgot Password?
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
