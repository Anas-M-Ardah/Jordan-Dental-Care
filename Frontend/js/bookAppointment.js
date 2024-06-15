const appointmentsContainer = document.getElementById('appointmentsTableBody'); // This should point to the <tbody> element
const dentist_id = sessionStorage.getItem('dentist_id');
const service_id = sessionStorage.getItem('service_id');
const searchInput = document.getElementById("searchInput");
const sortOptions = document.getElementById("sortOptions");
const username = document.getElementById("register");
const myAppointments = document.getElementById("myAppointments");
let appointments = [];

$(document).ready(async function() {
    // Redirect to patient login if logged in as a dentist
    if (sessionStorage.getItem("isDentist") === "true") {
        alert("Please log in as a patient to book an appointment");
        window.location.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/patientLogin.html";        
    } 

    // Check if user is logged in
    if (sessionStorage.getItem("loggedIn") === "true") {
        username.textContent = sessionStorage.getItem("username");
        if (username.textContent.startsWith("Dr.")) {
            username.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/dentistProfile.html";
        } else {
            username.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/patientProfile.html";
        }
    } else {
        alert("Please log in to book an appointment");
        window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/patientLogin.html";
    }

    if (sessionStorage.getItem("isDentist") === "true") {
        myAppointments.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsDentist.html";
    } else {
        myAppointments.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsPatient.html";
    }

    await fetchAndRenderAppointments();
});

async function fetchAndRenderAppointments() {
    try {
        showLoader();
        appointments = await fetchAppointments(); // Fetch appointments from the server
        renderFilteredAppointments(); // Render filtered appointments
        hideLoader();
    } catch (error) {
        console.error("Error fetching and rendering appointments:", error);
    }
}

async function fetchAppointments() {
    try {
        const response = await fetch(`http://localhost:3000/appointments/?dentist_id=${dentist_id}&service_id=${service_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();
        return data.appointments;
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        throw error;
    }
}

async function bookAppointmentPostRequest(appointmentId) {
    try {
        const response = await fetch(`http://localhost:3000/appointments/?id=${appointmentId}&user_id=${sessionStorage.getItem("id")}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                status: "booked",
            }),
        });

        $('#successModal').modal('show');
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        throw error;
    }
}

function renderFilteredAppointments() {
    clearAppointmentsContainer();
    const filteredAppointments = filterAppointments();
    
    if (filteredAppointments.length === 0) {
        const messageCard = createMessageCard("No appointments found matching the search criteria.");
        appointmentsContainer.appendChild(messageCard);
    } else {
        const sortedAppointments = sortAppointments(filteredAppointments);
        sortedAppointments.forEach(appointment => {
            const row = createAppointmentRow(appointment);
            appointmentsContainer.appendChild(row);
        });
    }
}

function filterAppointments() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    return appointments.filter(appointment => {
        // Assuming the date and time are stored in appointment_datetime field
        const appointmentDateTime = new Date(appointment.appointment_datetime);
        const appointmentDate = appointmentDateTime.toLocaleDateString().toLowerCase();
        const appointmentTime = appointmentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
        return appointmentDate.includes(searchTerm) || appointmentTime.includes(searchTerm);
    });
}

function createMessageCard(message) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 3; // Assuming 3 columns in the table
    cell.classList.add("text-center", "alert", "alert-info");
    cell.textContent = message;
    row.appendChild(cell);
    return row;
}

function clearAppointmentsContainer() {
    appointmentsContainer.innerHTML = "";
}

function sortAppointments(filteredAppointments) {
    const sortBy = sortOptions.value;
    if (sortBy === "dateAscending") {
        return filteredAppointments.sort((a, b) => new Date(a.appointment_datetime) - new Date(b.appointment_datetime));
    } else if (sortBy === "dateDescending") {
        return filteredAppointments.sort((a, b) => new Date(b.appointment_datetime) - new Date(a.appointment_datetime));
    } else {
        return filteredAppointments; // Default sorting
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

function bookAppointment(appointmentId) {
    sessionStorage.setItem("appointment_id", appointmentId);
    // Show the confirm booking modal
    $('#confirmBookingModal').modal('show');
}

// Handle the booking confirmation when the "Confirm" button in the modal is clicked
$(document).on('click', '#confirmBookingButton', async function() {
    // Send a post request to the server to book the appointment
    await bookAppointmentPostRequest(sessionStorage.getItem("appointment_id"));
});

// Handle the booking confirmation when the "Confirm" button in the modal is clicked
$(document).on('click', '#okBtn', function() {
    window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/myAppointmentsPatient.html";   
});

// Reload the page when the "Cancel" button in the modal is clicked
$(document).on('click', '.close, .btn-secondary', function() {
    window.location.reload();
});

// Add event listeners for search input and sort options
searchInput.addEventListener("input", renderFilteredAppointments);
sortOptions.addEventListener("change", renderFilteredAppointments);

function createAppointmentRow(appointment) {
    // Create the table row element
    const row = document.createElement("tr");
    row.id = `appointment_${appointment.appointment_id}`; // Assigning a unique ID to each row

    // Extract date and time from appointment_datetime
    const appointmentDateTime = new Date(appointment.appointment_datetime);
    const date = appointmentDateTime.toLocaleDateString();
    const time = appointmentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Set the table row HTML content with Bootstrap classes
    row.innerHTML = `
        <td class="align-middle border" style="text-align: center; font-weight: bold">${date}</td>
        <td class="align-middle border" style="text-align: center; font-weight: bold">${time}</td>
        <td class="align-middle text-center border">
            <button class="btn btn-primary btn-sm" onclick="bookAppointment(${appointment.appointment_id})">Book Appointment</button>
        </td>
    `;

    return row;
}
