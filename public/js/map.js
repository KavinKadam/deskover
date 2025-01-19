let map;

// fetch API key
async function fetchApiKey() {
  try {
    const response = await axios.get('/api-key');
    const apiKey = response.data.apiKey;

    await loadMapScript(apiKey);  // load google maps script

    initMap();  //  initialize the map
  } catch (error) {
    console.error('Error fetching API key:', error);
  }
}

// load google maps script
function loadMapScript(apiKey) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
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
  });
}

fetchApiKey();
