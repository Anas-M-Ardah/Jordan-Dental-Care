const servicesContainer = document.getElementById("service-container");
const searchInput = document.getElementById("searchInput");
const sortOptions = document.getElementById("sortOptions");
const username = document.getElementById("register");
const myAppointments = document.getElementById("myAppointments");
let services = [];

$(document).ready(async function(){

    // Check if user is logged in
    if (sessionStorage.getItem("loggedIn") === "true") {
        // User is logged in, perform actions accordingly
        username.textContent = sessionStorage.getItem("username");
        if(username.textContent[0] === "D" && username.textContent[1] == "r" && username.textContent[2] === "."){
          username.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/dentistProfile.html";
        } else {
          username.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/patientProfile.html";
        }
      } 

      if(sessionStorage.getItem("isDentist") === "true"){
        myAppointments.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsDentist.html";
      } else {
        myAppointments.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsPatient.html";
      }
    

    await fetchAndRenderServices();
});

async function fetchAndRenderServices() {
    try {
        showLoader();
        const fetchedServices = await fetchServices(); // Fetch services from the server
        services = fetchedServices; // Assign fetched services to the global variable
        renderFilteredServices(); // Render filtered services
        hideLoader();
    } catch (error) {
        console.error("Error fetching and rendering services:", error);
        alert("Error fetching and rendering services, see console for details");
    }
}


// Other functions remain the same...

async function fetchServices() {
    try {
        const response = await fetch("http://localhost:3000/services", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin"
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();
    
        return data.services;
    } catch (error) {
        console.error("Error fetching services:", error);
        throw error;
    }
}


function renderFilteredServices() {
    clearServicesContainer();
    const filteredServices = filterServices();
    const sortedServices = sortServices(filteredServices);
    sortedServices.forEach(service => {
        const card = createServiceCard(service);
        servicesContainer.appendChild(card);
    });
}

function clearServicesContainer() {
    servicesContainer.innerHTML = "";
}

function createServiceCard(service) {
    // Capitalize the service name
    const capitalizedServiceName = service.name.charAt(0).toUpperCase() + service.name.slice(1);

    // Create the card element
    const card = document.createElement("div");
    card.classList.add("col-lg-3", "col-md-4", "col-sm-6", "mb-4"); // Adjusted Bootstrap classes for smaller cards

    // Set the card HTML content
    card.innerHTML = `
        <div class="card" style="margin: 5%">
            <img src="${service.image_url}" class="card-img-top" alt="${service.name}">
            <div class="card-body">
                <h5 class="card-title">${capitalizedServiceName}</h5> <!-- Capitalized service name -->
                <p class="card-text">${service.description}</p>
                <p class="card-text"><strong>Price Range:</strong> ${service.price_range}</p>
                <button id="${service.id}" class="btn btn-primary" onclick="bookService(${service.id})">Book Service</button>
            </div>
        </div>
    `;
    return card;
}




function filterServices() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    return services.filter(service => {
        const serviceName = service.name.toLowerCase();
        const serviceDescription = service.description.toLowerCase();
        return serviceName.includes(searchTerm) || serviceDescription.includes(searchTerm);
    });
}

function sortServices(filteredServices) {
    const sortBy = sortOptions.value;
    if (sortBy === "priceLowToHigh") {
        return filteredServices.sort((a, b) => a.min_price - b.min_price);
    } else if (sortBy === "priceHighToLow") {
        return filteredServices.sort((a, b) => b.max_price - a.max_price);
    } else {
        return filteredServices;
    }
}

function showLoader() {
    document.getElementById("loader").style.display = "block";
    document.getElementById("backdrop").style.display = "block";
}

function hideLoader() {
    document.getElementById("loader").style.display = "none";
    document.getElementById("backdrop").style.display = "none";
}

function bookService(service_id){
    sessionStorage.setItem("service_id", service_id);
    window.location.href = "chooseDentist.html";
}

// Add event listeners for search input and sort options
searchInput.addEventListener("input", renderFilteredServices);
sortOptions.addEventListener("change", renderFilteredServices);
