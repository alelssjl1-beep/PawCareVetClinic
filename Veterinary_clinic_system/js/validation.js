// Add input validation to all forms on page
const allForms = document.querySelectorAll('form');
for (let i = 0; i < allForms.length; i++) {
  const form = allForms[i];
  form.addEventListener('input', function(e) {
    checkInput(e.target); // Validate the input that was changed
  });
}

// Validate single input field
function checkInput(input) {
  const inputId = input.id;
  const inputVal = input.value.trim();
  const errorDiv = document.getElementById(`${inputId}-error`);

  // Clear old error styles/messages
  input.classList.remove('is-invalid');
  errorDiv?.remove(); // Remove error div if exists

  // Validate email format
  if (inputId.includes('email')) {
    if (inputVal && !isEmailValid(inputVal)) {
      showInputError(input, 'Enter a valid email (like name@example.com)');
    }
  }

  // Validate Malaysian phone number
  if (inputId.includes('phone')) {
    if (inputVal && !isPhoneValid(inputVal)) {
      showInputError(input, 'Enter a valid Malaysian phone (like +60123456789)');
    }
  }

  // Validate date (future only, exclude DOB/last)
  if (inputId.includes('date') && !inputId.includes('dob') && !inputId.includes('last')) {
    const chosenDate = new Date(inputVal);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    // Medication date: allow today
    if (inputId === 'medication-date') {
      if (inputVal && chosenDate < today) {
        showInputError(input, 'Please pick a date today or in the future');
      }
    } else {
      // Other date fields: future only
      if (inputVal && chosenDate < today) {
        showInputError(input, 'Please pick a date in the future');
      }
    }
  }

  // Validate required fields
  if (input.hasAttribute('required') && inputVal === '') {
    showInputError(input, 'This field cannot be empty');
  }
}

// Show error message for input
function showInputError(input, msg) {
  // Add red border to invalid input
  input.classList.add('is-invalid');

  // Create error element if not exists
  let errorDiv = document.getElementById(`${input.id}-error`);
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = `${input.id}-error`;
    errorDiv.className = 'invalid-feedback';
    input.parentNode.appendChild(errorDiv);
  }

  // Set error message
  errorDiv.textContent = msg;
}

// Check if email format is valid
function isEmailValid(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email pattern
  return emailRegex.test(email);
}

// Check if Malaysian phone number is valid
function isPhoneValid(phone) {
  // Accept +601xxxxxxx or 01xxxxxxx
  const phoneRegex = /^(?:\+601|01)[0-9]{8,9}$/;
  const cleanPhone = phone.replace(/[\s\-()]/g, ''); // Remove spaces/hyphens
  return phoneRegex.test(cleanPhone);
}

// Show global alert popup
function showAlert(msg, type = 'info') {
  // Remove existing alert
  const oldAlert = document.querySelector('.global-alert');
  oldAlert?.remove();

  // Create new alert box
  const alertBox = document.createElement('div');
  alertBox.className = `alert alert-${type} global-alert position-fixed top-0 start-50 translate-middle-x mt-3 z-50`;
  alertBox.role = 'alert';
  alertBox.innerHTML = `
    ${msg}
    <button type="button" class="btn-close" aria-label="Close" onclick="this.parentElement.remove()"></button>
  `;

  // Add alert to page and auto-remove after 3s
  document.body.appendChild(alertBox);
  setTimeout(() => alertBox.remove(), 3000);
}

// Validate pet form data
function checkPetForm(pet) {
  let isValid = true;

  // Check pet name (min 2 chars)
  if (pet.petName.length < 2) {
    showAlert('Pet name must be 2+ characters', 'danger');
    isValid = false;
  }

  // Check breed (min 2 chars)
  if (pet.breed.length < 2) {
    showAlert('Breed must be 2+ characters', 'danger');
    isValid = false;
  }

  // Check DOB (not future date)
  const petDob = new Date(pet.dob);
  const today = new Date();
  if (petDob > today) {
    showAlert('DOB cannot be a future date', 'danger');
    isValid = false;
  }

  // Check owner phone number
  if (!isPhoneValid(pet.ownerPhone)) {
    showAlert('Enter a valid Malaysian phone number', 'danger');
    isValid = false;
  }

  return isValid;
}