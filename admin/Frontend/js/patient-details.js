const signOutLink = document.getElementById("signoutLink");

// Check if user is logged in
$(document).ready(main); // Call the main function when the document is ready

async function main() {
    showLoader();

    if (sessionStorage.getItem("loggedIn") !== "true") {
        window.location.href = "login.html";
        return; // Added return to stop further execution
    }

    try {
        console.log('Fetching patient details...');
        const patientId = sessionStorage.getItem("chosenPatient");
        const patientDetails = await getPatientById(patientId);
        console.log('Received patient details:', patientDetails);
        await renderPatientDetails(patientDetails);
    } catch (error) {
        console.error('Error fetching patient details:', error.message);
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

// Function to fetch patient details by ID
async function getPatientById(patientId) {
    try {
        const response = await fetch(`http://localhost:8080/get-patient-by-id/${patientId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const patientDetails = await response.json();
        return patientDetails;
    } catch (error) {
        console.error('Fetch error:', error.message);
        return null;
    }
}

// Function that calculates age
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// Function to render patient details
async function renderPatientDetails(patientDetails) {
    
    // Example: Update DOM elements with patient details
    document.getElementById("patientName").textContent = `Patient Name: ${patientDetails[0].firstname} ${patientDetails[0].lastname}`;
    document.getElementById("patientId").textContent = `Patient ID: ${patientDetails[0].id}`;
    const age = calculateAge(patientDetails[0].date_of_birth);
    document.getElementById("patientAge").textContent = `Age: ${age}`;
    document.getElementById("patientPhone").textContent = `Phone Number: ${patientDetails[0].phone}`;
    document.getElementById("patientDateOfBirth").textContent = `Date of Birth: ${patientDetails[0].date_of_birth.substring(0, 10)}`;
    document.getElementById("patientEmail").textContent = `Email: ${patientDetails[0].email}`;
    // Update other DOM elements as needed

    // Create a heading
    const heading = document.createElement("h6");
    heading.textContent = "Absent Dates:";

    //  Add margin left to the heading
    heading.style.marginLeft = "3%";

    // Add heading to the card
    const card = document.getElementById("patientDetails");
    card.appendChild(heading);

    if(patientDetails[0]["absentDates"].length > 0) {

        // Create a list
        const list = document.createElement("ol");

        // Add items to the list
        patientDetails[0]["absentDates"].forEach(absentDates => {
            const listItem = document.createElement("li");

            // Format the absent dates
            absentDates = absentDates.substring(0, 10);
    
            listItem.textContent = absentDates;
            list.appendChild(listItem);
        });

        card.appendChild(list);
    } else {
        // Add none if no dates are present
        const none = document.createElement("p");
        none.textContent = "None";
        none.style.marginLeft = "3%";
        card.appendChild(none);
    }

}

main();
