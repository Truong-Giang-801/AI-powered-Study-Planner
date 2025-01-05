import React, { useState, useEffect, useContext } from "react";
import { auth } from "../firebase";
import { updateProfile, updatePassword } from "firebase/auth";
import { UserContext } from "../context/UserContext";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const Profile = () => {
  const { user } = useContext(UserContext);
  const [fullName, setFullName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [profilePictureURL, setProfilePictureURL] = useState("");
  const [password, setPassword] = useState("");
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editField, setEditField] = useState("");

  // Populate user data
  useEffect(() => {
    if (user) {
      setFullName(user.displayName || "");
      setProfilePicture(user.photoURL || "");
    }
  }, [user]);

  // Handle profile updates
  const handleUpdateProfile = async () => {
    try {
      if (editField === "profilePicture" && profilePictureURL) {
        await updateProfile(auth.currentUser, { photoURL: profilePictureURL });
        setProfilePicture(profilePictureURL);
      }

      if (editField === "fullName" && fullName) {
        await updateProfile(auth.currentUser, { displayName: fullName });
      }

      if (editField === "password" && password) {
        await updatePassword(auth.currentUser, password);
      }

      alert("Profile updated successfully!");
      setOpenEditDialog(false);
    } catch (error) {
      console.error("Error updating profile:", error.message);
      alert(`Failed to update profile: ${error.message}`);
    }
  };

  // Open dialog
  const handleOpenEditDialog = (field) => {
    setEditField(field);
    setOpenEditDialog(true);
  };

  // Close dialog
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setProfilePictureURL("");
    setPassword("");
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
          Profile
        </Typography>

        <Stack spacing={2} alignItems="center">
          <Avatar
            src={profilePicture}
            alt="Profile Picture"
            sx={{ width: 100, height: 100 }}
          />
          <Typography variant="h6">{fullName}</Typography>
          <Button
            variant="contained"
            onClick={() => handleOpenEditDialog("profilePicture")}
          >
            Edit Profile Picture
          </Button>
          <Button
            variant="contained"
            onClick={() => handleOpenEditDialog("fullName")}
          >
            Edit Full Name
          </Button>
          <Button
            variant="contained"
            onClick={() => handleOpenEditDialog("password")}
          >
            Change Password
          </Button>
        </Stack>
      </Box>

      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>
          Edit{" "}
          {editField === "profilePicture"
            ? "Profile Picture"
            : editField === "fullName"
            ? "Full Name"
            : "Password"}
        </DialogTitle>
        <DialogContent>
          {editField === "profilePicture" && (
            <TextField
              label="Profile Picture URL"
              value={profilePictureURL}
              onChange={(e) => setProfilePictureURL(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="https://example.com/photo.jpg"
            />
          )}
          {editField === "fullName" && (
            <TextField
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              fullWidth
              variant="outlined"
            />
          )}
          {editField === "password" && (
            <TextField
              type="password"
              label="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              variant="outlined"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleUpdateProfile} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
