

const username = document.getElementById("register");
$(document).ready(function(){

    if(sessionStorage.length === 0 || !sessionStorage.getItem("loggedIn") === "true" && !sessionStorage.getItem("isDentist") === "true"){
      window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/index.html";
    } else {
      username.textContent = sessionStorage.getItem("username");
    }

    const myAppointments = document.getElementById("myAppointments");

    if(sessionStorage.getItem("isDentist") === "true"){
      myAppointments.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsDentist.html";
    } else {
      myAppointments.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsPatient.html";
    }

    // check if dentist is approved
    if(sessionStorage.getItem("isApproved") === "false"){
      alert("Your account is not approved yet. Please wait for approval.");
      sessionStorage.clear();
      window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/index.html";
    }

    showLoader();
    fillContent();

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
  
let data = -1;
let servicesNames = -1;

async function fetchProfile(emailOrPhoneNumber) {
  try {
    const response = await fetch(`http://localhost:3000/dentist/profile?emailOrPhoneNumber=${emailOrPhoneNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    data = await response.json();
    hideLoader();
    // console.log("data: ", data[0]);
    return data;
  } catch (error) {
    hideLoader();
    console.error('There was a problem with the fetch operation:', error);
  }
};

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

async function fillContent(){
  try {
    const emailOrPhoneNumber = sessionStorage.getItem("email_or_phone");
    if (!emailOrPhoneNumber) {
      throw new Error("Email or phone number is not stored in session storage");
    }

    await fetchProfile(emailOrPhoneNumber);
    await fetchServicesNames();

    fillServices();

    const nameElement = document.getElementById("name");
    const emailElement = document.getElementById("email");
    const locationElement = document.getElementById("location");
    const experienceElement = document.getElementById("experience");
    const imageElement = document.getElementById("image");
    const phoneNumberElement = document.getElementById("phone");
    const dateOfBirth = document.getElementById("date_of_birth");

    if (!nameElement || !emailElement || !locationElement || !experienceElement || !imageElement) {
      throw new Error("One or more of the required elements is null");
    }

    if (data === -1 || !data[0]) {
      throw new Error("Data is not loaded yet");
    }

    nameElement.textContent = `Dr. ${data[0].first_name} ${data[0].last_name}`;
    emailElement.innerHTML = `<strong>Email Address:</strong> ${data[0].email_address}`;
    locationElement.innerHTML = `<strong>Location:</strong> ${data[0].location}`
    experienceElement.innerHTML = `<strong>Experience:</strong> ${data[0].experience} Years`;
    phoneNumberElement.innerHTML = `<strong>Phone:</strong> ${data[0].phone_number}`;
    dateOfBirth.innerHTML = `<strong>Date of Birth:</strong> ${data[0].date_of_birth.substring(0, 10)}`;
    sessionStorage.setItem("id", data[0].id);

    imageElement.setAttribute("src", data[0].image_url);
  } catch (error) {
    console.error(error);
    sessionStorage.clear();
    window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/index.html";
    alert("Not Authorized");
  }
}

function fillServices() {
  // Get the select elements
  const selectElement1 = document.getElementById('service-1');
  const selectElement2 = document.getElementById('service-2');

  // Loop through the servicesNames array and create an option element for each service
  servicesNames.forEach(service => {
      // Create an option element for the first select element
      const option1 = document.createElement('option');
      option1.value = service.id;
      option1.id = service.id;
      option1.textContent = service.name.toUpperCase();
      selectElement1.appendChild(option1);

      // Create an option element for the second select element
      const option2 = document.createElement('option');
      option2.value = service.id;
      option2.id = service.id;
      option2.textContent = service.name.toUpperCase();
      selectElement2.appendChild(option2);
  });
}


// ---------------------------------- Logout -------------------------------------------------------------

const logOutBtn = document.getElementById("logoutButton");

logOutBtn.addEventListener("click", ()=>{
  // Clear all session data
  sessionStorage.clear();
  window.location.href = "index.html"
});

// ------------------------------------- Add appointment ----------------------------------------------

const addAppointmentBtn = document.getElementById("add-appointment-btn");

async function sendAppointmentRequest() {
  const appointment = {
    service: document.getElementById("service-1").value,
    date: document.getElementById("date").value,
    hour: document.getElementById("hour").value,
    minute: document.getElementById("minute").value
  };

  const doctorId = sessionStorage.getItem("id");

  // If date is not in the present or future refuse the request
  const currentDate = new Date();
  const selectedDate = new Date(appointment.date.value);
  if (selectedDate < currentDate) {
      alert('Date must be in the future.');
      return;
  }

  try {
    showLoader();
    const response = await fetch(
      `http://localhost:3000/add-appointment?doctorId=${doctorId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointment)
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    hideLoader();

    if (data.message) {
      showMessage(data.message);
    } else {
      throw new Error("Invalid response received from server");
    }
  } catch (error) {
    hideLoader();
    console.error(error);
    showMessage("Failed to add appointment. Please try again later.");
    // alert("Failed to add appointment. Please try again later.");
  }
}

addAppointmentBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  await sendAppointmentRequest();
});


// --------------------------------------- Add Service -----------------------------------

const addServiceBtn = document.getElementById("add-service-btn");

async function sendServiceRequest() {
  const serviceElement = document.getElementById("service-2");
  const priceElement = document.getElementById("price");
  const durationElement = document.getElementById("duration");

  const service = {
    id: serviceElement ? serviceElement.value : null,
    price: priceElement ? priceElement.value : null,
    duration: durationElement ? durationElement.value : null
  };

  const doctorId = sessionStorage.getItem("id");

  console.log("Sending service request...");
  console.log("Service:", service);
  console.log("Doctor ID:", doctorId);


  if (!serviceElement || !priceElement || !durationElement) {
    console.error("Missing service, price, or duration input field");
    showMessage("Failed to add service. Please try again later.");
    return;
  }

  if (!doctorId) {
    console.error("Missing doctor ID");
    showMessage("Failed to add service. Please try again later.");
    return;
  }

  showLoader();
  try {
    const response = await fetch(
      `http://localhost:3000/add-service?doctorId=${doctorId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service)
      }
    );

    const data = await response.json();

    hideLoader();

    console.log("Server response:", data);

    if (data.message) {
      showMessage(data.message);
    } else if (data.error) {
      showMessage(data.error);
    } else{
      showMessage("Failed to add service. Please try again later.");
    }
  } catch (error) {
    hideLoader();
    console.error(error);
    showMessage("Failed to add service. Please try again later.");
  }
}



addServiceBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  await sendServiceRequest();
});


// ===================== View History ===================================================

const viewHistoryBtn = document.querySelector(".btn-history");

viewHistoryBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  window.location.href = "dentistHistory.html";
});

// ===================== View Patient History ===================================================

const viewPatientHistoryBtn = document.getElementById("view-patient-history");

viewPatientHistoryBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  window.location.href = "dentistPatientHistory.html";
});


// ======================= Add Multiple Appointments ====================================================

const addMultipleAppointmentsBtn = document.getElementById("add-mulitple-appointments");

addMultipleAppointmentsBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  window.location.href = "dentistAddMultipleAppointments.html";
});

// ======================= View Todays Appointments ====================================================

const viewTodaysAppointmentsBtn = document.getElementById("view-todays-appointments");

viewTodaysAppointmentsBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  window.location.href = "dentistViewTodaysAppointments.html";
});

// -------------------- Show Message ------------------------------------------

function showMessage(content){
  const message = document.getElementById("message");
  message.style.display = "block";
  message.textContent = content;
  window.scrollTo(0, 0);
}






  
