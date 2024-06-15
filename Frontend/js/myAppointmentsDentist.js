function renderAppointmentCard(appointment) {
  const cardHtml = `
      <div class="card mb-3" style="margin: 2% 5%">
          <div class="card-body">
              <h5 class="card-title"><strong>Appointment ID:</strong> ${appointment.appointment_id}</h5>
              <p class="card-text"><strong>Patient:</strong> ${appointment.patient_first_name} ${appointment.patient_last_name}</p>
              <p class="card-text"><strong>Status:</strong> <span style="font-weight: bold;">${appointment.status.toUpperCase()}</span></p>
              <p class="card-text"><strong>Appointment Date and Time:</strong> ${new Date(appointment.appointment_datetime).toLocaleString()}</p>
              <button style="margin-left: 1%;" class="btn btn-success float-right delete-appointment" data-appointment-id="${appointment.appointment_id}" onclick="sendAppointment(this)">Patient attended</button>
              <button class="btn btn-danger float-right delete-appointment" data-appointment-id="${appointment.appointment_id}" onclick="absentAppointment(this)">Patient didn't attend</button>
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
              <p class="card-text"><strong>Patient:</strong> ${appointment.patient_first_name} ${appointment.patient_last_name}</p>
              <p class="card-text"><strong>Status:</strong> <span style="font-weight: bold;">${appointment.status.toUpperCase()}</span></p>
              <p class="card-text"><strong>Appointment Date and Time:</strong> ${new Date(appointment.appointment_datetime).toLocaleString()}</p>
              <button id="declineBtn" class="btn btn-danger float-right delete-appointment" data-appointment-id="${appointment.appointment_id}" onclick="deleteAppointment(this)">Delete</button>
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
              <p class="card-text"><strong>Patient:</strong> ${appointment.patient_first_name} ${appointment.patient_last_name}</p>
              <p class="card-text"><strong>Status:</strong> <span style="font-weight: bold;">${appointment.status.toUpperCase()}</span></p>
              <p class="card-text"><strong>Appointment Date and Time:</strong> ${new Date(appointment.appointment_datetime).toLocaleString()}</p>
              <button id="acceptBtn" style="margin-left: 1%;" class="btn btn-primary float-right accept-appointment" data-appointment-id="${appointment.appointment_id}" onclick="acceptAppointment(this)">Accept</button>
              <button id="declineBtn" class="btn btn-danger float-right delete-appointment" data-appointment-id="${appointment.appointment_id}" onclick="declineAppointment(this)">Decline</button>
          </div>
      </div>
  `;
  
  return cardHtml;
}

function renderAppointments(appointments) {
  // Filter the appointments based on their status
  const confirmedAppointments = appointments.filter(appointment => appointment.status.toLowerCase() === "confirmed");
  const pendingAppointments = appointments.filter(appointment => appointment.status.toLowerCase() === "pending");
  const declinedAppointments = appointments.filter(appointment => appointment.status.toLowerCase() === "declined");
  
  // Render confirmed appointments
  renderAppointmentType(confirmedAppointments, "#confirmedAppointmentsRow", renderAppointmentCard);
  
  // Render pending appointments
  renderAppointmentType(pendingAppointments, "#pendingAppointmentsRow", renderPendingAppointment);
  
  // Render declined appointments
  renderAppointmentType(declinedAppointments, "#declinedAppointmentsRow", renderDeclinedAppointment);
}

function renderAppointmentType(appointments, rowId, renderFunction) {
  if (appointments.length === 0) {
      $(rowId).html("<p>No appointments.</p>");
  } else {
      const appointmentsHtml = appointments.map(renderFunction).join("");
      $(rowId).html(appointmentsHtml);
  }
}

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

$(document).ready(async function(){
  const username = document.getElementById("register");

  // Check if the user is Authenticated
  if (sessionStorage.getItem("loggedIn") !== "true" && sessionStorage.getItem("isDentist") !== "true") {
      window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/patientLogin.html";
  } else {
      console.log('User is logged in');
      username.textContent = sessionStorage.getItem("username");
  }

  if(sessionStorage.getItem("isDentist") === "true") {
      username.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/dentistProfile.html";
  } else {
      username.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/patientProfile.html";
  }

    //  check if the dentist is approved

    if(sessionStorage.getItem("isApproved") === "false") {
        alert("Your account is not approved yet. Please wait for approval.");
        window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/index.html";
    }

  // Fetch appointments from the server
  const appointments = await fetchAppointments();
  
  // Render appointments based on status
  renderAppointments(appointments);
});

async function acceptAppointment(button) {
  const appointmentId = button.dataset.appointmentId;
  try {
      await sendPostRequestToAcceptAppointment(appointmentId);
      window.location.reload();
  } catch (error) {
      console.error("Error accepting appointment:", error);
  }
}

async function sendPostRequestToAcceptAppointment(appointmentId) {
  const dataToSend = {
      appointmentId: appointmentId
  };

  try {
      const response = await fetch(`http://localhost:3000/acceptAppointment/${appointmentId}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      return response.json();
  } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      throw error;
  }
}


async function declineAppointment(button) {
  const appointmentId = button.dataset.appointmentId;
  try {
    await sendPostRequestToDeclineAppointment(appointmentId);
    window.location.reload();
  } catch (error) {
    console.error("Error accepting appointment:", error);
  }
 
}

async function sendPostRequestToDeclineAppointment(appointmentId) {
  const dataToSend = {
      appointmentId: appointmentId
  };

  try {
      const response = await fetch(`http://localhost:3000/declineAppointment/${appointmentId}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      return response.json();
  } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      throw error;
  }
}

async function deleteAppointment(button) {
  const appointmentId = button.dataset.appointmentId;
  try {
    await sendPostRequestToDeleteAppointment(appointmentId);
    window.location.reload();
  } catch (error) {
    console.error("Error accepting appointment:", error);
  }
 
}

async function sendPostRequestToDeleteAppointment(appointmentId) {
  const dataToSend = {
      appointmentId: appointmentId
  };

  try {
      const response = await fetch(`http://localhost:3000/deleteAppointment/${appointmentId}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      return response.json();

  } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      throw error;
  }
}

async function sendAppointment(button) {
  const appointmentId = button.dataset.appointmentId;
  try {
    await sendPostRequestToSendAppointment(appointmentId);
    window.location.reload();
  } catch (error) {
    console.error("Error accepting appointment:", error);
  }
 
}

async function sendPostRequestToSendAppointment(appointmentId) {
  const dataToSend = {
      appointmentId: appointmentId
  };

  try {
      const response = await fetch(`http://localhost:3000/sendAppointment/${appointmentId}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
  } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      throw error;
  }
}

async function absentAppointment(button) {
  const appointmentId = button.dataset.appointmentId;
  try {
    await sendPostRequestToAbsentAppointment(appointmentId);
    window.location.reload();
  } catch (error) {
    console.error("Error accepting appointment:", error);
  }
 
}

async function sendPostRequestToAbsentAppointment(appointmentId) {
  const dataToSend = {
      appointmentId: appointmentId
  }; 

  try {
      const response = await fetch(`http://localhost:3000/absentAppointment/${appointmentId}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
      });
  } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      throw error;
  }

}
