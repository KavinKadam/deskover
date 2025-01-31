const axios = require('axios');
require('dotenv').config(); // To load environment variables
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const address = req.query.address;
    try {
        const location = await geocodeAddress(address);
        res.json({ success: true, location });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

// Function to geocode an address
async function geocodeAddress(address) {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: address,
                key: process.env["GOOGLE_PLACES_API"],
            },
        });

        // Extract the latitude and longitude
        if (response.data.results.length === 0) {
            throw new Error('Address not found.');
        }
        return response.data.results[0].geometry.location; // { lat: <latitude>, lng: <longitude> }
    } catch (error) {
        console.error('Error in geocodeAddress:', error.message);
        throw error;
    }
}

module.exports = geocodeAddress;
