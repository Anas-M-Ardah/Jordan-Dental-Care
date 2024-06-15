function getFormData() {
    const formData = {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        dob: document.getElementById("dob").value.trim(),
        nationalId: document.getElementById("nationalId").value.trim(),
        email: document.getElementById("email").value.trim(),
        phoneNumber: document.getElementById("phoneNumber").value.trim(),
        location: document.getElementById("location").value.trim(),
        experience: document.getElementById("experience").value.trim(),
        certificateUrl: document.getElementById("certificateUrl").value.trim(),
        imageUrl: document.getElementById("imageUrl").value.trim(),
        password: document.getElementById("password").value.trim(),
        confirmPassword: document.getElementById("confirmPassword").value.trim(),
        gender: document.getElementById("gender").value.trim()
    };
    return formData;
}

function passwordsMatch(password, confirmPassword) {
    return password === confirmPassword;
}

function isOlderThan18(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18;
}

function isValidNationalId(nationalId) {
    const nationalIdRegex = /^[0-9]{10}$/;
    return nationalIdRegex.test(nationalId);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidJordanianPhoneNumber(phoneNumber) {
    const jordanianPhoneRegex = /^(?:\+?962|0)(?:7(?:(?:[789])(?=\d{7}$)\d{1}|[0123456](?=\d{7}$)\d{1}))\d{6}$/;
    return jordanianPhoneRegex.test(phoneNumber);
}

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


function validateInputs() {

    if (!passwordsMatch(getFormData().password, getFormData().confirmPassword)) {
        alert("Passwords do not match");
        return;
    }

    if (!isOlderThan18(getFormData().dob)) {
        alert("You must be older than 18 to sign up");
        return;
    }

    if (!isValidNationalId(getFormData().nationalId)) {
        alert("Invalid National ID");
        return;
    }

    if (!isValidEmail(getFormData().email)) {
        alert("Invalid Email");
        return;
    }

    if (!isValidJordanianPhoneNumber(getFormData().phoneNumber)) {
        alert("Invalid Phone Number");
        return;
    }

    if (!isStrongPassword(getFormData().password)) {
        alert("Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character");
        return;
    }
 
}

const showPassword = document.getElementById('showPassword');
showPassword.addEventListener('click', function() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    if (password.type === 'password' && confirmPassword.type === 'password') {
        password.type = 'text';
        confirmPassword.type = 'text';
    } else {
        password.type = 'password';
        confirmPassword.type = 'password';
    }
});

async function sendPostRequest(){
    const formData = getFormData();  // make sure formData is not null
    if (!formData) {  // if it is null, throw an error
        throw new Error("Null pointer exception when trying to get formData");
    }

    try{
        const response = await fetch('http://localhost:3000/dentist/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response) {  // if response is null, throw an error
            throw new Error("Null pointer exception when trying to get response");
        }

        if(response.ok){
            window.location.href = "file:///D:/Bachelor%20Software%20HU/Projects/Project-2%20V.2/Frontend/html/dentistLogin.html";
        }else if(response.status === 400){
            alert("Dentist already exists. Please Login instead");
        } else {
            const errorText = await response.text();  // make sure errorText is not null
            if (!errorText) {
                throw new Error("Null pointer exception when trying to get errorText");
            }
            alert("Something went wrong: " + errorText);
        }

    } catch(error){
        console.log(error);  // log the error
        alert("Something went wrong. Please try again later");
    }

}




async function main(e){
    e.preventDefault();
    validateInputs();
    await sendPostRequest();
}

const signUpButton = document.getElementById('signUpButton');
signUpButton.addEventListener('click', main);
