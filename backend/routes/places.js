const axios = require('axios');
require('dotenv').config(); // To load environment variables
const express = require('express');
const router = express.Router();

// Function to find restaurants near a location
async function findRestaurants(location, radius) {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
            params: {
                location: `${location.lat},${location.lng}`, // Latitude and Longitude
                radius: radius, // Radius in meters
                type: 'restaurant', // Type of places to search
                key: process.env["GOOGLE_PLACES_API"], // API key from environment variables
            },
        });

        if (response.data.results.length === 0) {
            return []; // No restaurants found
        }

        // Extract necessary details
        const restaurants = response.data.results.map(place => ({
            name: place.name,
            address: place.vicinity,
            rating: place.rating,
            breakfast: serves_breakfast,
            lunch: serves_lunch,
            dinner: serves_dinner,
        }));

        return restaurants;
    } catch (error) {
        console.error('Error in findRestaurants:', error.message);
        throw error;
    }
}

// Define an Express route to handle restaurant search
router.post('/', async (req, res) => {
    const { location, radius } = req.body; // Expecting { location: { lat, lng }, radius } in the request body

    try {
        const restaurants = await findRestaurants(location, radius); // Call the function
        res.json({ success: true, restaurants }); // Respond with restaurant data
    } catch (error) {
        res.status(500).json({ success: false, error: error.message }); // Handle errors gracefully
    }
});

module.exports = router;