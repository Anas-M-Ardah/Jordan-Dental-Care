
const myAppointments = document.getElementById("myAppointments");
const username = document.getElementById("register");
$(document).ready(function(){

    if(sessionStorage.length === 0 || !sessionStorage.getItem("loggedIn") === "true"){
      window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/index.html";
    } else {
      username.textContent = sessionStorage.getItem("username");
    }

    if(sessionStorage.getItem("isDentist") === "true"){
      myAppointments.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsDentist.html";
    } else {
      myAppointments.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsPatient.html";
    }

    if(sessionStorage.getItem("isVerified") === "false"){
      const verification = document.querySelector(".verification");
      const h3 = verification.querySelector("h3");
      h3.textContent = "Please Verify Your Account";
      verification.style.display = "block";
      // get card 
      const card = document.querySelector(".card");
      // adjsut margin-top to 5%
      card.style.marginTop = "5%";
    }

    
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
    const response = await fetch(`http://localhost:3000/patient/profile?emailOrPhoneNumber=${emailOrPhoneNumber}`, {
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


async function fillContent(){
  try {
    const emailOrPhoneNumber = sessionStorage.getItem("email_or_phone");
    if (!emailOrPhoneNumber) {
      throw new Error("Email or phone number is not stored in session storage");
    }

    await fetchProfile(emailOrPhoneNumber);

    const nameElement = document.getElementById("name");
    const emailElement = document.getElementById("email");
    const nationalIDElement = document.getElementById("national-id");
    const imageElement = document.getElementById("image");
    const phoneNumberElement = document.getElementById("phone");
    const dateOfBirth = document.getElementById("date_of_birth");
    const id = document.getElementById("id");

    if (!nameElement || !emailElement || !nationalIDElement || !imageElement) {
      throw new Error("One or more of the required elements is null");
    }

    if (data === -1 || !data[0]) {
      throw new Error("Data is not loaded yet");
    }

    nameElement.textContent = `${data[0].firstname} ${data[0].lastname}`;

    emailElement.innerHTML = `<strong>Email Address:</strong> ${data[0].email}`;
    id.innerHTML = `<strong>ID:</strong> ${data[0].id}`;
    nationalIDElement.innerHTML = `<strong>National ID:</strong> ${data[0].national_id}`;
    phoneNumberElement.innerHTML = `<strong>Phone:</strong> ${data[0].phone}`;
    dateOfBirth.innerHTML = `<strong>Date of Birth:</strong> ${data[0].date_of_birth.substring(0, 10)}`;
    sessionStorage.setItem("id", data[0].id);

    imageElement.setAttribute("src", data[0].image);
  } catch (error) {
    console.error(error);
    sessionStorage.clear();
    window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/index.html";
    alert("Not Authorized");
  }
}




// ---------------------------------- Logout -------------------------------------------------------------

const logOutBtn = document.getElementById("logoutButton");

logOutBtn.addEventListener("click", ()=>{
  // Clear all session data
  sessionStorage.clear();
  window.location.href = "index.html"
});


// ===================== View History ===================================================

const viewHistoryBtn = document.querySelector(".btn-history");

viewHistoryBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  window.location.href = "patientHistory.html";
})


// -------------------- Show Message ------------------------------------------

function showMessage(content){
  const message = document.getElementById("message");
  message.style.display = "block";
  message.textContent = content;
  window.scrollTo(0, 0);
}

// --------------------- Verify Account ----------------------------------------

const verifyBtn = document.getElementById("verifyButton");

verifyBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  // send post request with query params
  const response = await fetch(`http://localhost:3000/patient/send-verification/?email=${sessionStorage.getItem("email")}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  // set the message to email sent sucessfully
  showMessage("Email sent successfully.\n Please check your email");
});

showLoader();
fillContent();




  
