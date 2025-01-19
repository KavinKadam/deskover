const express = require('express');
const geocodeAddress = require('./routes/geocode');
const app = express();

app.use(express.json());
app.use('/api/geocode', geocodeAddress); // Mount geocode.js route