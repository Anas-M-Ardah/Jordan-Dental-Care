$(document).ready(async function(){
    // Check if user is logged in and is a dentist

    const username = document.getElementById("register");
    if (!sessionStorage.getItem("loggedIn") === "true" || !sessionStorage.getItem("isDentist") === "true") {
      window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/index.html";
    } else {
      // Set username element
      username.textContent = sessionStorage.getItem("username");
      username.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/dentistProfile.html";
    }

    // Show the loader and backdrop
    showLoader();

    // Set href for myAppointments link based on user type
    const myAppointments = document.getElementById("myAppointments");
    myAppointments.href = sessionStorage.getItem("isDentist") === "true" ? 
      "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsDentist.html" : 
      "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsPatient.html";

    // Fetch patients and render
    const patients = await fetchPatients();
    const patients_info = patients["patient_info"];
    const lastAppointment = patients["last_appointments"][0];
    
    renderPatients(patients_info, lastAppointment);
    // hide the loader and backdrop
    hideLoader();
});

async function fetchPatients() {
  try {

    const patientsContainer = document.getElementById("myPatients");
    patientsContainer.innerHTML = ""; // Clear previous content

    const response = await fetch(`http://localhost:3000/myPatients/${sessionStorage.getItem('id')}`);
    if (!response.ok) {
      const noPatients = document.createElement("p");
      noPatients.textContent = "No patients found";
      patientsContainer.appendChild(noPatients);
      throw new Error('Server did not respond');
    }
    const patients = await response.json();
    if (!patients) {
      const noPatients = document.createElement("p");
      noPatients.textContent = "No patients found";
      patientsContainer.appendChild(noPatients);
      throw new Error('Server did not provide patients');
    }
    return patients;
  } catch (error) {
    console.error('Error when fetching patients:', error);
    hideLoader();
    throw error;
  }
}

function renderPatients(patients, lastAppointment) {
    const patientsContainer = document.getElementById("myPatients");
    patientsContainer.innerHTML = ""; // Clear previous content

    if(patients.length === 0) {
      const noPatients = document.createElement("p");
      noPatients.textContent = "No patients found";
      patientsContainer.appendChild(noPatients);
      return;
    }
  
    patients.forEach(patient => {
      const patientCard = document.createElement("div");
      patientCard.classList.add("card", "mb-3");
  
      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body");
  
      const patientName = document.createElement("h5");
      patientName.classList.add("card-title");
      patientName.textContent = `${patient.firstname} ${patient.lastname}`;
  
      const phone = document.createElement("p");
      phone.classList.add("card-text");
      phone.textContent = `Phone: ${patient.phone}`;
  
      const dob = document.createElement("p");
      dob.classList.add("card-text");
      dob.textContent = `Date of Birth: ${new Date(patient.date_of_birth).toLocaleDateString()}`;

      const lastVisit = document.createElement("p");
      lastVisit.classList.add("card-text");
      lastVisit.textContent = `Last Visit: ${lastAppointment ? new Date(lastAppointment.appointment_datetime).toLocaleDateString() : 'No visits yet'}`;
  
      const viewHistoryButton = document.createElement("button");
      viewHistoryButton.textContent = "View History";
      viewHistoryButton.classList.add("btn", "btn-primary");
      viewHistoryButton.onclick = () => viewPatientHistory(patient);
  
      cardBody.appendChild(patientName);
      cardBody.appendChild(phone);
      cardBody.appendChild(dob);
      cardBody.appendChild(lastVisit);
      cardBody.appendChild(viewHistoryButton);
  
      patientCard.appendChild(cardBody);
      patientsContainer.appendChild(patientCard);
    });
}
  
    
function viewPatientHistory(patient) {
  // Redirect to view history page passing patient ID or any other necessary data
  sessionStorage.setItem("patientId", patient.id);
  window.location.href = `view-patient-history.html`;
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

// Get form submission
document.getElementById("myPatientsForm").addEventListener("submit", async function(event) {

  event.preventDefault();

  // Get the form data
  const patientId = document.getElementById("patientId").value;

  // check if the patientId is a number
  if (isNaN(patientId)) {
    alert("Please enter a valid patient ID");
    return;
  }

  if (patientId === "") {
    // Refresh the page
    window.location.reload();
  }

  const patientHistory = await fetchPatientHistory(patientId);

  renderTreatmentPlans(patientHistory);
});


async function fetchPatientHistory(patientId) {
  try {
    const response = await fetch(`http://localhost:3000/patientHistory/${patientId}`);

    console.log(response);

    if(response.status == "404") {
      alert("No Previous Treatments Found for the Given Patient ID");
    }
    else if (!response.ok) {
      throw new Error('Server did not respond');
    }
    const patientHistory = await response.json();
    if (!patientHistory) {
      throw new Error('Server did not provide patient history');
    }

    return patientHistory;
  } catch (error) {
    console.error('Error when fetching patient history:', error);
    throw error;
  }
}

function renderTreatmentPlans(treatmentPlans) {
  const treatmentPlansContainer = document.getElementById("myPatients");
  treatmentPlansContainer.innerHTML = ""; // Clear previous content
  
  treatmentPlans.forEach(plan => {
    const planCard = document.createElement("div");
    planCard.classList.add("card", "mb-3");
  
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");
  
    const cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = "Treatment Plan";
  
    const cardText = document.createElement("p");
    cardText.classList.add("card-text");
    cardText.innerHTML = `
      <strong>Date:</strong> ${new Date(plan.date).toLocaleDateString()}<br>
      <strong>Medical History:</strong> ${plan.medical_history || "Not provided"}<br>
      <strong>Dental Issues:</strong> ${plan.dental_issues || "Not provided"}<br>
      <strong>Proposed Treatment Plan:</strong> ${plan.proposed_treatment_plan || "Not provided"}<br>
      <strong>Estimated Cost:</strong> ${plan.estimated_cost || "Not provided"}<br>
      <strong>Additional Comments:</strong> ${plan.additional_comments || "Not provided"}<br>
    `;
  
    const viewImageLink = document.createElement("a");
    viewImageLink.href = plan.image_url;
    viewImageLink.target = "_blank";
    viewImageLink.textContent = "View Image";
  
    const viewImageLink2 = document.createElement("a");
    viewImageLink2.href = plan.image_url_1;
    viewImageLink2.target = "_blank";
    viewImageLink2.style.marginLeft = "2%";
    viewImageLink2.textContent = "View Image-2";
  
    const viewImageLink3 = document.createElement("a");
    viewImageLink3.href = plan.image_url_2;
    viewImageLink3.target = "_blank";
    viewImageLink3.style.marginLeft = "2%";
    viewImageLink3.textContent = "View Image-3";
  
    const viewImageLink4 = document.createElement("a");
    viewImageLink4.href = plan.image_url_3;
    viewImageLink4.target = "_blank";
    viewImageLink4.style.marginLeft = "2%";
    viewImageLink4.textContent = "View Image-4";
  
    cardText.appendChild(viewImageLink);
    cardText.appendChild(viewImageLink2);
    cardText.appendChild(viewImageLink3);
    cardText.appendChild(viewImageLink4);
  
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
  
    planCard.appendChild(cardBody);
  
    treatmentPlansContainer.appendChild(planCard);
  });
  }

