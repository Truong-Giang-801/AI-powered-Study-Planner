const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/UserRoutes');
// Initialize Express app
const app = express();

// Middleware to parse JSON
app.use(bodyParser.json());
app.use(cors());

// Use routes
app.use('/api', taskRoutes);
app.use('/api', userRoutes);
// Start the server
const PORT = process.env.PORT || 5251;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});