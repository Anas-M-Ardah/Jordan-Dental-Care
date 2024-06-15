document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission
    hideMessage();
    // Get the form data
    const emailOrPhoneNumber = document.getElementById('emailOrPhoneNumber').value;
    const password = document.getElementById('password').value;

    // Define the data to be sent in the request body
    const data = {
        emailOrPhoneNumber,
        password
    };

    // Make a POST request to the '/dentist/login' endpoint
    try {
        const response = await fetch('http://localhost:3000/dentist/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Parse the JSON response
        const responseData = await response.json();
    
        // Handle the response
        if (response.ok) {
            // If the response is OK, it means authentication was successful
            console.log('Authentication successful');
            sessionStorage.setItem("loggedIn", "true");
            sessionStorage.setItem("username", responseData.username);
            sessionStorage.setItem("email_or_phone", emailOrPhoneNumber);
            sessionStorage.setItem("password", password);
            sessionStorage.setItem("isDentist", "true");
            sessionStorage.setItem("id", responseData.id);
            sessionStorage.setItem("isApproved", responseData.isApproved);

            if (responseData.isBanned) {
                alert("Your account has been banned!");
                return;
            } 

            // Redirect to the appropriate page based on the response
            window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/index.html";
        } else {
            // If the response is not OK, authentication failed
            console.log('Authentication failed:', responseData.error);
            showMessage(responseData.error);
            // Handle the error message, display it to the user, or take appropriate action
        }
    } catch (error) {
        // Handle network errors or other exceptions
        console.error('Error:', error);
    }
});

document.getElementById('showPasswordButton').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const button = document.getElementById('showPasswordButton');
    
    // Toggle the type attribute of the password input field
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        button.textContent = 'Hide Password';
    } else {
        passwordInput.type = 'password';
        button.textContent = 'Show Password';
    }
});


function showMessage(errorMessage) {
    const message = document.getElementById("message");
    
    // Show the message
    message.style.display = "block";

    // Set the message content
    message.textContent = errorMessage;
}

function hideMessage(){
    const message = document.getElementById("message");

    // Hide the message
    message.style.display = "none";
}




