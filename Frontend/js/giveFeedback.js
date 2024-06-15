$(document).ready(async function(){
    showLoader();

    // Check user authentication
    if (!sessionStorage.getItem("loggedIn")) {
        window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/patientLogin.html";
        return;
    }

    // Display username
    const username = document.getElementById("register");
    username.textContent = sessionStorage.getItem("username");
    if (username.textContent.startsWith("Dr.")) {
        username.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/dentistProfile.html";
    } else {
        username.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/patientProfile.html";
    }

    // Display myAppointments link based on user type
    const myAppointments = document.getElementById("myAppointments");
    myAppointments.href = sessionStorage.getItem("isDentist") === "true" ?
        "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsDentist.html" :
        "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/myAppointmentsPatient.html";

    hideLoader();
});

// Handle form submission
$("#feedbackForm").submit(async function(event) {
    event.preventDefault(); // Prevent default form submission

    // Get rating and feedback
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const feedback = document.getElementById("feedbackInput").value;

    // Get appointment ID
    const appointmentId = sessionStorage.getItem("giveFeedbackAppointmentId");

    // Send a POST request to give feedback
    try {
        const response = await fetch("http://localhost:3000/give-feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                appointmentId: appointmentId,
                rating: rating,
                feedback: feedback,
            }),
        });

        if (response.ok) {
            alert("Feedback given successfully");
            // Redirect user to a specific page after successful submission if needed
            window.location.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/patientHistory.html";
        } else {
            const error = await response.text();
            throw new Error(error);
        }
    } catch (error) {
        console.error("Error giving feedback:", error);
        alert("Failed to submit feedback. Please try again later.");
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
