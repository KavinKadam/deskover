const express = require('express');
const dotenv = require('dotenv');

dotenv.config();  // Load environment variables (including Google API key)

const app = express();

// Serve frontend files (static assets)
app.use(express.static('public'));

// Start the server
const port = 8000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
