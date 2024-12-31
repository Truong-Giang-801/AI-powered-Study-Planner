import React, { useState } from "react";
import { auth, provider } from "../firebase";
import { linkWithPopup } from "firebase/auth";
import { Button, Container, Box, Typography, Stack } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

const LinkGoogle = () => {
  const [statusMessage, setStatusMessage] = useState("");

  const handleLinkGoogle = async () => {
    console.log("Starting Google account linking process...");
    setStatusMessage("Linking your Google account...");

    try {
      // Ensure user is logged in
      if (!auth.currentUser) {
        console.error("No user is currently signed in.");
        setStatusMessage("You must be logged in to link a Google account.");
        return;
      }

      console.log("Current user ID:", auth.currentUser.uid);

      // Perform linking
      const result = await linkWithPopup(auth.currentUser, provider);

      // Debug result
      console.log("Google account linked successfully!");
      console.log("User details after linking:", result.user);
      console.log("Linked providers:", result.user.providerData);

      setStatusMessage("Google account successfully linked!");
    } catch (error) {
      console.error("Error during Google account linking:", error);

      // Handle specific Firebase error codes
      switch (error.code) {
        case "auth/account-exists-with-different-credential":
          setStatusMessage(
            "This Google account is already associated with another account."
          );
          break;
        case "auth/provider-already-linked":
          setStatusMessage("Google account is already linked.");
          break;
        case "auth/popup-closed-by-user":
          setStatusMessage("The popup was closed before completing the linking.");
          break;
        case "auth/network-request-failed":
          setStatusMessage("Network error. Please check your connection and try again.");
          break;
        default:
          setStatusMessage(`Failed to link Google account: ${error.message}`);
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
          Link Google Account
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Link your Google account to enable seamless authentication.
        </Typography>

        <Stack spacing={2}>
          <Button
            onClick={handleLinkGoogle}
            variant="contained"
            startIcon={<GoogleIcon />}
            color="primary"
            size="large"
          >
            Link Google Account
          </Button>
          {statusMessage && (
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
              {statusMessage}
            </Typography>
          )}
        </Stack>
      </Box>
    </Container>
  );
};

export default LinkGoogle;
