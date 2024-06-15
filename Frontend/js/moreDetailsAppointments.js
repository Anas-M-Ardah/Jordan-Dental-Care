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

$(document).ready(async function(){
  showLoader();

  const username = document.getElementById("register");
  const myAppointments = document.getElementById("myAppointments");

  // Check if user is logged in
  if (sessionStorage.getItem("loggedIn") === "true" && sessionStorage.getItem("isDentist") === "true") {
      console.log('User is logged in');
      username.textContent = sessionStorage.getItem("username");
    
      if(username.textContent.startsWith("Dr.")) {
          username.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/dentistProfile.html";
      } else {
          username.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/patientProfile.html";
      }

      if(sessionStorage.getItem("isDentist") === "true") {
          myAppointments.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsDentist.html";
      } else {
          myAppointments.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsPatient.html";
      }

      fillServices();

  } else {
      console.log('User is not logged in');
      alert('You must be logged in as a dentist');
      window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/dentistLogin.html";
  }

  hideLoader();

  const appointments = await fetchTodaysAppointments();

  renderAppointmentsList(appointments); // Render feedback when the document is ready
});


async function fetchTodaysAppointments() {
  try {
      const response = await fetch(`http://localhost:3000/todaysAppointments/${sessionStorage.getItem('id')}`);
    
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
    
      const data = await response.json();
      console.log(data);
      return data;
  } catch (error) {
      alert("Unauhtorized Please Login first");
      sessionStorage.clear();
      window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/dentistLogin.html";
      console.error('There was a problem with the fetch operation:', error);
  }
}

function renderAppointmentsList(appointments) {
    const appointmentsList = document.getElementById("appointmentsList");

    // Clear any existing content
    appointmentsList.innerHTML = "";

    // Check if appointments array is empty
    if (appointments.message === "No appointments found for today.") {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item");
        listItem.textContent = "No appointments found for today.";
        appointmentsList.appendChild(listItem);
    } else {
        appointments.forEach(appointment => {
            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item");
            listItem.innerHTML = `
                <strong>Patient:</strong> ${appointment.patient_name}<br>
                <strong>Appointment Date and Time:</strong> ${new Date(appointment.appointment_datetime).toLocaleString()}
            `;
            appointmentsList.appendChild(listItem);
        });
    }
}

let servicesNames = "";

async function fetchServicesNames(){
    try {
      const response = await fetch(`http://localhost:3000/dentist/get-services`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      servicesNames = await response.json();
      hideLoader();
      // console.log("data: ", data[0]);
      return servicesNames;
    } catch (error) {
      hideLoader();
      console.error('There was a problem with the fetch operation:', error);
    }
  }


  async function fillServices() {
    // Get the select elements
    const selectElement1 = document.getElementById('serviceSelect');

    servicesNames = await fetchServicesNames();

    // Loop through the servicesNames array and create an option element for each service
    servicesNames.forEach(service => {
        // Create an option element for the first select element
        const option1 = document.createElement('option');
        option1.value = service.id;
        option1.id = service.id;
        option1.textContent = service.name.toUpperCase();
        selectElement1.appendChild(option1);
    });
}

const addBtn = document.getElementById('addBtn');

addBtn.addEventListener('click', addMultipleAppointments)

   

async function addMultipleAppointments(e) {

    e.preventDefault();

    const service = document.getElementById('serviceSelect');
    const date = document.getElementById('date');
    const startTime = document.getElementById('startTime');
    const endTime = document.getElementById('endTime');
    const timeBetweenEachAppointment = document.getElementById('timeBetweenEachAppointment');

    // Input validation
    if (!service || !date || !startTime || !endTime || !timeBetweenEachAppointment) {
        alert('Please fill in all fields.');
        return;
    }

    const serviceId = service.value;
    const dateValue = date.value;
    const startTimeValue = startTime.value;
    const endTimeValue = endTime.value;
    const timeBetweenEachAppointmentValue = timeBetweenEachAppointment.value;

    const data = {
        service: serviceId,
        date: dateValue,
        startTime: startTimeValue,
        endTime: endTimeValue,
        timeBetweenEachAppointment: timeBetweenEachAppointmentValue
    };

    try {
        const response = await fetch(`http://localhost:3000/add-multiple-appointments?doctorId=${sessionStorage.getItem("id")}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.message);
            throw new Error(error.message);
        }

        alert('Appointments added successfully!');
        window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/dentistProfile.html";

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        alert(error);
    }
};






