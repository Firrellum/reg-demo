// This file contains utility functions that help the main.js

// Function that shows error messages
// This function is called when an error message is needed
export function showError(elementId, message) {
    document.getElementById(elementId).innerText = message;
}


export function validateEmail(value, err, btn) {
    const emailInput = document.getElementById(value);
    const errorMessage = document.getElementById(err);
    const disableBtn = document.getElementById(btn);
    
    // sanitize user input before checking
    emailInput.value = sanitizeInput(emailInput.value);

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (emailInput.value.match(emailPattern) || emailInput.value === "") {
        errorMessage.style.display = "none";
        disableBtn.disabled = false;
    } else {
        errorMessage.style.display = "block";
        errorMessage.innerText = 'Invalid email';
        disableBtn.disabled = true;
    }
}

export function sanitizeInput(input) {
    return input
        .replace(/[<>\/\\'"]/g, '')  // remove < > / \ ' "
        .replace(/&/g, '&amp;')      // encode &
        .replace(/\s+/g, ' ')        // collapse spaces
        .trim();                     // trim spaces
}


// Clear log message every 30 seconds
export function clearLogMessage() {
    setInterval(() => {
        log.innerHTML = '';
    }, 30000);
}

// Set current year
export function setCurrentYear() {
    const year = new Date().getFullYear();
    document.getElementById("year").innerText = year;
}