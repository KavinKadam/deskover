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

module.exports = calculateMidpoint;
module.exports = router;