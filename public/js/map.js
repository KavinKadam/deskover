let map;

// fetch API key
async function fetchApiKey() {
    try {
        const response = await axios.get('/api-key');
        const apiKey = response.data.apiKey;

        await loadMapScript(apiKey);  // load google maps script

        initMap();  //  initialize the map
        initSearch(); // initialize the autocomplete address search bar
    } catch (error) {
        console.error('Error fetching API key:', error);
    }
}

// load google maps script
function loadMapScript(apiKey) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=beta`;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");

    map = new Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
        mapId: "MIDPOINT_MAP",
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

    const marker = new AdvancedMarkerElement({
        map,
        position: place.location,
        title: place.displayName,
    })
  });
}

fetchApiKey();