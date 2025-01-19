const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    const locations = req.body.locations; // Array of { lat, lng } from the frontend
    try {
        const midpoint = calculateMidpoint(locations);
        res.json({ success: true, midpoint }); // Return the midpoint
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Function to calculate the midpoint
function calculateMidpoint(locations) {
    if (locations.length === 0) {
        throw new Error('No locations provided.');
    }

    let totalLat = 0;
    let totalLng = 0;

    locations.forEach(location => {
        totalLat += location.lat;
        totalLng += location.lng;
    });

    const midpoint = {
        lat: totalLat / locations.length,
        lng: totalLng / locations.length,
    };

    return midpoint; // { lat: <average latitude>, lng: <average longitude> }
}

module.exports = calculateMidpoint;
module.exports = router;