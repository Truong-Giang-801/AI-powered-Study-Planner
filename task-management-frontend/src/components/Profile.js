import React, { useState, useEffect, useContext } from "react";
import { auth } from "../firebase";
import { updateProfile, updatePassword, linkWithPopup, unlink } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
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
  Card,
  Grid,
  Divider,
  Chip,
} from "@mui/material";
import { Edit, Star, TaskAlt, Google, Lock } from "@mui/icons-material";

const Profile = () => {
  const { user } = useContext(UserContext);
  const [fullName, setFullName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [profilePictureURL, setProfilePictureURL] = useState("");
  const [password, setPassword] = useState("");
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editField, setEditField] = useState("");
  const [isVIP, setIsVIP] = useState(false);
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const [tasksDone, setTasksDone] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  // Populate user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/users/${user.uid}`);
          const userData = response.data;
          setFullName(user.displayName || "");
          setProfilePicture(user.photoURL || "");
          setIsVIP(userData.userType === "VIP");
          setIsGoogleLinked(user.providerData.some((provider) => provider.providerId === "google.com"));

          // Fetch tasks data
          const tasksResponse = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/tasks?userId=${user.uid}`);
          const tasks = tasksResponse.data.filter((task) => task.userId === user.uid);
          setTotalTasks(tasks.length);
          setTasksDone(tasks.filter((task) => task.isCompleted).length);
        } catch (error) {
          console.error("Error fetching user data:", error);
          alert("Failed to fetch user data");
        }
      }
    };

    fetchUserData();
  }, [user]);

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
        alert("Successfully upgraded to VIP!");
      } else {
        throw new Error("Failed to upgrade to VIP");
      }
    } catch (error) {
      console.error("Error upgrading to VIP:", error);
      alert("Failed to upgrade to VIP");
    }
  };

  const handleLinkGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await linkWithPopup(auth.currentUser, provider);
      setIsGoogleLinked(true);
      alert("Google account linked successfully!");
    } catch (error) {
      console.error("Error linking Google account:", error);
      alert("Failed to link Google account");
    }
  };

  const handleUnlinkGoogle = async () => {
    try {
      await unlink(auth.currentUser, "google.com");
      setIsGoogleLinked(false);
      alert("Google account unlinked successfully!");
    } catch (error) {
      console.error("Error unlinking Google account:", error);
      alert("Failed to unlink Google account");
    }
  };

  const handleOpenEditDialog = (field) => {
    setEditField(field);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setProfilePictureURL("");
    setPassword("");
  };

  return (
<Box
  sx={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 1,
    backgroundColor: "#f9f9f9", // Light neutral background
  }}
>
      <Container maxWidth="md">
      <Card
  sx={{
    p: 3,
    boxShadow: 2,
    borderRadius: 2,
    backgroundColor: "#fff",
    maxWidth: 600, // Restrict card width
    margin: "auto",
  }}
>
  <Grid container spacing={3} alignItems="center">
    <Grid item xs={12} display="flex" justifyContent="center">
      <Avatar
        src={profilePicture}
        alt="Profile Picture"
        sx={{ width: 120, height: 120, boxShadow: 2 }}
      />
    </Grid>
    <Grid item xs={12}>
      <Typography variant="h5" align="center">
        {fullName}
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="center"
        sx={{ mt: 1 }}
      >
        {isVIP && (
          <Chip label="VIP Member" icon={<Star />} color="secondary" size="small" />
        )}
        <Chip
          label={`${tasksDone} / ${totalTasks} Tasks Done`}
          icon={<TaskAlt />}
          color="success"
          size="small"
        />
      </Stack>
    </Grid>
  </Grid>

  <Divider sx={{ my: 3 }} />

  <Stack spacing={1}>
    <Button
      startIcon={<Edit />}
      variant="outlined"
      fullWidth
      onClick={() => handleOpenEditDialog("profilePicture")}
    >
      Edit Profile Picture
    </Button>
    <Button
      startIcon={<Edit />}
      variant="outlined"
      fullWidth
      onClick={() => handleOpenEditDialog("fullName")}
    >
      Edit Full Name
    </Button>
    <Button
      startIcon={<Lock />}
      variant="outlined"
      fullWidth
      onClick={() => handleOpenEditDialog("password")}
    >
      Change Password
    </Button>
    {!isVIP && (
      <Button
        startIcon={<Star />}
        variant="contained"
        fullWidth
        color="secondary"
        onClick={handleUpgradeToVIP}
      >
        Upgrade to VIP
      </Button>
    )}
    {!isGoogleLinked ? (
      <Button
        startIcon={<Google />}
        variant="outlined"
        fullWidth
        color="primary"
        onClick={handleLinkGoogle}
      >
        Link Google Account
      </Button>
    ) : (
      <Button
        startIcon={<Google />}
        variant="outlined"
        fullWidth
        color="error"
        onClick={handleUnlinkGoogle}
      >
        Unlink Google Account
      </Button>
    )}
  </Stack>
</Card>


        <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="xs" fullWidth>
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
    </Box>
  );
};

export default Profile;
