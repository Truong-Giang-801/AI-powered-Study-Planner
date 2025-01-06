import React, { useState, useEffect, useContext } from "react";
import { auth } from "../firebase";
import { updateProfile, updatePassword } from "firebase/auth";
import { UserContext } from "../context/UserContext";
import axios from "axios";
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
  const [isVIP, setIsVIP] = useState(false);

  // Populate user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/users/${user.uid}`);
          const userData = response.data;
          setFullName(user.displayName || "");
          setProfilePicture(user.photoURL || "");
          setIsVIP(userData.userType === 'VIP');
        } catch (error) {
          console.error("Error fetching user data:", error);
          alert("Failed to fetch user data");
        }
      }
    };

    fetchUserData();
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

  const handleUpgradeToVIP = async () => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/users/${user.uid}/upgrade-vip`);
      
      if (response.status === 200) {
        setIsVIP(true);
        alert('Successfully upgraded to VIP!');
      } else {
        throw new Error('Failed to upgrade to VIP');
      }
    } catch (error) {
      console.error('Error upgrading to VIP:', error);
      alert('Failed to upgrade to VIP');
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
          {!isVIP && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleUpgradeToVIP}
            >
              Upgrade to VIP
            </Button>
          )}
          {isVIP && (
            <Typography variant="subtitle1" color="secondary">
              VIP Member
            </Typography>
          )}
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
