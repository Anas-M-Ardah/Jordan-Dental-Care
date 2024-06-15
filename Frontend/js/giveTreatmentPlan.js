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

    // Check user authentication
    if (!sessionStorage.getItem("loggedIn") && !sessionStorage.getItem("isDentist")) {
        window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/dentistLogin.html";
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


// Function to handle form submission for giving treatment plan
const handleTreatmentPlanSubmission = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    
    showLoader(); // Show loader while processing
    
    // Retrieve form data
    const medical_history = document.getElementById("medical_history").value;
    const dental_issues = document.getElementById("dental_issues").value;
    const treatment_plan = document.getElementById("treatment_plan").value;
    const estimated_cost = document.getElementById("estimated_cost").value;
    const comments = document.getElementById("comments").value;

    // Construct the request body
    const requestBody = {
        medical_history,
        dental_issues,
        treatment_plan,
        estimated_cost,
        comments
    };

    const appointmentId = sessionStorage.getItem("giveTreatmentPlanAppointmentId");

    try {
        const response = await fetch(`http://localhost:3000/give-treatment-plan/${appointmentId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            alert("Treatment plan given successfully");
            // Optionally, redirect to another page after successful submission
            // window.location.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/success.html";
        } else {
            const error = await response.text();
            alert(error);
        }
    } catch (error) {
        console.error("Error submitting treatment plan:", error);
        alert("Failed to submit treatment plan. Please try again later.");
    }

    hideLoader(); // Hide loader after processing
};

// Function to handle form submission for uploading image
const handleImageUploadSubmission = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    
    showLoader(); // Show loader while processing
    
    // Retrieve form data
    const formData = new FormData();
    formData.append("image", document.getElementById("image").files[0]); // Assuming only one file is selected
    
    const appointmentId = sessionStorage.getItem("giveTreatmentPlanAppointmentId");

    try {
        const response = await fetch(`http://localhost:3000/upload-image/${appointmentId}`, {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            alert("Image uploaded successfully");
            // Optionally, redirect to another page after successful upload
            // window.location.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/success.html";
        } else {
            const error = await response.text();
            alert(error);
        }
    } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image. Please try again later.");
    }

    hideLoader(); // Hide loader after processing
};

const handleImageUploadSubmission1 = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    
    showLoader(); // Show loader while processing
    
    // Retrieve form data
    const formData = new FormData();
    formData.append("image", document.getElementById("image1").files[0]); // Assuming only one file is selected
    
    const appointmentId = sessionStorage.getItem("giveTreatmentPlanAppointmentId");

    try {
        const response = await fetch(`http://localhost:3000/upload-image-1/${appointmentId}`, {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            alert("Image uploaded successfully");
            // Optionally, redirect to another page after successful upload
            // window.location.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/success.html";
        } else {
            const error = await response.text();
            alert(error);
        }
    } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image. Please try again later.");
    }

    hideLoader(); // Hide loader after processing
};

const handleImageUploadSubmission2 = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    
    showLoader(); // Show loader while processing
    
    // Retrieve form data
    const formData = new FormData();
    formData.append("image", document.getElementById("image2").files[0]); // Assuming only one file is selected
    
    const appointmentId = sessionStorage.getItem("giveTreatmentPlanAppointmentId");

    try {
        const response = await fetch(`http://localhost:3000/upload-image-2/${appointmentId}`, {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            alert("Image uploaded successfully");
            // Optionally, redirect to another page after successful upload
            // window.location.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/success.html";
        } else {
            const error = await response.text();
            alert(error);
        }
    } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image. Please try again later.");
    }

    hideLoader(); // Hide loader after processing
};

const handleImageUploadSubmission3 = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    
    showLoader(); // Show loader while processing
    
    // Retrieve form data
    const formData = new FormData();
    formData.append("image", document.getElementById("image3").files[0]); // Assuming only one file is selected
    
    const appointmentId = sessionStorage.getItem("giveTreatmentPlanAppointmentId");

    try {
        const response = await fetch(`http://localhost:3000/upload-image-3/${appointmentId}`, {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            alert("Image uploaded successfully");
            // Optionally, redirect to another page after successful upload
            // window.location.href = "D:/Bachelor Software HU/Projects/Project-2 V.2/Frontend/html/success.html";
        } else {
            const error = await response.text();
            alert(error);
        }
    } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image. Please try again later.");
    }

    hideLoader(); // Hide loader after processing
};

document.getElementById("treatmentPlanForm").addEventListener("submit", handleTreatmentPlanSubmission);
document.getElementById("imageUploadForm").addEventListener("submit", handleImageUploadSubmission);
document.getElementById("imageUploadForm-1").addEventListener("submit", handleImageUploadSubmission1);
document.getElementById("imageUploadForm-2").addEventListener("submit", handleImageUploadSubmission2);
document.getElementById("imageUploadForm-3").addEventListener("submit", handleImageUploadSubmission3);
