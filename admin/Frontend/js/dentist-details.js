
const signOutLink = document.getElementById("signoutLink");

// Check if user is logged in
$(document).ready(async () => {
    showLoader();

    if (sessionStorage.getItem("loggedIn") !== "true") {
        window.location.href = "login.html";
        return; // Added return to stop further execution
    }

    hideLoader();
});

async function main(){

    console.log('Getting unapproved dentists...');
    try {
        const data = await getUnapprovedDentists();
        console.log('Received data:', data);
        await renderDentistDetails(data);
    } catch (error) {
        console.error('Error getting unapproved dentists:', error.message);
    } finally {
        console.log('Hiding loader.');
        hideLoader();
    }

}


signOutLink.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "login.html";
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

// Fetch unapproved dentist by ID
async function getUnapprovedDentists() {
    try {
        const response = await fetch(`http://localhost:8080/get-dentist-by-id/${sessionStorage.getItem("chosenDentist")}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error.message);
        return {}; // Return empty object in case of error
    }
}

// Render dentist details
async function renderDentistDetails(dentistDetails) {
    try {
        // Show the loader and backdrop
        showLoader();

        const dentistNameElement = document.getElementById("dentistName");
        const dentistIdElement = document.getElementById("dentistId");
        const dentistExperienceElement = document.getElementById("dentistExperience");
        const dentistLocationElement = document.getElementById("dentistLocation");
        const dentistCertificateElement = document.getElementById("dentistCertificate");
        const dentistCertificateLink = document.getElementById("dentistCertificateLink");
        const dentistPhoneNumberElement = document.getElementById("dentistPhoneNumber");
        const dentistEmailElement = document.getElementById("dentistEmail");
        const approveButton = document.getElementById("approveButton");
        const rejectButton = document.getElementById("rejectButton");

        // Update the HTML elements with dentist details
        dentistNameElement.textContent = `Dentist Name: ${dentistDetails[0].first_name} ${dentistDetails[0].last_name}`;
        dentistIdElement.textContent = `Dentist ID: ${dentistDetails[0].id}`;
        dentistExperienceElement.textContent = `Years of Experience: ${dentistDetails[0].experience}`;
        dentistLocationElement.textContent = `Location: ${dentistDetails[0].location}`;
        dentistPhoneNumberElement.textContent = `Phone Number: ${dentistDetails[0].phone_number}`;
        dentistEmailElement.textContent = `Email: ${dentistDetails[0].email_address}`;
        dentistCertificateElement.src = dentistDetails[0].certificate_url;
        dentistCertificateLink.href = dentistDetails[0].certificate_url;
        dentistCertificateElement.alt = "Dentist Certificate";

        if(sessionStorage.getItem("canApprove") === "true"){
        

        // Add event listeners to approve and reject buttons
        approveButton.addEventListener("click", async () => {
            try {
                await approveDentist(dentistDetails[0].id, dentistDetails[0].email_address);
                // Optionally, you can add a message or update UI after approval
            } catch (error) {
                console.error('Error approving dentist:', error.message);
            }
        });

        rejectButton.addEventListener("click", async () => {
            try {
                await rejectDentist(dentistDetails[0].id, dentistDetails[0].email_address);
                // Optionally, you can add a message or update UI after rejection
            } catch (error) {
                console.error('Error rejecting dentist:', error.message);
            }
        });

    } else{

        approveButton.style.display = "none";
        rejectButton.style.display = "none";
    }

    } catch (error) {
        console.error('Error rendering dentist details:', error.message);
    } finally {
        // Hide the loader and backdrop after rendering
        hideLoader();
    }
}

// Sample functions for approve and reject
async function approveDentist(dentistId, dentistEmail) {
    // Implement approval logic here
    try {
        const response = await fetch(`http://localhost:8080/approve-dentist/${dentistId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dentistEmail: dentistEmail }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Redirect to dentist page with escaped backslashes
        window.location.href = 'D:\\Bachelor Software HU\\Projects\\Project-2 V.2\\admin\\Frontend\\html\\dentist.html';

    } catch (error) {
        console.error('Error approving dentist:', error.message);
    }
}

async function rejectDentist(dentistId, dentistEmail) {
    // Implement rejection logic here
    try {
        const response = await fetch(`http://localhost:8080/reject-dentist/${dentistId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dentistEmail: dentistEmail }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Redirect to dentist page with escaped backslashes
        window.location.href = 'D:\\Bachelor Software HU\\Projects\\Project-2 V.2\\admin\\Frontend\\html\\dentist.html';
    } catch (error) {
        console.error('Error rejecting dentist:', error.message);
    }
}


main();