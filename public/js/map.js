let map;
let geocoder;
let addresses = [];
let markers = [];
let searchBarCount = 0;
let cityCircle;
let dot;
let restaurants;

// fetch API key
async function fetchApiKey() {
    try {
        const response = await axios.get('/api-key');
        const apiKey = response.data.apiKey;

        await loadMapScript(apiKey);  // load google maps script

        initAddField();
        await initMap();  //  initialize the map
        await initSearch(); // initialize the autocomplete search bar
        await initSearch();

    } catch (error) {
        console.error('Error fetching API key:', error);
    }
}

// load google maps script
function loadMapScript(apiKey) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=places&v=beta`;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function initMap() {
    // The location of Vancouver
    const position = { lat: 49.246292, lng: -123.116226 };

    // Request needed libraries
    const { Map } = await google.maps.importLibrary("maps");

    geocoder = new google.maps.Geocoder();
    map = new Map(document.getElementById("map"), {
        zoom: 12,
        center: position,
        mapId: "MIDPOINT_MAP",
    });
}

async function initSearch() {
    searchBarCount++;

    // Request needed libraries.
    //@ts-ignore
    await google.maps.importLibrary("places");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    // Create the input HTML element, and append it.
    //@ts-ignore
    const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();
    placeAutocomplete.id = searchBarCount - 1;

    //@ts-ignore
    document.getElementById("addressInputs").appendChild(placeAutocomplete);

    // Inject HTML UI.
    // const selectedPlaceTitle = document.createElement("p");

    // selectedPlaceTitle.textContent = "";
    // document.getElementById("addressInputs").appendChild(selectedPlaceTitle);

    // const selectedPlaceInfo = document.createElement("pre");

    // selectedPlaceInfo.textContent = "";
    // document.getElementById("addressInputs").appendChild(selectedPlaceInfo);
    // Add the gmp-placeselect listener, and display the results.
    //@ts-ignore
    placeAutocomplete.addEventListener("gmp-placeselect", async function ({ place }) {
        await place.fetchFields({
            fields: ["displayName", "formattedAddress", "location"],
        });
    //     selectedPlaceTitle.textContent = "Selected Place:";
    //     selectedPlaceInfo.textContent = JSON.stringify(
    //         place.toJSON(),
    //   /* replacer */ null,
    //   /* space */ 2,
    //     );

        if (!addresses[this.id]) {
            addresses.push(place.toJSON());
        } else {
            addresses[this.id] = place.toJSON();
        }

        console.log(addresses);

        const marker = new AdvancedMarkerElement({
            map,
            position: place.location,
            title: place.displayName,
        })

        if (!markers[this.id]) {
            markers.push(marker);
        } else {
            markers[this.id].setMap(null);
            markers[this.id] = marker;
        }

        if (addresses.length >= 2) {
            calculateMidpoint(addresses);
        }
    });
}

function initAddField() {
    const addButton = document.createElement("button");
    addButton.innerHTML = "+";
    addButton.id = "addButton";
    document.getElementById("addressInputs").appendChild(addButton);

    addButton.addEventListener("click", () => {
        initSearch();

        if (searchBarCount == 5) {
            document.getElementById("addButton").remove();
        }
    })
}

function calculateMidpoint(place) {
    if (place.length === 0) {
        throw new Error('No locations provided.');
    }

    let totalLat = 0;
    let totalLng = 0;

    place.forEach(place => {
        totalLat += place.location.lat;
        totalLng += place.location.lng;
    });

    const midpoint = {
        lat: totalLat / place.length,
        lng: totalLng / place.length,
    };

    // remove circle & dot whenever new address field is filled
    if (cityCircle) {
        cityCircle.setMap(null);
    }

    if (dot) {
        dot.setMap(null);
    }

    drawCircle(midpoint); // { lat: <average latitude>, lng: <average longitude> }

}

function drawCircle(midpoint) {
    const center = { lat: midpoint.lat, lng: midpoint.lng };

    cityCircle = new google.maps.Circle({
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
        map,
        center: center,
        radius: 500,
    });

    dot = new google.maps.Circle({
        strokeColor: "#FF0000",
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 1,
        map,
        center: center,
        radius: 10,
    });

    panToCenter(midpoint.lat, midpoint.lng);
    handleFindRestaurants(midpoint, cityCircle.radius);
}

// Function to pan to new mid point
function panToCenter(newLat, newLng) {
    if(map) {
        const newCenter = new google.maps.LatLng(newLat, newLng);
        map.panTo(newCenter);
        map.setZoom(16);
    } else {
        console.log("Map is not initialized yet");
    }
}

// Function to find restaurants near a location
function findRestaurants(place, radius) {
    return new Promise((resolve, reject) => {
        const service = new google.maps.places.PlacesService(map);

        // Define the search request
        const request = {
            location: place,
            radius: radius,
            type: 'restaurant',
        };

        // Perform the nearby search
        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.sort((a, b) => {
                    const distanceA = google.maps.geometry.spherical.computeDistanceBetween(place, a.geometry.location);
                    const distanceB = google.maps.geometry.spherical.computeDistanceBetween(place, b.geometry.location);
                    return distanceA - distanceB;
                  });
                
                restaurants = results.map(place => ({
                    name: place.name,
                    address: place.vicinity,
                    rating: place.rating,
                    price_level: place.price_level,
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                }));

                resolve(restaurants);
            } else {
                reject(`Error fetching restaurants: ${status}`);
            }
        });
    });
}

async function handleFindRestaurants(midpoint, radius) {
    try {
        const restaurants = await findRestaurants(midpoint, radius);
        console.log('Found restaurants:', restaurants);
    } catch (error) {
        console.error('Error fetching restaurants:', error);
    }
}

document.getElementById("rating").addEventListener('change', handleChange);
document.getElementById("price").addEventListener('change', handleChange);

function handleChange() {
    var rating = parseFloat(document.getElementById('rating').value);
    var priceRange = parseInt(document.getElementById('price').value);

    // Filter based on selected rating and price level
    let filteredItems = restaurants;
    console.log(filteredItems);
    if (rating) {
        filteredItems = filteredItems.filter(restaurant => restaurant.rating >= rating);
    }

    if (priceRange >= 0) {
        filteredItems = filteredItems.filter(restaurant => restaurant.price_level === priceRange);
    }
    /*
    // Sort filtered items by distance if required (distance already calculated earlier)
    filteredItems.sort((a, b) => {
        const distanceA = google.maps.geometry.spherical.computeDistanceBetween(midpoint, new google.maps.LatLng(a.lat, a.lng));
        const distanceB = google.maps.geometry.spherical.computeDistanceBetween(midpoint, new google.maps.LatLng(b.lat, b.lng));
        return distanceA - distanceB;
    });*/

    // Display the filtered menu
    displayMenu(filteredItems);
}

// Function to display the filtered menu items
function displayMenu(filteredItems) {
    var menu = document.getElementById('menu');

    // Clear previous results
    menu.innerHTML = "";

    // If there are matching items, display them
    if (filteredItems.length > 0) {
        var list = "<h3>Filtered Menu:</h3><ul>";
        filteredItems.forEach(function(item) {
        var price = ['$', '$', '$', '$'];
        list += "<li>" + item.name + " - " + item.rating + " - " + price[item.price_level-1] + "</li>";
        });
        list += "</ul>";
        menu.innerHTML = list;
    } else {
        menu.innerHTML = "<p>No items found for the selected criteria.</p>";
    }
}

fetchApiKey();