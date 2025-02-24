const API_URL = "http://localhost:3000";

const log = document.getElementById("log");
const portalContainer = document.getElementById("portal-container");
// Show error messages
function showError(elementId, message) {
    document.getElementById(elementId).innerText = message;
}

// Toggle loading state
function toggleLoading(buttonId, loaderId, isLoading) {
    document.getElementById(buttonId).disabled = isLoading;
    let x = document.getElementById(loaderId);
    document.getElementById(loaderId).style.display = isLoading ? x.classList.add('loader') : x.classList.remove('loader');
    // document.getElementById(loaderId).style.display = isLoading ? "block" : "none";
}

function toggleDropdown() {
    var dropdown = document.getElementById("dropdown");
    if (dropdown.style.display === "none" || dropdown.style.display === "") {
        dropdown.style.display = "block";
    } else {
        dropdown.style.display = "none";
    }
}

document.addEventListener("click", function(event) {
    var dropdown = document.getElementById("dropdown");
    var avatar = document.getElementById("avatar");
    if (!dropdown.contains(event.target) && !avatar.contains(event.target)) {
        dropdown.style.display = "none";
    }
});

// Register
async function register() {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    toggleLoading("regBtn", "regLoader", true);
    showError("regError", ""); // Clear errors

    const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    toggleLoading("regBtn", "regLoader", false);

    if (!res.ok) {
        showError("regError", data.message || "Registration failed.");
    } else {
        log.innerHTML = "Registration successful! Please Validate your email. Then Login.";
        // switchToLogin();
    }
}

// Login
async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    toggleLoading("loginBtn", "loginLoader", true);
    showError("loginError", ""); 

    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
    });

    const data = await res.json();
    toggleLoading("loginBtn", "loginLoader", false);
    

    if (!res.ok) {
        showError("loginError", data.message || "Login failed.");
    } else {
        portalContainer.style.display = "none";
        log.innerHTML = "Login successful!";
        loadProfile();
    }
}

async function updateProfile() {
    const name = document.getElementById("profileName").value;
    const email = document.getElementById("profileEmail").value;
    const password = document.getElementById("profilePassword").value;
    const color = document.getElementById("profileAvatar").value;

    toggleLoading("updateBtn", "updateLoader", true);

    const res = await fetch(`${API_URL}/user/profile/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, color }),
        credentials: "include",
    });

    const data = await res.json();
    toggleLoading("updateBtn", "updateLoader", false);
    document.getElementById("log").innerText = data.message || data.error;
    
    if (res.ok) {
        alert("Profile updated successfully!");
        loadProfile();
    }
}

async function loadProfile() {
    const res = await fetch("/auth/profile", { credentials: "include" });
    const data = await res.json();

    if (data.user) {
        document.getElementById("profileName").value = data.user.name;
        document.getElementById("profileEmail").value = data.user.email;
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
    log,innerHTML = "Logged out!";
    window.location.reload();
}

// Load profile
async function loadProfile() {

    let x = document.getElementById('loginLoader');
    x.classList.add('loader');

    const res = await fetch(`${API_URL}/user/profile`, { method: "GET", credentials: "include" });
    if (res.ok) {
        const data = await res.json();
        // console.log(data);
        document.getElementById("avatar").innerHTML = `<span>${data.user.name.charAt(0).toUpperCase()}</span>`;
        document.getElementById("avatar").style.backgroundColor = data.user.color;
        document.getElementById("profileName").value = data.user.name;
        document.getElementById("profileEmail").value = data.user.email;
        document.getElementById("profileAvatar").value = data.user.color;
        document.getElementById("profile").style.display = "block";
        document.getElementById("userProfile").style.display = "block";
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("registerForm").style.display = "none";
        portalContainer.style.display = "block";
        x.classList.remove('loader');
    }else{
        x.classList.remove('loader');
    }
}

// Check session on page load
window.onload = loadProfile;


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