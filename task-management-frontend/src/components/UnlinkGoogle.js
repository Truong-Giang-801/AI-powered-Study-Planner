import React, { useState } from "react";
import { auth } from "../firebase";
import { unlink } from "firebase/auth";
import { Button, Container, Box, Typography, Stack } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

const UnlinkGoogle = () => {
  const [statusMessage, setStatusMessage] = useState("");

  const handleUnlinkGoogle = async () => {
    console.log("Starting Google unlink process...");
    setStatusMessage("Unlinking your Google account...");

    try {
      if (!auth.currentUser) {
        console.error("No user is currently signed in.");
        setStatusMessage("You must be logged in to unlink a Google account.");
        return;
      }

      // Unlink the Google provider
      await unlink(auth.currentUser, "google.com");
      console.log("Google account unlinked successfully!");
      setStatusMessage("Google account successfully unlinked.");
    } catch (error) {
      console.error("Error during Google account unlinking:", error);
      setStatusMessage(`Failed to unlink Google account: ${error.message}`);
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
          Unlink Google Account
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Unlink your Google account from your existing account.
        </Typography>

        <Stack spacing={2}>
          <Button
            onClick={handleUnlinkGoogle}
            variant="contained"
            startIcon={<GoogleIcon />}
            color="secondary"
            size="large"
          >
            Unlink Google Account
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

export default UnlinkGoogle;
