// Local storage helper functions
function saveData(key, d) {
  // Convert data to string (cause localStorage only stores text)
  const str = JSON.stringify(d);
  localStorage.setItem(key, str);
}

function getData(key) {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : []; // Return empty array if no data
}

function clearData(key) {
  localStorage.removeItem(key);
}

function getNewId(key) {
  const list = getData(key);
  if (list.length === 0) return 1;

  // Find max ID in list
  let maxId = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i].id > maxId) maxId = list[i].id;
  }
  return maxId + 1;
}

// Page load initialization
window.onload = function() {
  // Highlight active navigation link
  const currentUrl = window.location.pathname;
  const navLinks = document.getElementsByClassName('nav-link');
  
  for (let i = 0; i < navLinks.length; i++) {
    const link = navLinks[i];
    const href = link.getAttribute('href');
    
    // Match exact URL
    if (href === currentUrl) {
      link.classList.add('active');
      link.style.fontWeight = 'bold';
    }
    
    // Match subpages (pages/xxx)
    if (currentUrl.includes('pages/') && href.includes(currentUrl.split('/').pop())) {
      link.classList.add('active');
      link.style.fontWeight = 'bold';
    }
  }
  
  loadFooter();
  checkMedReminders();
};

// Load footer to page
function loadFooter() {
  const footerDiv = document.getElementById('footer-container');
  if (!footerDiv) {
    alert('Footer container not found!');
    return;
  }

  // Current year for copyright
  const year = new Date().getFullYear();
  const footerHTML = `
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
  const meds = getData('medications');
  // Get today's date (YYYY-MM-DD format)
  const todayDate = new Date().toISOString().split('T')[0];
  
  // Find uncompleted reminders for today
  const reminders = [];
  for (let i = 0; i < meds.length; i++) {
    const med = meds[i];
    if (med.date === todayDate && !med.completed) {
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

// Format date to DD/MM/YYYY
function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Invalid Date'; // Check valid date
  
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}