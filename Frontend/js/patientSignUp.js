$(document).ready(function () {
    // Error messages
    const errorMessages = {
        firstName: "Please enter a valid first name.",
        lastName: "Please enter a valid last name.",
        email: "Please enter a valid email address.",
        phone: "Please enter a valid Jordanian phone number.",
        nationalId: "Please enter a valid national ID.",
        dob: "Please enter a valid date of birth.",
        password: "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        confirmPassword: "Passwords do not match."
    };

    // Form submit event listener
    $("#signupForm").submit(async function (event) {
        // Prevent default form submission
        event.preventDefault();
        
        // Clear previous error messages
        $(".form-text").text("");

        // Retrieve form data
        const firstName = $("#f-name").val().trim();
        const lastName = $("#l-name").val().trim();
        const email = $("#email").val().trim();
        const phone = $("#phone").val().trim();
        const nationalId = $("#nationalId").val().trim();
        const dob = $("#dob").val().trim();
        const password = $("#password").val().trim();
        const confirmPassword = $("#confirmPassword").val().trim();

        // Validate form inputs
        let isValid = true;

        // First Name
        if (!firstName) {
            $("#f-name-error").text(errorMessages.firstName);
            isValid = false;
        }

        // Last Name
        if (!lastName) {
            $("#l-name-error").text(errorMessages.lastName);
            isValid = false;
        }

        // Email
        if (!isValidEmail(email)) {
            $("#email-error").text(errorMessages.email);
            isValid = false;
        }

        // Phone Number
        if (!isValidJordanianPhoneNumber(phone)) {
            $("#phone-error").text(errorMessages.phone);
            isValid = false;
        }

        // National ID
        if (!nationalId || !isValidNationalId(nationalId)) {
            $("#nationalId-error").text(errorMessages.nationalId);
            isValid = false;
        }

        // Date of Birth
        if (!isValidDateOfBirth(dob)) {
            $("#dob-error").text(errorMessages.dob);
            isValid = false;
        }

        // Password
        if (!isStrongPassword(password)) {
            $("#password-error").text(errorMessages.password);
            isValid = false;
        }

        // Confirm Password
        if (!passwordsMatch(password, confirmPassword)) {
            $("#confirmPassword-error").text(errorMessages.confirmPassword);
            isValid = false;
        }

        // If form is valid, submit it
        if (isValid) {
           await sendPostRequest(firstName, lastName, email, phone, nationalId, dob, password);
        }
    });


    // Function to send POST request to server
    async function sendPostRequest(firstName, lastName, email, phone, nationalId, dob, password) {
        const data = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,
            national_id: nationalId,
            dob: dob,
            password: password
        };

        try {
            const response = await fetch('http://localhost:3000/patient/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();
            console.log(responseData);

            if (response.ok) {
                // If the response is OK, it means authentication was successful
                console.log('Authentication successful');
                sessionStorage.setItem("loggedIn", "true");
                sessionStorage.setItem("username", data.first_name);
                sessionStorage.setItem("email_or_phone", email);
                sessionStorage.setItem("password", password);
                sessionStorage.setItem("isDentist", "false");
                sessionStorage.setItem("id", responseData.id);

                // Redirect to index.html
                window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/patientLogin.html";
            } else {
                // If the response is not OK, authentication failed
                console.log('Authentication failed:', responseData.error);
                $("#message").text(responseData.error);
                $("#message").show();
                window.scrollTo(0, 0);
            }
        
        } catch (error) {
            // Handle network errors or other exceptions
            console.error('Error:', error);
            $("#message").text('An error occurred. Please try again later.');
            $("#message").show();
            window.scrollTo(0, 0);
        }
    }

    // Function to check if email is valid
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Function to check if national ID is valid
    function isValidNationalId(nationalId) {
        const nationalIdRegex = /^[0-9]{10}$/;
        return nationalIdRegex.test(nationalId);
    }

    // Function to check if date of birth is valid
    function isValidDateOfBirth(dob) {
        const dobDate = new Date(dob);
        const currentDate = new Date();
        return dobDate < currentDate;
    }

    // Function to check if passwords match
    function passwordsMatch(password, confirmPassword) {
        return password === confirmPassword;
    }

    // Function to check if password meets strong criteria
    function isStrongPassword(password) {
        // Minimum length requirement
        if (password.length < 6) {
            return false;
        }

        // Check for uppercase, lowercase, number, and special character
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

        // All criteria must be met
        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    }

    // Function to validate Jordanian phone number
    function isValidJordanianPhoneNumber(phoneNumber) {
        // Regular expression to match Jordanian phone numbers
        const jordanianPhoneRegex = /^(?:\+?962|0)(?:7(?:(?:[789])(?=\d{7}$)\d{1}|[0123456](?=\d{7}$)\d{1}))\d{6}$/;
        return jordanianPhoneRegex.test(phoneNumber);
    }
});
