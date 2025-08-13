
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors'); // Added CORS import

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // Added CORS middleware

// Serve the simple GUI
app.use(express.static(path.join(__dirname, 'views')));

// API routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
