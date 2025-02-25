// This file contains the client-side JavaScript code for the authentication system.

// API URL
const API_URL = "http://localhost:3000";

const log = document.getElementById("log"); // store log message element
const portalContainer = document.getElementById("portal-container"); // store portal container element

// Function that shows error messages
// This function is called when an error message is needed
function showError(elementId, message) {
    document.getElementById(elementId).innerText = message;
}

// Function that toggles loading state of buttons and displays/hides loader animation
// This function is called when a load state is needed
function toggleLoading(buttonId, loaderId, isLoading) { // gets buttonId, loaderId and isLoading as parameters
    document.getElementById(buttonId).disabled = isLoading; // disables button when isLoading is true
    let x = document.getElementById(loaderId); // gets desired loader element by id
    document.getElementById(loaderId).style.display = isLoading ? x.classList.add('loader') : x.classList.remove('loader'); // displays loader when isLoading is true
}

// Function that toggles dropdown menu
// This function is called when the user clicks the avatar
function toggleDropdown() {
    var dropdown = document.getElementById("dropdown"); // gets the dropdown element by id
    // checks if dropdown is hidden or displayed
    if (dropdown.style.display === "none" || dropdown.style.display === "") { 
        dropdown.style.display = "block"; // if dropdown is hidden, display it
    } else {
        dropdown.style.display = "none"; // if dropdown is displayed, hide it
    }
}

// Event listener that closes dropdown menu when user clicks outside of it
document.addEventListener("click", function(event) {
    var dropdown = document.getElementById("dropdown"); // gets the dropdown element by id
    var avatar = document.getElementById("avatar"); // gets the avatar element by id
    // If the user clicks outside the dropdown and avatar, hide the dropdown
    if (!dropdown.contains(event.target) && !avatar.contains(event.target)) { 
        dropdown.style.display = "none"; // hide the dropdown
    }
});

// Function that starts the registration process
// This function sends a POST request to the server to register a new user
// This function is called when the user clicks the register button
async function register() {
    const name = document.getElementById("regName").value; // gets the users name from the input field
    const email = document.getElementById("regEmail").value; // gets the users email from the input field
    const password = document.getElementById("regPassword").value; // gets the users password from the input field

    toggleLoading("regBtn", "regLoader", true); // toggles loading state showing the loader and disabling the button
    showError("regError", ""); // clear errors

    // Fetch request to register user
    const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST", // method is POST
        headers: { "Content-Type": "application/json" }, // headers are set to JSON
        body: JSON.stringify({ name, email, password }), // body is the user's name, email and password
    });

    const data = await res.json(); // store response data in variable
    toggleLoading("regBtn", "regLoader", false); // toggles loading state hiding the loader and enabling the button

    // If response is not ok, show error message
    if (!res.ok) {
        showError("regError", data.message || "Registration failed.");
    } else {
        log.innerHTML = "Registration successful! Please validate your email. Then login.";
    }
}

// Function that starts the login process
// This function sends a POST request to the server to login a user
// This function is called when the user clicks the login button
async function login() {
    const email = document.getElementById("loginEmail").value; // gets the users email from the input field
    const password = document.getElementById("loginPassword").value; // gets the users password from the input field

    toggleLoading("loginBtn", "loginLoader", true); // toggles loading state showing the loader and disabling the button
    showError("loginError", ""); // clear errors

    // Fetch request to login user
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST", // method is POST
        headers: { "Content-Type": "application/json" }, // headers are set to JSON
        body: JSON.stringify({ email, password }), // body is the user's email and password
        credentials: "include" // include credentials
    });

    const data = await res.json(); // store response data in variable
    toggleLoading("loginBtn", "loginLoader", false); // toggles loading state hiding the loader and enabling the button

    // If response is not ok, show error message
    if (!res.ok) {
        showError("loginError", data.message || "Login failed.");
    } else {
        portalContainer.style.display = "none"; // hide registration and login parent portal container
        log.innerHTML = "Login successful!"; // success message
        console.log('Login successful!'); // log success message
    }
}

// Function that starts the Update Profile process
// This function sends a POST request to the server to update a user's profile
// This function is called when the user clicks the update button
async function updateProfile() {
    const name = document.getElementById("profileName").value; // gets the users name from the input field
    const email = document.getElementById("profileEmail").value; // gets the users email from the input field
    const password = document.getElementById("profilePassword").value; // gets the users password from the input field
    const color = document.getElementById("profileAvatar").value; // gets the users avatar color from the input field

    toggleLoading("updateBtn", "updateLoader", true); // toggles loading state showing the loader and disabling the button

    // Fetch request to update user profile
    const res = await fetch(`${API_URL}/user/profile/update`, {
        method: "POST", // method is POST
        headers: { "Content-Type": "application/json" }, // headers are set to JSON
        body: JSON.stringify({ name, email, password, color }), // body is the user's name, email, password and avatar color
        credentials: "include", // include credentials
    });

    const data = await res.json(); // store response data in variable

    toggleLoading("updateBtn", "updateLoader", false); // toggles loading state hiding the loader and enabling the button
    
    document.getElementById("log").innerText = data.message || data.error; // show message or error
    
    // If response is ok, show success alert and load avatar
    if (res.ok) {
        // alert(data.message);
        loadAvatar()
    }
}

// Clear log message every 30 seconds
function clearLogMessage() {
    setInterval(() => {
        log.innerHTML = '';
    }, 30000);
}

// Start clearing log messages
clearLogMessage();

// Send Reset Link
async function sendResetLink() {
    const email = document.getElementById("forgotEmail").value;

    toggleLoading("forgotBtn", "forgotLoader", true);

    const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    const data = await res.json();
    toggleLoading("forgotBtn", "forgotLoader", false);

    if (!res.ok) {
        showError("forgotError", data.message || "Error sending reset link.");
    } else {
        log.innerHTML = "Password reset link sent to your email.";
    }
}

// Reset Password
async function resetPassword() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token"); // Get token from URL
    const newPassword = document.getElementById("newPassword").value;

    const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
        showError("resetError", data.message || "Failed to reset password.");
    } else {
        log.innerHTML = "Password updated successfully!";
        window.location.href = "index.html"; // Redirect to login
    }
}

// Show Reset Password Form if Token Exists
window.onload = function () {
    if (new URLSearchParams(window.location.search).has("token")) {
        document.getElementById("resetPasswordForm").style.display = "block";
    }
};

// Smooth form switch
function switchToLogin() {
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
}

// Logout
async function logout() {
    await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
    log.innerHTML = "Logged out!";
    window.location.reload();
}

// Load avatar menu
async function loadAvatar() {
    const res = await fetch(`${API_URL}/user/profile`, { method: "GET", credentials: "include" });
    if (res.ok) {
        const data = await res.json();
        document.getElementById("avatar").innerHTML = `<span>${data.user.name.charAt(0).toUpperCase()}</span>`;
        document.getElementById("avatar").style.backgroundColor = data.user.color;
        document.getElementById("profileAvatar").value = data.user.color;
        document.getElementById("userProfile").style.display = "block";
        portalContainer.style.display = "none";
    } else {
       
    }
}

// Load profile
async function loadProfile() {
    let x = document.getElementById('loginLoader');
    x.classList.add('loader');

    const res = await fetch(`${API_URL}/user/profile`, { method: "GET", credentials: "include" });
    if (res.ok) {
        const data = await res.json();
        document.getElementById("profileName").value = data.user.name;
        document.getElementById("profileEmail").value = data.user.email;
        document.getElementById("profile").style.display = "block";
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("registerForm").style.display = "none";
        portalContainer.style.display = "none";
        x.classList.remove('loader');
    } else {
        x.classList.remove('loader');
    }
}

// Check session on page load
window.onload = loadAvatar;

document.addEventListener("DOMContentLoaded", () => {
    // Form elements
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const forgotForm = document.getElementById("forgotPasswordForm");
    const resetForm = document.getElementById("resetPasswordForm");

    // Navigation Links
    document.getElementById("toRegister").addEventListener("click", (e) => {
        e.preventDefault();
        showForm(registerForm);
    });

    document.getElementById("toLogin").addEventListener("click", (e) => {
        e.preventDefault();
        showForm(loginForm);
    });

    document.getElementById("toForgot").addEventListener("click", (e) => {
        e.preventDefault();
        showForm(forgotForm);
    });

    document.getElementById("backToLogin").addEventListener("click", (e) => {
        e.preventDefault();
        showForm(loginForm);
    });

    // Show the appropriate form
    function showForm(form) {
        loginForm.style.display = "none";
        registerForm.style.display = "none";
        forgotForm.style.display = "none";
        resetForm.style.display = "none";
        form.style.display = "block";
    }

    // Check for Reset Token in URL
    const params = new URLSearchParams(window.location.search);
    if (params.has("token")) {
        document.getElementById("resetToken").value = params.get("token");
        showForm(resetForm);
    } else {
        showForm(loginForm); // Default to login form
    }
});

// Set current year
function setCurrentYear() {
    const year = new Date().getFullYear();
    document.getElementById("year").innerText = year;
}

// Call the function to set the year
setCurrentYear();

function validateEmail(value, err) {
    const emailInput = document.getElementById(value, err);
    const errorMessage = document.getElementById(err);
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (emailInput.value.match(emailPattern) || emailInput.value === "") {
        errorMessage.style.display = "none";
    } else {
        errorMessage.style.display = "block";
        errorMessage.innerText = 'Invalid email';
    }
}

