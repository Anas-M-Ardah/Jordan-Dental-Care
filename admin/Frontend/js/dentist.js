const signOutLink = document.getElementById("signoutLink");

// Check if user is logged in
$(document).ready(() => {
    showLoader();

    if (sessionStorage.getItem("loggedIn") !== "true") {
        window.location.href = "login.html";
    }

    hideLoader();
});

signOutLink.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "login.html";
});

// Show the loader and backdrop
function showLoader() {
    document.getElementById("loader").style.display = "block";
    document.getElementById("backdrop").style.display = "block";
}

// Hide the loader and backdrop
function hideLoader() {
    document.getElementById("loader").style.display = "none";
    document.getElementById("backdrop").style.display = "none";
}

// Function to fetch unapproved dentists
async function getUnapprovedDentists() {
    try {
        const response = await fetch("http://localhost:8080/get-unapproved-dentist");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error.message);
        return []; // Return empty array in case of error
    }
}

// Function to handle click event on "More Details" button
function handleDetailsClick(dentistId) {
    sessionStorage.setItem("chosenDentist", dentistId);
    sessionStorage.setItem("canApprove", true);
    window.location.href = "dentist-details.html";
}

// Function to render the unapproved dentists list
async function renderUnapprovedDentists() {

    // Show the loader and backdrop
    showLoader();

    const approveList = document.getElementById("approveList");

    // Clear any existing list items
    approveList.innerHTML = "";

    // Fetch unapproved dentists
    const unapprovedDentists = await getUnapprovedDentists();

    // Check if there are dentists to display
    if (unapprovedDentists.length === 0) {
        const noDentistsMessage = document.createElement("li");
        noDentistsMessage.classList.add("list-group-item");
        noDentistsMessage.textContent = "No dentists need approval.";
        approveList.appendChild(noDentistsMessage);
    } else {
        // Create list items for each unapproved dentist
        unapprovedDentists.forEach(dentist => {
            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
            listItem.textContent = `${dentist.first_name} ${dentist.last_name} (id = ${dentist.id})`;

            const detailsButton = document.createElement("a");
            detailsButton.href = "dentist-details.html";
            detailsButton.classList.add("btn", "btn-info", "btn-sm");
            detailsButton.textContent = "More Details";

            // Add click event to the detailsButton
            detailsButton.onclick = function() {
                handleDetailsClick(dentist.id); // Pass dentist's ID when clicked
            };

            listItem.appendChild(detailsButton);
            approveList.appendChild(listItem);
        });
    }

    // Hide the loader and backdrop
    hideLoader();
}

// Call the render function to display the list on page load
document.addEventListener("DOMContentLoaded", renderUnapprovedDentists);

// Function to handle form submission
async function handleBanFormSubmit(event) {
    event.preventDefault();

    const dentistName = document.getElementById("dentistName").value;
    const banReason = document.getElementById("banReason").value;

    try {
        const response = await fetch(`http://localhost:8080/get-dentist-by-name?name=${dentistName}&isBanned=false`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        renderBanResults(data, banReason);
    } catch (error) {
        console.error('Fetch error:', error.message);
    }
}

// Function to handle search button click
async function handleSearchButtonClick() {
    const dentistName = document.getElementById("dentistName").value;
    const banReason = document.getElementById("banReason").value;

    try {
        const response = await fetch(`http://localhost:8080/get-dentist-by-name?name=${dentistName}&isBanned=false`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        renderBanResults(data, banReason);
    } catch (error) {
        console.error('Fetch error:', error.message);
    }
}

// Function to render ban results
function renderBanResults(dentists, banReason) {

    // Show the loader and backdrop
    showLoader();

    const banResultContainer = document.getElementById("banResult");
    banResultContainer.innerHTML = ""; // Clear previous results

    if (dentists.length === 0) {
        banResultContainer.innerHTML = "<p>No dentists found with that name.</p>";
    } else {
        const list = document.createElement("ul");
        list.classList.add("list-group");

        dentists.forEach(dentist => {
            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
            listItem.textContent = `${dentist.first_name} ${dentist.last_name} (id = ${dentist.id})`;

            const banReasonSpan = document.createElement("span");
            banReasonSpan.classList.add("badge", "badge-danger", "badge-pill");
            banReasonSpan.style.marginLeft = "2%";
            banReasonSpan.textContent = `Reason: ${banReason}`;

            const banButton = document.createElement("button");
            banButton.classList.add("btn", "btn-danger", "btn-sm");
            banButton.textContent = "Ban Dentist";

            // Add click event to the banButton
            banButton.onclick = function() {
                handleBanDentistClick(dentist.id);
            };

            listItem.appendChild(banReasonSpan);
            listItem.appendChild(banButton);
            list.appendChild(listItem);
        });

        banResultContainer.appendChild(list);
    }

    // Hide the loader and backdrop
    hideLoader();
}

// Function to handle "Ban Dentist" button click
async function handleBanDentistClick(dentistId) {
    const banReason = document.getElementById("banReason").value;

    try {
        const response = await fetch(`http://localhost:8080/ban-dentist?id=${dentistId}&reason=${banReason}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            // You can pass additional data in the body if needed
            // body: JSON.stringify({ additionalData: "value" })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data); // Log response data
        // Optionally, you can re-render the results after banning
        window.location.reload();
        // renderBanResults(updatedDentists, banReason);
    } catch (error) {
        console.error('Fetch error:', error.message);
    }
}


// Add event listener to the form
const banForm = document.getElementById("banForm");
banForm.addEventListener("submit", handleBanFormSubmit);

// Add event listener to the search button
const searchButton = document.getElementById("searchButton");
searchButton.addEventListener("click", handleSearchButtonClick);

const searchButton2 = document.getElementById("searchButton2");
searchButton2.addEventListener("click", handleSearchButtonClick2);

async function handleSearchButtonClick2() {
    const dentistName = document.getElementById("dentistName2").value;

    try {
        const response = await fetch(`http://localhost:8080/get-dentist-by-name?name=${dentistName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        renderBanResults2(data);
    } catch (error) {
        console.error('Fetch error:', error.message);
    }
}


function renderBanResults2(dentists) {

    // Show the loader and backdrop
    showLoader();

    const result = document.getElementById("result");
    result.innerHTML = ""; // Clear previous results

    if (dentists.length === 0) {
        result.innerHTML = "<p>No dentists found with that name.</p>";
    } else {
        const list = document.createElement("ul");
        list.classList.add("list-group");

        dentists.forEach(dentist => {
            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
            listItem.textContent = `${dentist.first_name} ${dentist.last_name} (id = ${dentist.id})`;

            const moreDetailsButton = document.createElement("button");
            moreDetailsButton.classList.add("btn", "btn-primary", "btn-sm");
            moreDetailsButton.textContent = "More Details";

            // Add click event to the banButton
            moreDetailsButton.onclick = function() {
                sessionStorage.setItem("chosenDentist", dentist.id);
                sessionStorage.setItem("canApprove", false);
                window.location.href = "dentist-details.html";
            };

            listItem.appendChild(moreDetailsButton);
            list.appendChild(listItem);
        });

        result.appendChild(list);
    }

    // Hide the loader and backdrop
    hideLoader();
}