const username = document.getElementById("register");
const myAppointments = document.getElementById("myAppointments");


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

async function fetchFeedback() {
  try {
      const response = await fetch(`http://localhost:3000/viewFeedback/${sessionStorage.getItem('viewFeedbackAppointmentId')}`);
    
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
    
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
  }
}

async function renderFeedback() {
  const feedback = await fetchFeedback();

  const feedbackContainer = document.getElementById('feedback');
  const ratingContainer = document.getElementById('rating');

  feedbackContainer.textContent = feedback.feedback;
  ratingContainer.textContent = feedback.rating;
}

$(document).ready(async function(){
  showLoader();

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
      alert('You must be logged in as a dentist to view feedback');
      window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/dentistLogin.html";
  }

  hideLoader();

  await renderFeedback(); // Render feedback when the document is ready
});
