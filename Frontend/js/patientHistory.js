const usernameElement = document.getElementById("register");
const appointmentsContainer = document.getElementById("appointmentsContainer");
const searchInput = document.getElementById("searchInput");
const sortOptions = document.getElementById("sortOptions");
const myAppointments = document.getElementById("myAppointments");

let appointments = [];

$(document).ready(async function(){
    await checkAuthentication();

    if(sessionStorage.getItem("isDentist") === "true"){
        myAppointments.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsDentist.html";
      } else {
        myAppointments.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsPatient.html";
      }

});

async function checkAuthentication() {
    if (isAuthenticated()) {
        renderUsername();
        await renderAppointments();
    } else {
        redirectToLogin();
    }
}

function isAuthenticated() {
    return sessionStorage.getItem("loggedIn") === "true";
}

function renderUsername() {
    usernameElement.textContent = sessionStorage.getItem("username");
    usernameElement.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/patientProfile.html";
}

function redirectToLogin() {
    window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/patientLogin.html";
}

async function fetchAppointmentHistory() {
    try {
        showLoader();
        const id = sessionStorage.getItem("id");
        const response = await fetch(`http://localhost:3000/patient/view-history?id=${id}`, {
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
        hideLoader();
        return data.appointments;
    } catch (error) {
        console.error("Error fetching appointment history:", error);
        throw error;
    }
}

function createAppointmentCard(appointment) {
    const card = document.createElement("div");
    card.classList.add("col-md-6", "mb-4");
    card.id = `appointment_${appointment.appointment_id}`; // Assigning a unique ID to each card

    // Extract date and time from appointment_datetime
    const appointmentDateTime = new Date(appointment.appointment_datetime);
    const date = appointmentDateTime.toLocaleDateString();
    const time = appointmentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    card.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${date} ${time}</h5>
                <p class="card-text"><strong>Dentist:</strong> ${appointment.doctor_first_name} ${appointment.doctor_last_name}</p>
                <p class="card-text"><strong>Appointment ID:</strong> ${appointment.appointment_id}</p>
                <p class="card-text"><strong>Status:</strong> ${appointment.status}</p>
                <div class="d-flex justify-content-end">
                    <button class="btn btn-primary mr-2" onclick="giveFeedback(${appointment.appointment_id})">Give Feedback</button>
                    <button class="btn btn-success" onclick="viewTreatmentPlan(${appointment.appointment_id})">View Treatment Plan</button>
                </div>
            </div>
        </div>
    `;

    return card;
}

async function renderAppointments() {
    try {
        showLoader();
        appointments = await fetchAppointmentHistory();
        renderFilteredAppointments(); // Render appointments initially
        hideLoader();
    } catch (error) {
        console.error("Error rendering appointments:", error);
        alert("Error rendering appointments, see console for details");
    }
}

function renderFilteredAppointments() {
    clearAppointmentsContainer();
    const filteredAppointments = filterAppointments();
    filteredAppointments.forEach(appointment => {
        const card = createAppointmentCard(appointment);
        appointmentsContainer.appendChild(card);
    });
}

function clearAppointmentsContainer() {
    appointmentsContainer.innerHTML = "";
}

// Add an input event listener to the search input
searchInput.addEventListener("input", () => {
    renderFilteredAppointments(); // Render filtered appointments when input changes
});

// Add an event listener to the sort options
sortOptions.addEventListener("change", () => {
    sortAppointmentsByDate();
    renderFilteredAppointments(); // Render filtered appointments when sort options change
});

// Function to filter appointments based on search term
function filterAppointments() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    return appointments.filter(appointment => {
        const doctorFullName = `${appointment.doctor_first_name} ${appointment.doctor_last_name}`.toLowerCase();
        const patientFullName = `${appointment.patient_first_name} ${appointment.patient_last_name}`.toLowerCase();
        const appointmentId = appointment.appointment_id.toString();
        const date = new Date(appointment.appointment_datetime).toLocaleDateString();
        
        return doctorFullName.includes(searchTerm) ||
               patientFullName.includes(searchTerm) ||
               appointmentId.includes(searchTerm) ||
               date.includes(searchTerm);
    });
}


// Function to sort appointments by date
function sortAppointmentsByDate() {
    const sortBy = sortOptions.value;
    if (sortBy === "newest" || sortBy === "oldest") {
        appointments.sort((a, b) => {
            const dateA = new Date(a.appointment_datetime);
            const dateB = new Date(b.appointment_datetime);
            return sortBy === "newest" ? dateB - dateA : dateA - dateB;
        });
    }
}

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

// Function to view feedback for a specific appointment
function giveFeedback(appointmentId) {
    // Redirect to the feedback page for the selected appointment
    sessionStorage.setItem("giveFeedbackAppointmentId", appointmentId);
    window.location.href = "giveFeedback.html";
}

// Function to give treatment plan for a specific appointment
function viewTreatmentPlan(appointmentId) {
    // Redirect to the treatment plan page for the selected appointment
   sessionStorage.setItem("viewTreatmentPlanAppointmentId", appointmentId);
   window.location.href = "viewTreatmentPlan.html";
}
