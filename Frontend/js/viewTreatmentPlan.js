function showLoader() {
    $('#loader, #backdrop').css('display', 'block');
}

function hideLoader() {
    $('#loader, #backdrop').css('display', 'none');
}

$(document).ready(async function(){
    showLoader();

    if (!sessionStorage.getItem("loggedIn")) {
        window.location.href = "patientLogin.html";
        return;
    }

    const username = $('#register');
    username.text(sessionStorage.getItem("username"));
    username.attr('href', sessionStorage.getItem("isDentist") === "true" ?
        "dentistProfile.html" :
        "patientProfile.html");

    $('#myAppointments').attr('href', sessionStorage.getItem("isDentist") === "true" ?
        "myAppointmentsDentist.html" :
        "myAppointmentsPatient.html");

    const data = await fetchData();
    renderData(data);
    hideLoader();
});

async function fetchData() {
    try {
        const appointmentId = sessionStorage.getItem("viewTreatmentPlanAppointmentId");
        const response = await fetch(`http://localhost:3000/view-treatment-plan/${appointmentId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin"
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

function renderData(data) {
    const outputContainer = $('.output-container');
    const errorMessage = "<p>Dentist did not provide a treatment plan yet</p>";

    if (!data) {
        console.log("Data is null or undefined");
        outputContainer.html(errorMessage);
        return;
    }

    try {
        $('#patientName').text(data[0].patient_name || "N/A");
        $('#date').text(data[0].date ? new Date(data[0].date).toDateString() : "N/A");
        $('#medicalHistory').text(data[0].medical_history || "N/A");
        $('#dentalIssues').text(data[0].dental_issues || "N/A");
        $('#proposedTreatmentPlan').text(data[0].proposed_treatment_plan || "N/A");
        $('#estimatedCost').text(data[0].estimated_cost || "N/A");
        $('#additionalComments').text(data[0].additional_comments || "N/A");
        $('#planImage').attr('src', data[0].image_url || "");
        $('#planImage1').attr('src', data[0].image_url_1 || "");
        $('#planImage2').attr('src', data[0].image_url_2 || "");
        $('#planImage3').attr('src', data[0].image_url_3 || "");

        // outputContainer.empty();
    } catch (error) {
        console.error("Error rendering data:", error);
        outputContainer.html(errorMessage);
    }
}
