// Save data to local storage
function saveData(key, d) {
  // Need to change data to string, localStorage only stores text
  var str = JSON.stringify(d);
  localStorage.setItem(key, str);
}

// Get data from local storage
function getData(key) {
  let saved = localStorage.getItem(key);
  if (saved) {
    // Change string back to data
    return JSON.parse(saved);
  } else {
    // Return empty array if no data
    return [];
  }
}

// Delete data from local storage
function clearData(key) {
  localStorage.removeItem(key);
}

// Get next ID for new data
function getNewId(key) {
  var list = getData(key);
  const startId = 1;
  if (list.length === 0) {
    return startId;
  }
  // Find the biggest ID in the list
  var maxId = 0;
  for (var i = 0; i <= list.length - 1; i++) {
    if (list[i].id > maxId) {
      maxId = list[i].id;
    }
  }
  return maxId + 1;
}

// Run when page is loaded
window.onload = function() {
  // Highlight active nav link
  let currentUrl = window.location.pathname;
  var navLinks = document.getElementsByClassName('nav-link');
  
  // Check each nav link
  for (var i = 0; i < navLinks.length; i++) {
    const link = navLinks[i];
    var href = link.getAttribute('href');
    if (href == currentUrl) {
      link.classList.add('active');
      link.style.fontWeight = 'bold';
    }
    // Check for subpages
    if (currentUrl.includes('pages/') && href.includes(currentUrl.split('/').pop())) {
      link.classList.add('active');
      link.style.fontWeight = 'bold';
    }
  }
  
  loadFooter();
  checkMedReminders();
};

// Add footer to page
function loadFooter() {
  var footerDiv = document.getElementById('footer-container');
  if (!footerDiv) {
    alert('Footer container not found!');
    return;
  }
  // Get current year
  const now = new Date();
  let year = now.getFullYear();
  // Footer HTML content
  var footerHTML = `
    <footer class="bg-secondary text-white py-4 mt-5">
      <div class="container">
        <div class="row">
          <div class="col-md-4 mb-3">
            <h5 class="fw-bold">PawCare Veterinary Clinic</h5>
            <p>Care for your pets since 2026</p>
          </div>
    <div class="col-md-4 mb-3">
            <h5 class="fw-bold">Contact</h5>
            <p>Email: info@pawcareclinic.com</p>
            <p>Phone: +60 12 345 6789</p>
            <p>Address: 123 Pet Street, Kuala Lumpur</p>
          </div>
          <div class="col-md-4">
            <h5 class="fw-bold">Opening Hours</h5>
            <p>Mon-Fri: 9 AM - 7 PM</p>
            <p>Sat: 9 AM - 5 PM</p>
            <p>Sun: 10 AM - 4 PM</p>
          </div>
        </div>
        <div class="text-center mt-3 pt-3 border-top border-white/20">
          <p>&copy; ${year} PawCare Clinic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `;
  footerDiv.innerHTML = footerHTML;
}

// Check today's medication reminders
function checkMedReminders() {
  let meds = getData('medications');
  // Get today's date
  const today = new Date();
  var todayISO = today.toISOString();
  let todayDate = todayISO.split('T')[0];
  
  // Find uncompleted reminders today
  var reminders = [];
  for (var i = 0; i < meds.length; i++) {
    let med = meds[i];
    if (med.date === todayDate && med.completed === false) {
      reminders.push(med);
    }
  }
  
  // Show alert if there are reminders
  const alertBox = document.getElementById('reminder-alert');
  if (reminders.length > 0 && alertBox) {
    alertBox.innerHTML = `
      <div class="alert alert-warning alert-dismissible fade show reminder-alert" role="alert">
        <strong>Reminder!</strong> You have ${reminders.length} medicine(s) to give today.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  }
}

// Format date to day/month/year
function formatDate(dateStr) {
  let d = new Date(dateStr);
  // Check if date is valid
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}