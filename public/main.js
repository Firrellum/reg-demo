// This file contains the client-side JavaScript code for the authentication system.

// API URL
const API_URL = "http://localhost:3000";

//#region Imports
// Imports
import {showError, setCurrentYear, validateEmail, clearLogMessage, sanitizeInput, validatePassword, setDefaultPasswordHelperState } from './utils.js' // import helpers for utils.js

//#endregion

const log = document.getElementById("log"); // store log message element
const portalContainer = document.getElementById("portal-container"); // store portal container element

//#region User aouth functions  

// Function that starts the registration process.
// This function sends a POST request to the server to register a new user.
// This function is called when the user clicks the register button.
async function register() {
    const name = document.getElementById("regName").value; // gets the users name from the input field
    const email = document.getElementById("regEmail").value; // gets the users email from the input field
    const password = document.getElementById("regPassword").value; // gets the users password from the input field

    toggleLoading("registerBtn", "regLoader", true); // toggles loading state showing the loader and disabling the button
    showError("regError", ""); // clear errors

    // Fetch request to register user
    const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST", // method is POST
        headers: { "Content-Type": "application/json" }, // headers are set to JSON
        body: JSON.stringify({ name, email, password }), // body is the user's name, email and password
    });

    const data = await res.json(); // store response data in variable
    toggleLoading("registerBtn", "regLoader", false); // toggles loading state hiding the loader and enabling the button

    // If response is not ok, show error message
    if (!res.ok) {
        showError("regError", data.message || "Registration failed.");
    } else {
        log.textContent = "Registration successful! Please validate your email. Then login.";
    }
}

// Function that starts the login process.
// This function sends a POST request to the server to login a user.
// This function is called when the user clicks the login button.
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
        log.textContent = "Login successful!"; // success message
        console.log('Login successful!'); // log success message
        loadAvatar()
    }
}

// Function that starts the logout process.
// This function sends a POST request to the server to logout a user.
// This function is called when the user clicks the logout button.
async function logout() {
    await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
    log.textContent = "Logged out!"; // logout success message
    window.location.reload(); // reload the page
}

// Function that starts the Update Profile process.
// This function sends a POST request to the server to update a user's profile.
// This function is called when the user clicks the update button.
async function updateProfile() {
    let isEmailUpdated = true;
    const name = document.getElementById("profileName").value; // gets the users name from the input field
    const email = document.getElementById("profileEmail").value; // gets the users email from the input field
    const password = document.getElementById("profilePassword").value; // gets the users password from the input field
    const color = document.getElementById("profileAvatarColor").value; // gets the users avatar color from the input field

    toggleLoading("updateBtn", "updateLoader", true); // toggles loading state showing the loader and disabling the button

    // Fetch request to update user profile
    const res = await fetch(`${API_URL}/user/profile/update`, {
        method: "POST", // method is POST
        headers: { "Content-Type": "application/json" }, // headers are set to JSON
        body: JSON.stringify({ name, email, password, color, isEmailUpdated }), // body is the user's name, email, password and avatar color
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

// Function that starts the Forgot Password process.
// This function sends a POST request to the server to send a reset link to the user's email.
// This function is called when the user clicks the forgot password button.
async function sendResetLink() {
    const email = document.getElementById("forgotEmail").value; // gets the users email from the input field

    toggleLoading("forgotBtn", "forgotLoader", true); // toggles loading state showing the loader and disabling the button

    // Fetch request to send reset link
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST", // method is POST
        headers: { "Content-Type": "application/json" }, // headers are set to JSON
        body: JSON.stringify({ email }), // body is the user's email
    });

    const data = await res.json(); // store response data in variable

    toggleLoading("forgotBtn", "forgotLoader", false); // toggles loading state hiding the loader and enabling the button

    // If response is not ok, show error message
    if (!res.ok) {
        showError("forgotError", data.message || "Error sending reset link.");
    } else {
        log.textContent = "Password reset link sent to your email."; // success message to user to check email
    }
}

// Funcction that loads the avatar menu when user succsessfully logs in.
// This function senda a GET request to the server that returns information for the avatar based on the current session.
// This function is called when login is successfull.
async function loadAvatar() {
    // send a GET request tho the server for the user info
    const res = await fetch(`${API_URL}/user/profile`, { method: "GET", credentials: "include" }); 
    if (res.ok) {
        const data = await res.json();
        // updates to the profile avatar
        let profileAvatarPicture = document.getElementById('profileAvatar')

        profileAvatarPicture.style.backgroundColor = data.user.color
        profileAvatarPicture.textContent = `${data.user.name.charAt(0).toUpperCase()}`;

        //update profile name
        let profileName = document.getElementById('name-header')

        // profileName.textContent = `${data.user.name}'s Profile`


        
        document.getElementById("avatar").textContent = `${data.user.name.charAt(0).toUpperCase()}`; // sisplay first character of users name in the avatar
        document.getElementById("avatar").style.backgroundColor = data.user.color; // color the avatar with the users specific color 
        document.getElementById("profileAvatarColor").value = data.user.color; 
        document.getElementById("profileName").value = data.user.name;
        document.getElementById("profileEmail").value = data.user.email;
        document.getElementById("userAvatar").style.display = "block";
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("registerForm").style.display = "none";
        portalContainer.style.display = "none";
    } else {
        console.warn("No sessions found")
    }
}

// Function that loads the users extended informatioin and uptade options.
// This function displays the users profile area.
// This funciton is called when the user clicks 'profile' on the avatar dropdown.
function loadProfile() {
    console.log('profile button')
    document.getElementById("profile").style.display = "flex";
    portalContainer.style.display = "none";
}

// Check session on page load
window.onload = loadAvatar;

//#endregion

//#region UI Functions and Listeners

// Event listener triggered on page load completion
document.addEventListener("DOMContentLoaded", () => {

    // Button pressing and form checking section

    // store form links in an opject 
    const formButtons = {
        registerBtn: [register, 'click'],
        loginBtn: [login, 'click'],
        logoutBtn: [logout, 'click'],
        forgotBtn: [sendResetLink, 'click'],
        updateBtn: [updateProfile, 'click'], 
        loadProfileBtn: [loadProfile, 'click'],
        avatar: [toggleDropdown, 'click'],

        // these need to be called on the event
        loginEmail: [(e) => validateEmail('loginEmail', 'login-error-message', 'loginBtn'), 'input'],
        regEmail: [(e) => validateEmail('regEmail', 'reg-error-message', 'registerBtn'), 'input'],
        forgotEmail: [(e) => validateEmail('forgotEmail', 'forgot-error-message', 'forgotBtn'), 'input'],
        profileEmail: [(e) => validateEmail('profileEmail', 'update-error-message', 'updateBtn'), 'input'],

        loginPassword: [(e) => validatePassword('loginPassword', 'login-error-message','loginBtn', 'allpasswords'), 'input', ],
        regPassword: [(e) => validatePassword('regPassword', 'reg-error-message', 'registerBtn', 'allpasswords'), 'input', ],
        profilePassword: [(e) => validatePassword('profilePassword', 'update-error-message', 'updateBtn', 'allpasswords'), 'input', ],

        // loadHomeBtn: loadHome, // WIP : uncomment when starting this nav
    }
    
    // loop through object adding event listners for each form
    Object.keys(formButtons).forEach(id => {
        document.getElementById(id)?.addEventListener(formButtons[id][1], (e) => {
            e.preventDefault(); // prevent default <button>/<a> actions
            setDefaultPasswordHelperState('allpasswords')
            formButtons[id][0](); // call the corresponding function in the object
        });
    });

    // Form stitching Section
    const loginForm = document.getElementById("loginForm"); // get login form element
    const registerForm = document.getElementById("registerForm"); // get the registration form element
    const forgotForm = document.getElementById("forgotPasswordForm"); // get the forgot password form element

    // store form links in an opject 
    const formLinks = {
        toRegister: registerForm,
        toLogin: loginForm,
        toForgot: forgotForm,
        backToLogin: loginForm
    };
    
    // loop through object adding event listners for each form
    Object.keys(formLinks).forEach(id => {
        document.getElementById(id).addEventListener("click", (e) => {
            e.preventDefault(); // Prevent default <a> actions
            setDefaultPasswordHelperState('allpasswords')
            showForm(formLinks[id]);
        });
    });

    // Function that shows the form that was clicked on
    // This function hides all the forms then shows the selected one. 
    function showForm(form) {
        loginForm.style.display = "none";
        registerForm.style.display = "none";
        forgotForm.style.display = "none";
        form.style.display = "block";
    }

});



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

//#endregion


// Imported utility function calls 
// Start clearing log messages
clearLogMessage();
// Set the current year in the footer
setCurrentYear();