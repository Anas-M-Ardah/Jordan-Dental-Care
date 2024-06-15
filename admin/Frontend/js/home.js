const signOutLink = document.getElementById("signoutLink");

// Check if user is logged in
$(document).ready(() => {

    showLoader();

    if (sessionStorage.getItem("loggedIn") !== "true") {
        window.location.href = "login.html";
    }

    hideLoader();
});

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