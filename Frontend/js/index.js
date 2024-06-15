// index.js

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



  $(document).ready(function(){

    showLoader();

    $('.carousel').carousel({
      interval: 5000 // Adjust the interval (in milliseconds) as needed
    });

    // Check if user is logged in
    if (sessionStorage.getItem("loggedIn") === "true") {
      // User is logged in, perform actions accordingly
      console.log('User is logged in');
      username.textContent = sessionStorage.getItem("username");
      
      if(username.textContent[0] === "D" && username.textContent[1] == "r" && username.textContent[2] === "."){
        username.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/dentistProfile.html";
      } else {
        username.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/patientProfile.html";
      }

      if(sessionStorage.getItem("isDentist") === "true"){
        myAppointments.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsDentist.html";
      } else {
        myAppointments.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsPatient.html";
      }

      
    } else {
      // User is not logged in, perform actions accordingly
      console.log('User is not logged in');
    }

    hideLoader();

});


  