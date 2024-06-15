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
  
});


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

    // If date is not in the present or future refuse the request
    const currentDate = new Date();
    const selectedDate = new Date(date.value);
    if (selectedDate < currentDate) {
        alert('Date must be in the future.');
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
        
    }
};






