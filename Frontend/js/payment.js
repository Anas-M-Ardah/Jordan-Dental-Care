// Function to validate card number using the Luhn algorithm
function validateCardNumber(cardNumber) {
    // Remove any non-digit characters from the card number
    cardNumber = cardNumber.replace(/\D/g, '');

    // Check if the card number is a valid 16-digit number using the Luhn algorithm
    const digits = cardNumber.split('').map(Number);
    let sum = 0;
    let isEven = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = digits[i];
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        sum += digit;
        isEven = !isEven;
    }
    return sum % 10 === 0;
}

function validateExpiryDate(expiryDate) {
    // Validate the format of the expiry date (MM/YY)
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/; // MM/YY format
    if (!regex.test(expiryDate)) {
        return false;
    }

    // Split the expiry date into month and year parts
    const parts = expiryDate.split('/');
    const month = parseInt(parts[0], 10);
    const year = parseInt(parts[1], 10);

    // Get the current date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last two digits of the current year
    const currentMonth = currentDate.getMonth() + 1; // Months are zero-indexed

    // Check if the expiry date is in the future
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return false;
    }

    return true;
}


// Function to validate card network (Visa or Mastercard)
function validateCardNetwork(cardNumber) {
    // Check if the card number starts with a valid Visa or Mastercard prefix
    const visaPrefixes = /^(4[0-9]{12}(?:[0-9]{3})?)$/; // Visa cards start with 4
    const mastercardPrefixes = /^(5[1-5][0-9]{14})$/; // Mastercard cards start with 51 through 55
    return visaPrefixes.test(cardNumber) || mastercardPrefixes.test(cardNumber);
}

// Function to validate CVV (Card Verification Value)
function validateCVV(cvv) {
    // CVV must be a 3-digit number
    return /^\d{3}$/.test(cvv);
}

// Event listener for form submission
document.getElementById('paymentForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting by default

    // Get the values entered by the user
    const cardNumber = document.getElementById('cardNumber').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;

    // Validate card number using Luhn algorithm
    const cardNumberError = document.getElementById('cardNumberError');
    if (!validateCardNumber(cardNumber)) {
        cardNumberError.textContent = 'Please enter a valid card number';
        return; // Stop further processing if card number is invalid
    } else {
        cardNumberError.textContent = ''; // Clear the error message if card number is valid
    }

    // Validate card network (Visa or Mastercard)
    if (!validateCardNetwork(cardNumber)) {
        cardNumberError.textContent = 'Please enter a valid Visa or Mastercard number';
        return; // Stop further processing if card number is not Visa or Mastercard
    }

    // Validate expiry date
    const expiryDateError = document.getElementById('expiryDateError');
    if (!validateExpiryDate(expiryDate)) {
        expiryDateError.textContent = 'Please enter a valid expiry date in MM/YY format';
        return; // Stop further processing if expiry date is invalid
    } else {
        expiryDateError.textContent = ''; // Clear the error message if expiry date is valid
    }

    // Validate CVV
    const cvvError = document.getElementById('cvvError');
    if (!validateCVV(cvv)) {
        cvvError.textContent = 'Please enter a valid 3-digit CVV';
        return; // Stop further processing if CVV is invalid
    } else {
        cvvError.textContent = ''; // Clear the error message if CVV is valid
    }

    // If all validations pass, you can proceed with the payment processing
    // For simplicity, let's log a success message to the console
    console.log('Payment successful!');
    window.location.href = "myAppointments.html";
});
