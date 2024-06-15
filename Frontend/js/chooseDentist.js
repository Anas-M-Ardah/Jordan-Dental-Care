
const dentistContainer = document.getElementById('dentist-container');
const service_id = sessionStorage.getItem('service_id');
const searchInput = document.getElementById("searchInput");
const sortOptions = document.getElementById("sortOptions");
const username = document.getElementById("register");
const myAppointments = document.getElementById("myAppointments");

let dentists = [];

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
    await fetchAndRenderDentists();
});

async function fetchAndRenderDentists() {
    try {
        showLoader();
        dentists = await fetchDentists(); // Fetch dentists from the server
        renderFilteredDentists(); // Render filtered dentists
        hideLoader();
    } catch (error) {
        console.error("Error fetching and rendering dentists:", error);
        alert("Error fetching and rendering dentists, see console for details");
    }
}

async function fetchDentists() {
    try {
        const response = await fetch(`http://localhost:3000/dentists/?service_id=${service_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();
        return data.dentists;
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        throw error;
    }
}

function renderFilteredDentists() {
    clearDentistsContainer();
    const filteredDentists = filterDentists();
    
    if (filteredDentists.length === 0) {
        const messageCard = createMessageCard("No dentists found matching the search criteria.");
        dentistContainer.appendChild(messageCard);
    } else {
        const sortedDentists = sortDentists(filteredDentists);
        sortedDentists.forEach(dentist => {
            const card = createDentistCard(dentist);
            dentistContainer.appendChild(card);
        });
    }
}

function createMessageCard(message) {
    const card = document.createElement("div");
    card.classList.add("col-12", "text-center", "my-3");
    card.innerHTML = `
        <div style="margin-left: 3%" class="alert alert-info" role="alert">
            ${message}
        </div>
    `;
    return card;
}


function clearDentistsContainer() {
    dentistContainer.innerHTML = "";
}

function createDentistCard(dentist) {
    // Create the card element
    const card = document.createElement("div");
    card.classList.add("col-lg-3", "col-md-6", "col-sm-12", "mb-4"); // Adjusted Bootstrap classes for smaller cards

    // Set the card HTML content
    card.innerHTML = `
        <div class="card" style="margin: 5%"">
            <img src="${dentist.image_url}" class="card-img-top" alt="${dentist.first_name} ${dentist.last_name}">
            <div class="card-body">
                <h5 class="card-title">${dentist.first_name} ${dentist.last_name}</h5>
                <p class="card-text"><strong>Location:</strong> ${dentist.location}</p>
                <p class="card-text"><strong>Experience:</strong> ${dentist.experience} years</p>
                <p class="card-text"><strong>Price:</strong> ${dentist.price} JOD</p>
                <p class="card-text"><strong>Number of Available Appointments:</strong> ${dentist.appointment_count}</p>
                <button id="${dentist.id}" class="btn btn-primary" onclick="bookDentist(${dentist.id})" ${dentist.appointment_count === 0 ? 'disabled' : ''}>
                    Book Appointment
                </button>
                <button style="margin-top: 2%" id="${dentist.id}" class="btn btn-info" onclick="requestAppointment(${dentist.id})">
                    Request Appointment
                </button>
            </div>
        </div>
    `;
    return card;
}

function filterDentists() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    return dentists.filter(dentist => {
        const dentistName = dentist.first_name.toLowerCase() + " " + dentist.last_name.toLowerCase();
        const dentistLocation = dentist.location.toLowerCase();
        return dentistName.includes(searchTerm) || dentistLocation.includes(searchTerm);
    });
}

function sortDentists(filteredDentists) {
    const sortBy = sortOptions.value;
    if (sortBy === "priceLowToHigh") {
        return filteredDentists.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceHighToLow") {
        return filteredDentists.sort((a, b) => b.price - a.price);
    } else if (sortBy === "available") {
        return filteredDentists.sort((a, b) => b.appointment_count - a.appointment_count);
    } else {
        return filteredDentists;
    }
}


function bookDentist(dentistId) {
    sessionStorage.setItem("dentist_id", dentistId);
    window.location.href = "bookAppointment.html";
}

function requestAppointment(dentistId) {
    sessionStorage.setItem("dentist_id", dentistId);
    window.location.href = "requestAppointment.html";
}

function showLoader() {
    document.getElementById("loader").style.display = "block";
    document.getElementById("backdrop").style.display = "block";
}

function hideLoader() {
    document.getElementById("loader").style.display = "none";
    document.getElementById("backdrop").style.display = "none";
}

// Add event listeners for search input and sort options
searchInput.addEventListener("input", renderFilteredDentists);
sortOptions.addEventListener("change", renderFilteredDentists);
