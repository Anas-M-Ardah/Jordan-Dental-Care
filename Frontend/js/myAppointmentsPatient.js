
function renderAppointmentCard(appointment) {
    const cardHtml = `
        <div class="card mb-3" style="margin: 2% 5%">
        <div class="card-body">
            <h5 class="card-title"><strong>Appointment ID:</strong> ${appointment.appointment_id}</h5>
            <p class="card-text"><strong>Dentist:</strong> ${appointment.doctor_first_name} ${appointment.doctor_last_name}</p>
            <p class="card-text"><strong>Status:</strong> <span style="font-weight: bold;">${appointment.status.toUpperCase()}</span></p>
            <p class="card-text"><strong>Appointment Date and Time:</strong> ${new Date(appointment.appointment_datetime).toLocaleString()}</p>
            <button class="btn btn-danger float-right delete-appointment" data-appointment-id="${appointment.appointment_id}" onclick="sendAppointment(${appointment.appointment_id})">Send to History</button>
        </div>
        </div>
    `;
    
    return cardHtml;
}

function renderDeclinedAppointment(appointment) {
    const cardHtml = `
        <div class="card mb-3" style="margin: 2% 5%">
        <div class="card-body">
            <h5 class="card-title"><strong>Appointment ID:</strong> ${appointment.appointment_id}</h5>
            <p class="card-text"><strong>Dentist:</strong> ${appointment.doctor_first_name} ${appointment.doctor_last_name}</p>
            <p class="card-text"><strong>Status:</strong> <span style="font-weight: bold;">${appointment.status.toUpperCase()}</span></p>
            <p class="card-text"><strong>Appointment Date and Time:</strong> ${new Date(appointment.appointment_datetime).toLocaleString()}</p>
            <button class="btn btn-danger float-right delete-appointment" data-appointment-id="${appointment.appointment_id}" onclick="deleteAppointment(${appointment.appointment_id})">Delete</button>
        </div>
        </div>
    `;
    
    return cardHtml;
}

function renderPendingAppointment(appointment) {
    const cardHtml = `
        <div class="card mb-3" style="margin: 2% 5%">
        <div class="card-body">
            <h5 class="card-title"><strong>Appointment ID:</strong> ${appointment.appointment_id}</h5>
            <p class="card-text"><strong>Dentist:</strong> ${appointment.doctor_first_name} ${appointment.doctor_last_name}</p>
            <p class="card-text"><strong>Status:</strong> <span style="font-weight: bold;">${appointment.status.toUpperCase()}</span></p>
            <p class="card-text"><strong>Appointment Date and Time:</strong> ${new Date(appointment.appointment_datetime).toLocaleString()}</p>
            <button class="btn btn-danger float-right delete-appointment" data-appointment-id="${appointment.appointment_id}" onclick="cancelAppointment(${appointment.appointment_id})">Cancel</button>
        </div>
        </div>
    `;
    
    return cardHtml;
}

  
  /**
   * Render the appointments on the page
   * @param {Array<Object>} appointments Array of appointment objects
   */
  function renderAppointments(appointments) {
    // Filter the appointments based on their status
    const confirmedAppointments = appointments.filter(appointment => appointment.status.toLowerCase() === "confirmed");
    const pendingAppointments = appointments.filter(appointment => appointment.status.toLowerCase() === "pending");
    const declinedAppointments = appointments.filter(appointment => appointment.status.toLowerCase() === "declined");
    
    // Render confirmed appointments
    if (confirmedAppointments.length === 0) {
      $("#confirmedAppointmentsRow").html("<p>No confirmed appointments.</p>");
    } else {
      const confirmedAppointmentsHtml = confirmedAppointments.map(renderAppointmentCard).join("");
      $("#confirmedAppointmentsRow").html(confirmedAppointmentsHtml);
    }
    
    // Render pending appointments
    if (pendingAppointments.length === 0) {
      $("#pendingAppointmentsRow").html("<p>No pending appointments.</p>");
    } else {
      const pendingAppointmentsHtml = pendingAppointments.map(renderPendingAppointment).join("");
      $("#pendingAppointmentsRow").html(pendingAppointmentsHtml);
    }
    
    // Render declined appointments
    if (declinedAppointments.length === 0) {
      $("#declinedAppointmentsRow").html("<p>No declined appointments.</p>");
    } else {
      const declinedAppointmentsHtml = declinedAppointments.map(renderDeclinedAppointment).join("");
      $("#declinedAppointmentsRow").html(declinedAppointmentsHtml);
    }
    
    // Add click handler for delete buttons
    $(".delete-appointment").click(function() {
      const appointmentId = $(this).data("appointmentId");
      // Implement logic to delete the appointment using an API call or other mechanism
      console.log("Delete appointment with ID:", appointmentId);
    });
  }

  
  $(document).ready(async function(){
  
    const username = document.getElementById("register");

    // Check if the user is Authenticated
    if (sessionStorage.getItem("loggedIn") !== "true" || sessionStorage.getItem("isDentist") === "true") {
      window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/patientLogin.html";
    }

    if(username.textContent[0] === "D" && username.textContent[1] == "r" && username.textContent[2] === "."){
        username.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/dentistProfile.html";
      } else {
        username.textContent = sessionStorage.getItem("username");
        username.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/patientProfile.html";
      }

    // Fetch appointments from the server
    const appointments = await fetchAppointments();
    
    // Render appointments based on status
    if (appointments.length === 0) {
      console.log("No appointments found");
    } else {
      renderAppointments(appointments);
    }
  });
  
  async function fetchAppointments() {
    try {
      // Get the ID of the logged-in user
      const id = sessionStorage.getItem("id");
      const isDentist = sessionStorage.getItem("isDentist");
  
      // Construct the URL with query parameters
      const url = `http://localhost:3000/myAppointments?dentist=${isDentist}&id=${id}`;
  
      // Fetch appointments data from the server
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      const data = await response.json();
      return data.appointments;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return []; // Return an empty array in case of an error
    }
  }

async function cancelAppointment(appointmentId) {
  if (appointmentId == null) {
    console.error("Null pointer exception: appointmentId is null");
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/cancelAppointment/${appointmentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // reload the page
    window.location.reload();
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

async function declineAppointment(appointmentId) {

  if (appointmentId == null) {
    console.error("Null pointer exception: appointmentId is null");
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/deleteAppointment/${appointmentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // reload the page
    window.location.reload();
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

async function sendAppointment(appointmentId) {
  if (appointmentId == null) {
    console.error("Null pointer exception: appointmentId is null");
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/sendAppointment/${appointmentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // reload the page
    window.location.reload();
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}


  