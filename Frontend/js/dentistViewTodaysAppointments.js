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

            // get appointment time
            const appointmentTime = new Date(appointment.appointment_datetime);
            const formattedTime = appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              const listItem = document.createElement("li");
              listItem.classList.add("list-group-item");
              listItem.innerHTML = `
                  <strong>Patient:</strong> ${appointment.patient_name}<br>
                  <strong>Appointment Time:</strong> ${formattedTime}
                  <strong>Appointment Status:</strong> ${appointment.status}
              `;
              appointmentsList.appendChild(listItem);
          });
      }
  }