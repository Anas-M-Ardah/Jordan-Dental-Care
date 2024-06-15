$(document).ready(async function(){

  showLoader();

  // Check if user is logged in and is a dentist
  const username = document.getElementById("register");
  if (!sessionStorage.getItem("loggedIn") === "true" || !sessionStorage.getItem("isDentist") === "true") {
    window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/index.html";
  } else {
    // Set username element
    username.textContent = sessionStorage.getItem("username");
    username.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/dentistProfile.html";
  }

  // Set href for myAppointments link based on user type
  const myAppointments = document.getElementById("myAppointments");
  myAppointments.href = sessionStorage.getItem("isDentist") === "true" ? 
    "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsDentist.html" : 
    "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsPatient.html";

  // Fetch patient treatment plans
  const treatmentPlans = await fetchTreatmentPlans();

  // Render treatment plans
  renderTreatmentPlans(treatmentPlans);

  hideLoader();
});

function renderTreatmentPlans(treatmentPlans) {
const treatmentPlansContainer = document.getElementById("treatmentPlans");
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

async function fetchTreatmentPlans() {
  try {
    const response = await fetch(`http://localhost:3000/treatment-plan/${sessionStorage.getItem('patientId')}`);
    if (!response.ok) {
      throw new Error('Server did not respond');
    }
    const treatmentPlans = await response.json();
    if (!treatmentPlans) {
      throw new Error('Server did not provide treatment plans');
    }
    return treatmentPlans;
  } catch (error) {
    console.error('Error when fetching treatment plans:', error);
    throw error;
  }
}