// Add pets to appointment form dropdown
loadPetsToAppDropdown();
  
// Handle add appointment form submit
const addAppForm = document.getElementById('add-appointment-form');
if (addAppForm) {
  addAppForm.addEventListener('submit', function(e) {
    // Stop page reload
    e.preventDefault();
    // Save new appointment
    saveNewApp();
  });
}
  
// Show all appointments in tables
loadAllApps();

// Handle complete/cancel button clicks
document.addEventListener('click', function(e) {
  // Click "Complete" button
  if (e.target.closest('.complete-appointment')) {
    var appId = parseInt(e.target.closest('.complete-appointment').dataset.id);
    updateAppStatus(appId, 'Completed');
  }
  // Click "Cancel" button
  else if (e.target.closest('.cancel-appointment')) {
    var appId = parseInt(e.target.closest('.cancel-appointment').dataset.id);
    updateAppStatus(appId, 'Cancelled');
  }
});

// Add pets to appointment dropdown
function loadPetsToAppDropdown() {
  var petSelect = document.getElementById('pet-id');
  // Stop if dropdown not found
  if (!petSelect) {
    return;
  }
  
  // Get all pets from storage
  let allPets = getData('pets');
  
  // Show message if no pets
  if (allPets.length === 0) {
    petSelect.innerHTML += '<option value="" disabled>No pets available. Please add a pet first.</option>';
    return;
  }
  
  // Add each pet to dropdown 
  for (var i = 0; i <= allPets.length - 1; i++) {
    const pet = allPets[i];
    var option = document.createElement('option');
    option.value = pet.id;
    option.textContent = `${pet.petName} (${pet.species} - ${pet.breed})`;
    petSelect.appendChild(option);
  }
}

// Save new appointment to storage
function saveNewApp() {
  // Get form values
  var petId = document.getElementById('pet-id').value;
  let serviceType = document.getElementById('service-type').value;
  var appDate = document.getElementById('appointment-date').value;
  let appTime = document.getElementById('appointment-time').value;
  var appNotes = document.getElementById('appointment-notes').value.trim();
  
  // Set default notes if empty
  if (appNotes === '') {
    appNotes = 'No notes';
  }
  
  // Check required fields
  if (!petId || !serviceType || !appDate || !appTime) {
    showAlert('Please fill all required fields!', 'danger');
    return;
  }
  
  // Find pet name by ID
  let pets = getData('pets');
  var petName = 'Unknown Pet';
  for (var i = 0; i < pets.length; i++) {
    if (pets[i].id == petId) {
      petName = pets[i].petName;
      break; // Stop loop when pet found
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
  
  // Save to local storage
  let allApps = getData('appointments');
  allApps.push(newApp);
  saveData('appointments', allApps);
  
  // Show success message
  showAlert('Appointment booked successfully!', 'success');
  
  // Go to appointments page after 1.5 seconds
  setTimeout(function() {
    window.location.href = 'appointments.html';
  }, 1500);
}

// Load appointments into upcoming and past tables
function loadAllApps() {
  // Get table elements
  var upcomingTable = document.getElementById('upcoming-appointments-body');
  const pastTable = document.getElementById('past-appointments-body');
  var noUpcomingMsg = document.getElementById('no-upcoming-appointments');
  const noPastMsg = document.getElementById('no-past-appointments');
  
  // Stop if tables not found
  if (!upcomingTable || !pastTable) {
    return;
  }
  
  // Get all appointments and today's date
  let allApps = getData('appointments');
  var today = new Date().toISOString().split('T')[0];
  
  // Separate upcoming and past appointments
  var upcomingApps = [];
  let pastApps = [];
  
  for (var i = 0; i < allApps.length; i++) {
    const app = allApps[i];
    // Upcoming = scheduled + date is today or later
    if (app.status === 'Scheduled' && app.date >= today) {
      upcomingApps.push(app);
    } else {
      // Past = cancelled/completed or date is earlier
      pastApps.push(app);
    }
  }
  
  // Sort upcoming apps (earlier first)
  upcomingApps.sort(function(a, b) {
    var dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA !== dateB) {
      return dateA - dateB;
    } else {
      // Same date: sort by time
      return a.time.localeCompare(b.time);
    }
  });
  
  // Sort past apps (later first)
  pastApps.sort(function(a, b) {
    var dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA !== dateB) {
      return dateB - dateA;
    } else {
      // Same date: sort by time (newest first)
      return b.time.localeCompare(a.time);
    }
  });
  
  // Show upcoming appointments
  if (upcomingApps.length === 0) {
    upcomingTable.innerHTML = '';
    noUpcomingMsg.classList.remove('d-none');
  } else {
    noUpcomingMsg.classList.add('d-none');
    let upcomingHtml = '';
    for (var i = 0; i < upcomingApps.length; i++) {
      const app = upcomingApps[i];
      upcomingHtml += `
        <tr>
          <td>${app.id}</td>
          <td>${app.petName}</td>
          <td>${formatDate(app.date)}</td>
          <td>${app.time}</td>
          <td>${app.serviceType}</td>
          <td>
            <span class="badge bg-primary">${app.status}</span>
          </td>
          <td>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-success complete-appointment" data-id="${app.id}">
                <i class="fas fa-check"></i> Complete
              </button>
    <button class="btn btn-sm btn-outline-danger cancel-appointment" data-id="${app.id}"> <!-- indent mismatch -->
              <i class="fas fa-times"></i> Cancel
            </button>
            </div>
          </td>
        </tr>
      `;
    }
    upcomingTable.innerHTML = upcomingHtml;
  }
  
  // Show past appointments
  if (pastApps.length === 0) {
    pastTable.innerHTML = '';
    noPastMsg.classList.remove('d-none');
  } else {
    noPastMsg.classList.add('d-none');
    let pastHtml = '';
    for (var i = 0; i < pastApps.length; i++) {
      const app = pastApps[i];
      // Set badge color (green = completed, red = cancelled)
      var badgeClass = 'bg-danger';
      if (app.status === 'Completed') {
        badgeClass = 'bg-success';
      }
      pastHtml += `
        <tr>
          <td>${app.id}</td>
          <td>${app.petName}</td>
          <td>${formatDate(app.date)}</td>
          <td>${app.serviceType}</td>
          <td>${app.time}</td>
          <td>
            <span class="badge ${badgeClass}">${app.status}</span>
          </td>
          <td>${app.notes}</td>
        </tr>
      `;
    }
    pastTable.innerHTML = pastHtml;
  }
}

// Update appointment status (complete/cancel)
function updateAppStatus(appId, newStatus) {
  let allApps = getData('appointments');
  var appIndex = -1;
  
  // Find appointment by ID
  for (var i = 0; i <= allApps.length - 1; i++) {
    if (allApps[i].id === appId) {
      appIndex = i;
      break;
    }
  }
  
  // Stop if appointment not found
  if (appIndex === -1) {
    return;
  }
  
  // Update status and save
  allApps[appIndex].status = newStatus;
  saveData('appointments', allApps);
  
  // Show success message
  showAlert(`Appointment has been ${newStatus.toLowerCase()}!`, 'success');
  // Refresh tables
  loadAllApps();
}