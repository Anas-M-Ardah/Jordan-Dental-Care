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

// Function to fetch patients
async function getPatients() {
    try {
        const response = await fetch("http://localhost:8080/get-patients");
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

// Function to handle search button click
async function handleSearchButtonClick() {
    const patientName = document.getElementById("patientName").value;

    try {
        const response = await fetch(`http://localhost:8080/search-patients?name=${patientName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        renderPatientResults(data);
    } catch (error) {
        console.error('Fetch error:', error.message);
    }
}

// Function to render patient search results
function renderPatientResults(patients) {
    const resultContainer = document.getElementById("patientResult");
    resultContainer.innerHTML = ""; // Clear previous results

    if (patients.length === 0) {
        resultContainer.innerHTML = "<p>No patients found with that name.</p>";
    } else {
        const list = document.createElement("ul");
        list.classList.add("list-group");

        patients.forEach(patient => {
            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
            listItem.textContent = `${patient.firstname} ${patient.lastname} (id = ${patient.id})`;

            const moreDetailsButton = document.createElement("button");
            moreDetailsButton.classList.add("btn", "btn-primary", "btn-sm");
            moreDetailsButton.textContent = "More Details";

            // Add click event to the moreDetailsButton
            moreDetailsButton.onclick = function() {
                sessionStorage.setItem("chosenPatient", patient.id);
                handlePatientDetailsClick(patient.id);
            };

            listItem.appendChild(moreDetailsButton);
            list.appendChild(listItem);
        });

        resultContainer.appendChild(list);
    }
}

// Function to handle "More Details" button click
function handlePatientDetailsClick(patientId) {
    // Handle the click event, e.g., redirect to patient details page
    sessionStorage.setItem("chosenPatient", patientId);
    window.location.href = "patient-details.html";
}

// Add event listener to the search button
const searchButton = document.getElementById("searchButton");
searchButton.addEventListener("click", handleSearchButtonClick);

async function handleSearchButtonClick2() {
    const patientName = document.getElementById("patientName2").value;

    try {
        const response = await fetch(`http://localhost:8080/search-patients?name=${patientName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        renderBanResults(data);
    } catch (error) {
        console.error('Fetch error:', error.message);
    }
}

// Add event listener to the search button
const searchButton2 = document.getElementById("searchButton2");
searchButton2.addEventListener("click", handleSearchButtonClick2);

// Function to render patient search results for banning
function renderBanResults(patients) {
    const banResultContainer = document.getElementById("banResult");
    banResultContainer.innerHTML = ""; // Clear previous results

    if (patients.length === 0) {
        banResultContainer.innerHTML = "<p>No patients found with that name.</p>";
    } else {
        const list = document.createElement("ul");
        list.classList.add("list-group");

        patients.forEach(patient => {
            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
            listItem.textContent = `${patient.firstname} ${patient.lastname} (id = ${patient.id})`;

            const banReasonSpan = document.createElement("span");
            banReasonSpan.classList.add("badge", "badge-danger", "badge-pill");
            banReasonSpan.style.marginLeft = "2%";
            const banReason = document.getElementById("banReason").value;
            banReasonSpan.textContent = `Reason: ${banReason}`;

            const banButton = document.createElement("button");
            banButton.classList.add("btn", "btn-danger", "btn-sm");
            banButton.textContent = "Ban Patient";

            // Add click event to the banButton
            banButton.onclick = function() {
                handleBanPatientClick(patient.id);
            };

            listItem.appendChild(banReasonSpan);
            listItem.appendChild(banButton);
            list.appendChild(listItem);
        });

        banResultContainer.appendChild(list);
    }
}

// Function to handle "Ban Patient" button click
async function handleBanPatientClick(patientId) {
    const banReason = document.getElementById("banReason").value;

    try {
        const response = await fetch(`http://localhost:8080/ban-patient?id=${patientId}&reason=${banReason}`, {
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
        // renderBanResults(updatedPatients, banReason);
    } catch (error) {
        console.error('Fetch error:', error.message);
    }
}
