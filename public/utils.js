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


export function validatePassword(value, err, btn, log){
    const passwordInput = document.getElementById(value);
    const errorMessage = document.getElementById(err);
    const disableBtn = document.getElementById(btn);
    const passordHelper = document.getElementById(log);
    passordHelper.style.display = 'flex';

    // console.log(passwordInput.value)
    passwordInput.value = sanitizeInput(passwordInput.value)

    const passwordRequirements = {
        uppercase: /[A-Z]/,
        digit: /\d/,
        specialChar: /[@$!%*?&]/,
        length: /^.{8,}$/
    }

    let checks = {
        uppercase: passwordRequirements.uppercase.test(sanitizeInput(passwordInput.value)),
        digit: passwordRequirements.digit.test(sanitizeInput(passwordInput.value)),
        specialChar: passwordRequirements.specialChar.test(sanitizeInput(passwordInput.value)),
        length: passwordRequirements.length.test(sanitizeInput(passwordInput.value)),
    }

    const messages = [
        {text: "Must include uppercase", passed: checks.uppercase},
        {text: "Must include a number", passed: checks.digit},
        {text: "Must include a scecial character", passed: checks.specialChar},
        {text: "Must include at least 8 characters", passed: checks.length},
    ]

    passordHelper.innerText = '';

    messages.forEach(msg => {
        const p = document.createElement('p')
        p.textContent = msg.text + " "
        const span = document.createElement('span')
        span.textContent = msg.passed ? '[tick]' : '[x]'
        span.style.color = msg.passed ? 'yellowgreen' : 'red'
        p.appendChild(span)
        passordHelper.appendChild(p)
    })

    if(checks.uppercase && checks.digit && checks.specialChar && checks.length){
        disableBtn.disabled = false;
    }else{
       disableBtn.disabled = true;
    }

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


// Function to clean up / set defaults
// This will clean up the Ui
export function setDefaultPasswordHelperState(element){
    console.log('setstate')
    const targetElement = document.getElementById(element);
    if (targetElement) { 
        console.log('setting..')
        targetElement.style.display = 'none';
        targetElement.innerText = 'waiting..';
    } else {
        console.warn(`Element with ID "${element}" not found.`);
    }
}