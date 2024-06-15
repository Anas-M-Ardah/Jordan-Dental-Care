// Get the form element
const registrationForm = document.getElementById('registrationForm');

// Add an event listener for the form's submit event
registrationForm.addEventListener('submit', function(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Get the values of the form fields
    const userType = document.getElementById('userType').value;
    const hasAccount = document.getElementById('hasAccount').value;

    // Define the URLs for redirection
    let redirectUrl;

    // Determine the redirect URL based on the selected options
    if (hasAccount === 'yes') {
        if (userType === 'patient') {
            redirectUrl = 'patientLogin.html';
        } else if (userType === 'doctor') {
            redirectUrl = 'dentistLogin.html';
        }
    } else if (hasAccount === 'no') {
        if (userType === 'patient') {
            redirectUrl = 'patientSignUp.html';
        } else if (userType === 'doctor') {
            redirectUrl = 'dentistSignUp.html';
        }
    }

    // Redirect the user to the appropriate page
    window.location.href = redirectUrl;
});
