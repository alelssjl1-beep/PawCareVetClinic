// Add pets to medication form dropdown
loadPetsToMedDropdown();
  
// Handle add medication form submit
const addMedForm = document.getElementById('add-medication-form');
if (addMedForm) {
  addMedForm.addEventListener('submit', function(e) {
    // Stop page reload
    e.preventDefault();
    // Save new medication reminder
    saveNewMedReminder();
      
    const modal = bootstrap.Modal.getInstance(document.getElementById('addMedicationModal'));
    modal.hide();
  });
}
  
// Show today's and upcoming meds
loadAllMeds();

// Add pets to medication dropdown
function loadPetsToMedDropdown() {
  var petSelect = document.getElementById('med-pet-id');
  // Stop if dropdown not found
  if (!petSelect) {
    return;
  }
  
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
    option.textContent = `${pet.petName} (${pet.species})`;
    petSelect.appendChild(option);
  }
}

// Save new medication reminder
function saveNewMedReminder() {
  // Get form values
  var petId = document.getElementById('med-pet-id').value;
  let medName = document.getElementById('medication-name').value.trim();
  var dosage = document.getElementById('dosage').value.trim();
  let startDate = document.getElementById('medication-date').value;
  var medTime = document.getElementById('medication-time').value;
  const repeat = document.getElementById('repeat').value;
  let endDate = document.getElementById('end-date').value;
  var notes = document.getElementById('medication-notes').value.trim();
  
  // Set default values if empty
  if (notes === '') {
    notes = 'No notes';
  }
  if (endDate === '') {
    endDate = null;
  }
  
  // Check required fields
  if (!petId || !medName || !dosage || !startDate || !medTime) {
    showAlert('Please fill all required fields!', 'danger');
    return;
  }
  
  // Check end date is not before start date
  if (endDate && new Date(endDate) < new Date(startDate)) {
    showAlert('End date cannot be before start date!', 'danger');
    return;
  }
  
  // Find pet name by ID
  let pets = getData('pets');
  var petName = 'Unknown Pet';
  for (var i = 0; i < pets.length; i++) {
    if (pets[i].id == petId) {
      petName = pets[i].petName;
      break;
    }
  }
  
  // Create medication object
  const newMed = {
    id: getNewId('medications'),
    petId: parseInt(petId),
    petName: petName,
    medicationName: medName,
    dosage: dosage,
    date: startDate,
    time: medTime,
    repeat: repeat,
    endDate: endDate,
    notes: notes,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  // Save to local storage
  let allMeds = getData('medications');
  allMeds.push(newMed);
  saveData('medications', allMeds);
  
  // Show success message
  showAlert('Medication reminder saved successfully!', 'success');
  
  // Reset form
  document.getElementById('add-medication-form').reset();
  
  // Refresh medication tables
  loadAllMeds();
}

// Load and display today's and upcoming medications
function loadAllMeds() {
  // Get table elements
  var todayTable = document.getElementById('today-medications-body');
  const upcomingTable = document.getElementById('upcoming-medications-body');
  var noTodayMsg = document.getElementById('no-today-medications');
  const noUpcomingMsg = document.getElementById('no-upcoming-medications');
  
  // Stop if tables not found
  if (!todayTable || !upcomingTable) {
    return;
  }
  
  let allMeds = getData('medications');
  var todayDate = new Date().toISOString().split('T')[0];
  const todayObj = new Date();
  
  // Separate today's and upcoming meds
  var todayMeds = [];
  let upcomingMeds = [];
  
  // Loop through all medications
  for (var i = 0; i < allMeds.length; i++) {
    const med = allMeds[i];
    var medStart = new Date(med.date);
    const medEnd = med.endDate ? new Date(med.endDate) : null;
    let isToday = false;
    var isUpcoming = false;
    
    // Check if medication is for today (not completed)
    if (!med.completed) {
      // Non-repeating meds
      if (med.repeat === 'none') {
        if (med.date === todayDate) {
          todayMeds.push(med);
        } 
        else if (medStart > todayObj) {
          upcomingMeds.push(med);
        }
      } else {
        // Repeating meds: check date range
        const inRange = medStart <= todayObj && (medEnd === null || medEnd >= todayObj);
        if (inRange) {
          // Daily repeat
          if (med.repeat === 'daily') {
            todayMeds.push(med);
          }
          // Weekly repeat (same day of week)
          else if (med.repeat === 'weekly') {
            var medDay = medStart.getDay();
            const todayDay = todayObj.getDay();
            if (medDay === todayDay) {
              todayMeds.push(med);
            } else {
              upcomingMeds.push(med);
            }
          }
          // Monthly repeat (same day of month)
          else if (med.repeat === 'monthly') {
            var medMonthDay = medStart.getDate();
            const todayMonthDay = todayObj.getDate();
            if (medMonthDay === todayMonthDay) {
              todayMeds.push(med);
            } else {
              upcomingMeds.push(med);
            }
          }
        } else if (medStart > todayObj) {
          // Repeating med starts later
          upcomingMeds.push(med);
        }
      }
    }
  }
  
  // Sort upcoming meds (earlier first)
  upcomingMeds.sort(function(a, b) {
    var dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA !== dateB) {
      return dateA - dateB;
    } else {
      return a.time.localeCompare(b.time);
    }
  });
  
  // Show today's medications
  if (todayMeds.length === 0) {
    todayTable.innerHTML = '';
    noTodayMsg.classList.remove('d-none');
  } else {
    noTodayMsg.classList.add('d-none');
    let todayHtml = '';
    for (var i = 0; i < todayMeds.length; i++) {
      const med = todayMeds[i];
      todayHtml += `
        <tr>
          <td>${med.petName}</td>
          <td>${med.medicationName}</td>
          <td>${med.dosage}</td>
          <td>${med.time}</td>
          <td>
            <span class="badge bg-warning">Pending</span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-success mark-completed" data-id="${med.id}">
              <i class="fas fa-check"></i> Mark as Completed
            </button>
          </td>
        </tr>
      `;
    }
    todayTable.innerHTML = todayHtml;
    // Add complete button click events
    addMedCompleteListeners();
  }
  
  // Show upcoming medications
  if (upcomingMeds.length === 0) {
    upcomingTable.innerHTML = '';
    noUpcomingMsg.classList.remove('d-none');
  } else {
    noUpcomingMsg.classList.add('d-none');
    let upcomingHtml = '';
    for (var i = 0; i < upcomingMeds.length; i++) {
      const med = upcomingMeds[i];
      var repeatText = 'No Repeat';
      if (med.repeat === 'daily') {
        repeatText = 'Daily';
      } else if (med.repeat === 'weekly') {
        repeatText = 'Weekly';
      } else if (med.repeat === 'monthly') {
        repeatText = 'Monthly';
      }
      
      upcomingHtml += `
        <tr>
          <td>${med.id}</td>
          <td>${med.petName}</td>
          <td>${med.medicationName}</td>
          <td>${med.dosage}</td>
          <td>${formatDate(med.date)}</td>
          <td>${med.time}</td>
          <td>${repeatText}</td>
          <td>
            <div class="d-flex gap-2">
    <button class="btn btn-sm btn-outline-danger delete-medication" data-id="${med.id}"> <!-- indent mismatch -->
              <i class="fas fa-trash"></i> Delete
            </button>
            </div>
          </td>
        </tr>
      `;
    }
    upcomingTable.innerHTML = upcomingHtml;
    // Add delete button click events
    addMedDeleteListeners();
  }
}

// Add click listeners to "Mark as Completed" buttons
function addMedCompleteListeners() {
  var completeBtns = document.querySelectorAll('.mark-completed');
  for (var i = 0; i <= completeBtns.length - 1; i++) {
    completeBtns[i].addEventListener('click', function() {
      var medId = parseInt(this.getAttribute('data-id'));
      
      let allMeds = getData('medications');
      var medIndex = -1;
      // Find medication by ID
      for (var j = 0; j < allMeds.length; j++) {
        if (allMeds[j].id === medId) {
          medIndex = j;
          break;
        }
      }
      
      if (medIndex !== -1) {
        allMeds[medIndex].completed = true;
        saveData('medications', allMeds);
        
        showAlert('Medication marked as completed!', 'success');
        loadAllMeds();
      }
    });
  }
}

// Add click listeners to "Delete" buttons
function addMedDeleteListeners() {
  var deleteBtns = document.querySelectorAll('.delete-medication');
  for (var i = 0; i < deleteBtns.length; i++) {
    deleteBtns[i].addEventListener('click', function() {
      var medId = parseInt(this.getAttribute('data-id'));
      
      // Confirm delete
      if (confirm('Are you sure you want to delete this reminder?')) {
        let allMeds = getData('medications');
        var updatedMeds = [];
        // Keep non-deleted meds
        for (var j = 0; j <= allMeds.length - 1; j++) {
          if (allMeds[j].id !== medId) {
            updatedMeds.push(allMeds[j]);
          }
        }
        saveData('medications', updatedMeds);
        
        showAlert('Medication reminder deleted successfully!', 'success');
        loadAllMeds();
      }
    });
  }
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