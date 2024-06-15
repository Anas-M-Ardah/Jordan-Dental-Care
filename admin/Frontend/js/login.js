document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('submit-btn');
    const passwordField = document.getElementById('password');
    const showPasswordCheckbox = document.getElementById('showPasswordCheckbox');

    // Function to handle login form submission
    submitBtn.addEventListener('click', async function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Get the form data
        const email = document.getElementById('username').value;
        const password = passwordField.value;

        try {
            // Send Post request to server
            const response = await fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            // Redirect to home page on successful login
            if (response.ok) {
                sessionStorage.setItem("loggedIn", "true");
                window.location.href = 'home.html';
            } else {
                // Display error message on unsuccessful login
                const errorText = await response.text();
                const errorObj = JSON.parse(errorText); // Parse the text into a JavaScript object
                const errorMessage = errorObj.error; // Get the value of the "error" property
                alert(errorMessage); // Display the error message in an alert                
            }

        } catch (error) {
            alert('Error logging in. Please try again.');
            console.error(error);
        }
    });

    // Function to toggle password visibility
    showPasswordCheckbox.addEventListener('change', function() {
        const passwordFieldType = passwordField.getAttribute('type');
        if (this.checked) {
            passwordField.setAttribute('type', 'text');
        } else {
            passwordField.setAttribute('type', 'password');
        }
    });
});
