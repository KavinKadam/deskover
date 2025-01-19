const axios = require('axios');
require('dotenv').config(); // To load environment variables

// Function to find restaurants near a location
async function findRestaurants(location, radius) {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
            params: {
                location: `${location.lat},${location.lng}`,
                radius: radius,
                type: 'restaurant',
                key: process.env.GOOGLE_API_KEY,
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
        }));

        return restaurants;
    } catch (error) {
        console.error('Error in findRestaurants:', error.message);
        throw error;
    }
}

module.exports = findRestaurants;