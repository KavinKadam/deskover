document.getElementById("food").addEventListener('change', handleChange);
document.getElementById("price").addEventListener('change', handleChange);

function handleChange() {
    var foodType = document.getElementById('food').value;
    var priceRange = document.getElementById('price').value;
    var filteredItems;

    // If a food type is selected, filter by food type
    if (foodType) {
      filteredItems = filteredItems.filter(item => item.type === foodType);
    }

    // If a price range is selected, filter by price range
    if (priceRange) {
      filteredItems = filteredItems.filter(item => item.price === priceRange);
    }

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
        list += "<li>" + item.name + " - " + item.price + "</li>";
        });
        list += "</ul>";
        menu.innerHTML = list;
    } else {
        menu.innerHTML = "<p>No items found for the selected criteria.</p>";
    }
}
