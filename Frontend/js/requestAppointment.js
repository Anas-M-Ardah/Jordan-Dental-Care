$(document).ready(function () {

    const username = document.getElementById("username");

    // Check if user is logged in
    if (sessionStorage.getItem("loggedIn") === "true") {
        // User is logged in, perform actions accordingly
        username.textContent = sessionStorage.getItem("username");
        if(username.textContent[0] === "D" && username.textContent[1] == "r" && username.textContent[2] === "."){
          username.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/dentistProfile.html";
        } else {
          username.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/patientProfile.html";
        }
      }
});


const submitBtn = document.getElementById("submit-btn");

submitBtn.addEventListener("click", async function (event) {
    event.preventDefault();
    
    const appointmentDate = document.getElementById("appointmentDate").value;
    const serviceName = document.getElementById("serviceName").value;
    const patientName = document.getElementById("patientName").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const email = document.getElementById("email").value;
    const painEffects = document.getElementById("painEffects").value;
    const dentistId = sessionStorage.getItem("dentist_id");

    // Define the data to be sent in the request body
    const data = {
        appointmentDate,
        serviceName,
        patientName,
        phoneNumber,
        email,
        painEffects,
        dentistId
    };

    try {
        const response = await fetch("http://localhost:3000/patient/request-appointment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Network response was not ok " + response.statusText);
        } else {
            showMessage("Appointment requested successfully", "green");
        }

        // Attempt to parse the response as JSON
        const result = await response.json().catch(() => {
            throw new Error("Invalid JSON response");
        });

        // if result code is 200, show success message
        if (result.message) {
            showMessage("Appointment requested successfully", "green");
        } else if (result.error) {
            showMessage(result.error, "red");
        }
    } catch (error) {
        showMessage(error.message, "red");
    }
});

function showMessage(content, color) {
    const message = document.getElementById("message");
    message.style.display = "block";
    message.textContent = content;
    message.style.color = color;
    window.scrollTo(0, 0);
}

