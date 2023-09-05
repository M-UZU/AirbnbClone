// Ensure the DOM is fully loaded before executing your JavaScript code
window.addEventListener("DOMContentLoaded", (event) => {
    // Your code goes here
});

const searchButton = document.getElementById("search-button");
searchButton.addEventListener("click", () => {
    // Get the search input value
    const searchInput = document.getElementById("search-input").value;

    // Call the fetchData function with the search input
    fetchData(searchInput);
});

// Define a function to fetch Airbnb listings
async function fetchData(location) {
    const url = `https://airbnb13.p.rapidapi.com/search-location?location=${location}&checkin=2023-09-16&checkout=2023-09-17&adults=1&children=0&infants=0&pets=0&page=1&currency=USD`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'ff1fa75606mshf1c4e29176dee75p1f2f60jsnc2a64260b0da',
            'X-RapidAPI-Host': 'airbnb13.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        console.log(result); 
        // Get the container where you want to display the listings
        const listingsContainer = document.getElementById("listings-container");

        // Clear previous listings
        listingsContainer.innerHTML = "";

        // Loop through the results and create listing cards
        result.results.forEach(element => {
            const listingCard = createListingCard(element);
            listingsContainer.appendChild(listingCard);
        });
    } catch (error) {
        console.error(error);
    }
}

function createListingCard(listing) {
    const listingCard = document.createElement("div");
    listingCard.classList.add("listing-card");

    listingCard.innerHTML = `
                  <img src="${listing.images[0]}" alt="${listing.name}">
                  <div class="listing-info">
                      <h2>${listing.name}</h2>
                      <p>${listing.type} · ${listing.beds} beds · ${
      listing.bathrooms
    } bathrooms</p>
                      <p>${listing.price.rate} per night</p>
                      <p>${listing.city}</p>
                      <p>Amenities: ${listing.previewAmenities.join(", ")}</p>
                  </div>
              `;
              const costButton = document.createElement("button");
              costButton.innerText = "Show Booking Cost Breakdown";
              costButton.addEventListener("click", () => showBookingCostBreakdown(listing));
              listingCard.appendChild(costButton);

              const reviewsP = document.createElement("p");
              reviewsP.innerHTML = `Reviews: ${listing.reviews_count} | Average Rating: ${calculateAverageRating(listing.reviews)}`;
              listingCard.appendChild(reviewsP);
              
              if (listing.host && typeof listing.host.is_superhost === 'boolean') {
                // Add a superhost indicator if the host is a superhost
                if (listing.host.is_superhost) {
                    const superhostIndicator = document.createElement("p");
                    superhostIndicator.innerText = "Superhost";
                    superhostIndicator.style.color = "red";
                    listingCard.appendChild(superhostIndicator);
                }
            }

            const amenitiesPreview = document.createElement("p");
            amenitiesPreview.innerText = `Amenities: ${createAmenitiesPreview(listing.previewAmenities)}`;
            listingCard.appendChild(amenitiesPreview);

    return listingCard;
}

function showBookingCostBreakdown(listing) {
    // Check if listing.price is a valid number before calling toFixed
    if (typeof listing.price.rate === 'number' && !isNaN(listing.price.rate)) {
        // Calculate additional fees and total cost
        const additionalFees = listing.price.rate * 0.10; // Assuming additional fees are 10% of base price
        const totalCost =listing.price.rate+ additionalFees;

        // Create a modal dialog box
        const modal = document.createElement("div");
        modal.style.display = "block";
        modal.style.width = "300px";
        modal.style.height = "200px";
        modal.style.backgroundColor = "#fff";
        modal.style.position = "fixed";
        modal.style.top = "50%";
        modal.style.left = "50%";
        modal.style.transform = "translate(-50%, -50%)";
        modal.style.padding = "20px";
        modal.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";

        // Add booking cost breakdown to the modal
        modal.innerHTML = `
            <h2>Booking Cost Breakdown</h2>
            <p>Base Rate: $${listing.price.rate.toFixed(2)}</p>
            <p>Additional Fees: $${additionalFees.toFixed(2)}</p>
            <p>Total Cost: $${totalCost.toFixed(2)}</p>
        `;

        // Add a close button to the modal
        const closeButton = document.createElement("button");
        closeButton.innerText = "Close";
        closeButton.addEventListener("click", () => modal.style.display = "none");
        modal.appendChild(closeButton);

        // Add the modal to the body
        document.body.appendChild(modal);
    } else {
        console.error("listing.price is not a valid number.");
    }
}


function calculateAverageRating(reviews) {
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
        return "No reviews yet";
    }

    let sum = 0;
    for (let review of reviews) {
        // Ensure that review.rating is a number before adding it to the sum
        if (typeof review.rating === 'number') {
            sum += review.rating;
        }
    }

    // Calculate the average rating only if there are valid numeric ratings
    if (sum > 0) {
        return (sum / reviews.length).toFixed(1);
    } else {
        return "No valid ratings";
    }
}

function createAmenitiesPreview(previewAmenities) {
    // Check if amenities is defined and is an array
    if (!Array.isArray(previewAmenities)) {
        return "Amenities not available";
    }

    // Show the first 3 amenities and the total count
    const previewAmenities1 = previewAmenities.slice(0, 3);
    let previewText = previewAmenities1.join(", ");

    if (previewAmenities.length > 3) {
        const extraCount = previewAmenities.length - 3;
        previewText += `, and ${extraCount} more`;
    }

    return previewText;
}
