// on click send a post request
const submitBtn = document.getElementById("submit-btn");

submitBtn.addEventListener("click", async function (event) {
    event.preventDefault();

    const emailOrPhoneNumber = document.getElementById("emailOrPhoneNumber").value;

    // Define the data to be sent in the request body
    const data = {
        emailOrPhoneNumber
    };
    
    const response = await fetch("http://localhost:3000/patient/forgot-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.message) {
        showMessage("Email sent successfully");
    }

    if (result.error) {
        showMessage(result.error);
    }
});

function showMessage(content) {
    const message = document.getElementById("message");
    message.style.display = "block";
    message.textContent = content;
    message.style.color = "red";
    window.scrollTo(0, 0);
}
