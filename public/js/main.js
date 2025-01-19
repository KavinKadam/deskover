const express = require('express');

document.querySelector('#fetch-geocode').addEventListener('click', () => {
    const address = '1 Hacker Way'; // Replace with user input if needed
    fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => console.error('Error fetching geocode:', error));
});

require('dotenv').config();

const app = express();
app.use(express.json()); // Parse JSON request bodies

app.post('/api/midpoint', async (req, res) => {
    try {
        const { addresses, radius } = req.body;

        // Step 1: Geocode all addresses
        const locations = [];
        for (const address of addresses) {
            const location = await geocodeAddress(address);
            locations.push(location);
        }
        
        // Step 2: Calculate the midpoint
        const midpoint = calculateMidpoint(locations);

        // Step 3: Find nearby restaurants
        const restaurants = await findRestaurants(midpoint, radius);

        // Step 4: Respond with results
        res.json({
            midpoint,
            restaurants,
        });
    } catch (error) {
        console.error('Error in /api/midpoint:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});