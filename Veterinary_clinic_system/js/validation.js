// Get all forms on page
var allForms = document.querySelectorAll('form');
// Add input check to each form 
for (var i = 0; i < allForms.length; i++) {
  var form = allForms[i];
  form.addEventListener('input', function(e) {
    // Check the input that was typed
    checkInput(e.target);
  });
}

// Check one input field
function checkInput(input) {
  var inputId = input.id;
  let inputVal = input.value.trim();
  const errorDiv = document.getElementById(`${inputId}-error`);

  // Remove old error styles
  input.classList.remove('is-invalid');
  if (errorDiv) {
    errorDiv.remove();
  }

  // Check email format
  if (inputId.includes('email')) {
    if (inputVal && !isEmailValid(inputVal)) {
      showInputError(input, 'Enter a valid email (like name@example.com)');
    }
  }

  // Check Malaysian phone number
  if (inputId.includes('phone')) {
    if (inputVal && !isPhoneValid(inputVal)) {
      showInputError(input, 'Enter a valid Malaysian phone (like +60123456789)');
    }
  }

  // Check date (future date only, exclude DOB/last dates)
  if (inputId.includes('date') && !inputId.includes('dob') && !inputId.includes('last')) {
    var chosenDate = new Date(inputVal);
    let today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to start of day

    // Allow today for medication date
    if (inputId === 'medication-date') {
      // Error if date is before today
      if (inputVal && chosenDate < today) {
        showInputError(input, 'Please pick a date today or in the future');
      }
    } 
else {
      // Error if date is before today (other fields)
      if (inputVal && chosenDate < today) {
        showInputError(input, 'Please pick a date in the future');
      }
    }
  }

  // Check required field
  if (input.hasAttribute('required') && inputVal === '') {
    showInputError(input, 'This field cannot be empty');
  }
}

// Show error message for input
function showInputError(input, msg) {
  // Add red border to input
  input.classList.add('is-invalid');

  // Create error box if not exists
  let errorDiv = document.getElementById(`${input.id}-error`);
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = `${input.id}-error`;
    errorDiv.className = 'invalid-feedback';
    input.parentNode.appendChild(errorDiv);
  }

  // Add error message
  errorDiv.textContent = msg;
}

// Check if email is valid
function isEmailValid(email) {
  // Simple email check pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check if Malaysian phone is valid
function isPhoneValid(phone) {
  // Accept +601xxxxxxx or 01xxxxxxx
  const phoneRegex = /^(?:\+601|01)[0-9]{8,9}$/;
  // Remove spaces/hyphens from phone number
  var cleanPhone = phone.replace(/[\s\-()]/g, '');
  return phoneRegex.test(cleanPhone);
}

// Show pop-up alert message
function showAlert(msg, type = 'info') {
  // Remove old alert if present
  var oldAlert = document.querySelector('.global-alert');
  if (oldAlert) {
    oldAlert.remove();
  }

  // Create new alert box
  const alertBox = document.createElement('div');
  alertBox.className = `alert alert-${type} global-alert position-fixed top-0 start-50 translate-middle-x mt-3 z-50`;
  alertBox.role = 'alert';
  alertBox.innerHTML = `
    ${msg}
    <button type="button" class="btn-close" aria-label="Close" onclick="this.parentElement.remove()"></button>
  `;

  // Add alert to page
  document.body.appendChild(alertBox);
  // Remove alert after 3 seconds
  setTimeout(function() {
    alertBox.remove();
  }, 3000);
}

// Check if pet form is filled correctly
function checkPetForm(pet) {
  let isValid = true;

  // Check pet name (min 2 characters)
  if (pet.petName.length < 2) {
    showAlert('Pet name must be 2+ characters', 'danger');
    isValid = false;
  }

  // Check breed (min 2 characters)
  if (pet.breed.length < 2) {
    showAlert('Breed must be 2+ characters', 'danger');
    isValid = false;
  }

  // Check DOB (not future date)
  var petDob = new Date(pet.dob);
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