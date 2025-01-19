let map;
let geocoder;
let addresses = [];
let searchBarCount = 2;

// fetch API key
async function fetchApiKey() {
    try {
        const response = await axios.get('/api-key');
        const apiKey = response.data.apiKey;

        await loadMapScript(apiKey);  // load google maps script

        initMap();  //  initialize the map
        initSearch(); // initialize the autocomplete search bar
        initSearch();
        initAddField();

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
    // The location of Uluru
    const position = { lat: -25.344, lng: 131.031 };

    // Request needed libraries
    const { Map } = await google.maps.importLibrary("maps");
    //const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    geocoder = new google.maps.Geocoder();
    map = new Map(document.getElementById("map"), {
        zoom: 10,
        center: position,
        mapId: "MIDPOINT_MAP",
    });
    /*
       // The marker, positioned at Uluru
       const marker = new AdvancedMarkerElement({
        map: map,
        position: position,
        title: "Uluru",
      });*/
}

function codeAddress() {
    var address = document.getElementById('address').value;
    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status == 'OK') {
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

async function initSearch() {
    // Request needed libraries.
    //@ts-ignore
    await google.maps.importLibrary("places");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    // Create the input HTML element, and append it.
    //@ts-ignore
    const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();

    //@ts-ignore
    document.getElementById("addressInputs").appendChild(placeAutocomplete);

    // Inject HTML UI.
    const selectedPlaceTitle = document.createElement("p");

    selectedPlaceTitle.textContent = "";
    document.getElementById("addressInputs").appendChild(selectedPlaceTitle);

    const selectedPlaceInfo = document.createElement("pre");

    selectedPlaceInfo.textContent = "";
    document.getElementById("addressInputs").appendChild(selectedPlaceInfo);
    // Add the gmp-placeselect listener, and display the results.
    //@ts-ignore
    placeAutocomplete.addEventListener("gmp-placeselect", async ({ place }) => {
        console.log(place);
        await place.fetchFields({
            fields: ["displayName", "formattedAddress", "location"],
        });
        selectedPlaceTitle.textContent = "Selected Place:";
        selectedPlaceInfo.textContent = JSON.stringify(
            place.toJSON(),
      /* replacer */ null,
      /* space */ 2,
        );

        addresses.push(place.toJSON());

        const marker = new AdvancedMarkerElement({
            map,
            position: place.location,
            title: place.displayName,
        })

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
        searchBarCount++;

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

    const dot = new google.maps.Circle({
        strokeColor: "#FF0000",
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 1,
        map,
        center: center,
        radius: 10,
    });
}

fetchApiKey();