let map;
let geocoder;

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
  // The location of Uluru
  const position = { lat: -25.344, lng: 131.031 };

  // Request needed libraries
  const { Map } = await google.maps.importLibrary("maps");
  //const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  geocoder = new google.maps.Geocoder();
  map = new Map(document.getElementById("map"), {
    zoom: 10,
    center: position,
    mapId: "DEMO_MAP_ID",
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
  geocoder.geocode( { 'address': address}, function(results, status) {
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


fetchApiKey();