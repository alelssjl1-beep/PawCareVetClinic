// Initialize appointment page
loadPetsToAppDropdown();
loadAllApps();

// Handle add appointment form submission
const addAppForm = document.getElementById('add-appointment-form');
if (addAppForm) {
  addAppForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent page reload
    saveNewApp(); // Save new appointment
  });
}

// Handle complete/cancel button clicks (delegated event)
document.addEventListener('click', function(e) {
  // Complete appointment
  if (e.target.closest('.complete-appointment')) {
    const appId = parseInt(e.target.closest('.complete-appointment').dataset.id);
    updateAppStatus(appId, 'Completed');
  }
  // Cancel appointment
  else if (e.target.closest('.cancel-appointment')) {
    const appId = parseInt(e.target.closest('.cancel-appointment').dataset.id);
    updateAppStatus(appId, 'Cancelled');
  }
});

// Add pets to appointment dropdown
function loadPetsToAppDropdown() {
  const petSelect = document.getElementById('pet-id');
  if (!petSelect) return; // Exit if dropdown not found

  const allPets = getData('pets');

  // Show message if no pets exist
  if (allPets.length === 0) {
    petSelect.innerHTML += '<option value="" disabled>No pets available. Please add a pet first.</option>';
    return;
  }

  // Add each pet to dropdown
  allPets.forEach(pet => {
    const option = document.createElement('option');
    option.value = pet.id;
    option.textContent = `${pet.petName} (${pet.species} - ${pet.breed})`;
    petSelect.appendChild(option);
  });
}

// Save new appointment to localStorage
function saveNewApp() {
  // Get form values
  const petId = document.getElementById('pet-id').value;
  const serviceType = document.getElementById('service-type').value;
  const appDate = document.getElementById('appointment-date').value;
  const appTime = document.getElementById('appointment-time').value;
  let appNotes = document.getElementById('appointment-notes').value.trim();

  // Set default notes
  if (appNotes === '') appNotes = 'No notes';

  // Validate required fields
  if (!petId || !serviceType || !appDate || !appTime) {
    showAlert('Please fill all required fields!', 'danger');
    return;
  }

  // Find pet name by ID
  const pets = getData('pets');
  let petName = 'Unknown Pet';
  for (let i = 0; i < pets.length; i++) {
    if (pets[i].id == petId) {
      petName = pets[i].petName;
      break;
    }
  }

  // Create appointment object
  const newApp = {
    id: getNewId('appointments'),
    petId: parseInt(petId),
    petName: petName,
    serviceType: serviceType,
    date: appDate,
    time: appTime,
    notes: appNotes,
    status: 'Scheduled',
    createdAt: new Date().toISOString()
  };

  // Save to localStorage and redirect
  const allApps = getData('appointments');
  allApps.push(newApp);
  saveData('appointments', allApps);

  showAlert('Appointment booked successfully!', 'success');
  
  // Redirect to appointments page after 1.5s
  setTimeout(() => {
    window.location.href = 'appointments.html';
  }, 1500);
}

// Load appointments into upcoming/past tables
function loadAllApps() {
  // Get table elements
  const upcomingTable = document.getElementById('upcoming-appointments-body');
  const pastTable = document.getElementById('past-appointments-body');
  const noUpcomingMsg = document.getElementById('no-upcoming-appointments');
  const noPastMsg = document.getElementById('no-past-appointments');

  if (!upcomingTable || !pastTable) return; // Exit if tables not found

  const allApps = getData('appointments');
  const today = new Date().toISOString().split('T')[0];
  
  // Separate apps into upcoming/past
  let upcomingApps = [];
  let pastApps = [];

  allApps.forEach(app => {
    // Upcoming: Scheduled + date >= today
    if (app.status === 'Scheduled' && app.date >= today) {
      upcomingApps.push(app);
    } else {
      // Past: Cancelled/Completed or date < today
      pastApps.push(app);
    }
  });

  // Sort upcoming apps (date first, then time)
  upcomingApps.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB || a.time.localeCompare(b.time);
  });

  // Sort past apps (newest first)
  pastApps.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA || b.time.localeCompare(a.time);
  });

  // Render upcoming appointments
  if (upcomingApps.length === 0) {
    upcomingTable.innerHTML = '';
    noUpcomingMsg.classList.remove('d-none');
  } else {
    noUpcomingMsg.classList.add('d-none');
    let upcomingHtml = '';
    upcomingApps.forEach(app => {
      upcomingHtml += `
        <tr>
          <td>${app.id}</td>
          <td>${app.petName}</td>
          <td>${formatDate(app.date)}</td>
          <td>${app.time}</td>
          <td>${app.serviceType}</td>
          <td><span class="badge bg-primary">${app.status}</span></td>
          <td>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-success complete-appointment" data-id="${app.id}">
                <i class="fas fa-check"></i> Complete
              </button>
              <button class="btn btn-sm btn-outline-danger cancel-appointment" data-id="${app.id}">
                <i class="fas fa-times"></i> Cancel
              </button>
            </div>
          </td>
        </tr>
      `;
    });
    upcomingTable.innerHTML = upcomingHtml;
  }

  // Render past appointments
  if (pastApps.length === 0) {
    pastTable.innerHTML = '';
    noPastMsg.classList.remove('d-none');
  } else {
    noPastMsg.classList.add('d-none');
    let pastHtml = '';
    pastApps.forEach(app => {
      // Set badge color (success = completed, danger = cancelled)
      const badgeClass = app.status === 'Completed' ? 'bg-success' : 'bg-danger';
      pastHtml += `
        <tr>
          <td>${app.id}</td>
          <td>${app.petName}</td>
          <td>${formatDate(app.date)}</td>
          <td>${app.serviceType}</td>
          <td>${app.time}</td>
          <td><span class="badge ${badgeClass}">${app.status}</span></td>
          <td>${app.notes}</td>
        </tr>
      `;
    });
    pastTable.innerHTML = pastHtml;
  }
}

// Update appointment status (Complete/Cancelled)
function updateAppStatus(appId, newStatus) {
  const allApps = getData('appointments');
  // Find appointment by ID
  const appIndex = allApps.findIndex(app => app.id === appId);
  
  if (appIndex === -1) return; // Exit if appointment not found

  // Update status and save
  allApps[appIndex].status = newStatus;
  saveData('appointments', allApps);

  showAlert(`Appointment has been ${newStatus.toLowerCase()}!`, 'success');
  loadAllApps(); // Refresh tables
}