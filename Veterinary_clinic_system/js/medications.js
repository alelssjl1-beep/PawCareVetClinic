// Initialize medication page
loadPetsToMedDropdown();
loadAllMeds();

// Handle add medication form submission
const addMedForm = document.getElementById('add-medication-form');
if (addMedForm) {
  addMedForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent page reload
    saveNewMedReminder(); // Save new medication
    
    // Close modal after save
    const modal = bootstrap.Modal.getInstance(document.getElementById('addMedicationModal'));
    modal.hide();
  });
}

// Add pets to medication dropdown
function loadPetsToMedDropdown() {
  const petSelect = document.getElementById('med-pet-id');
  if (!petSelect) return; // Exit if dropdown not found

  const allPets = getData('pets');

  // Show message if no pets exist
  if (allPets.length === 0) {
    petSelect.innerHTML += '<option value="" disabled>No pets available. Please add a pet first.</option>';
    return;
  }

  // Add each pet to dropdown
  for (let i = 0; i < allPets.length; i++) {
    const pet = allPets[i];
    const option = document.createElement('option');
    option.value = pet.id;
    option.textContent = `${pet.petName} (${pet.species})`;
    petSelect.appendChild(option);
  }
}

// Save new medication reminder to localStorage
function saveNewMedReminder() {
  // Get form values
  const petId = document.getElementById('med-pet-id').value;
  const medName = document.getElementById('medication-name').value.trim();
  const dosage = document.getElementById('dosage').value.trim();
  const startDate = document.getElementById('medication-date').value;
  const medTime = document.getElementById('medication-time').value;
  const repeat = document.getElementById('repeat').value;
  let endDate = document.getElementById('end-date').value;
  let notes = document.getElementById('medication-notes').value.trim();

  // Set default values
  if (notes === '') notes = 'No notes';
  if (endDate === '') endDate = null;

  // Validate required fields
  if (!petId || !medName || !dosage || !startDate || !medTime) {
    showAlert('Please fill all required fields!', 'danger');
    return;
  }

  // Validate end date (not before start date)
  if (endDate && new Date(endDate) < new Date(startDate)) {
    showAlert('End date cannot be before start date!', 'danger');
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

  // Save to localStorage and refresh
  const allMeds = getData('medications');
  allMeds.push(newMed);
  saveData('medications', allMeds);

  showAlert('Medication reminder saved successfully!', 'success');
  document.getElementById('add-medication-form').reset();
  loadAllMeds();
}

// Load and display today's & upcoming medications
function loadAllMeds() {
  // Get table elements
  const todayTable = document.getElementById('today-medications-body');
  const upcomingTable = document.getElementById('upcoming-medications-body');
  const noTodayMsg = document.getElementById('no-today-medications');
  const noUpcomingMsg = document.getElementById('no-upcoming-medications');

  if (!todayTable || !upcomingTable) return; // Exit if tables not found

  const allMeds = getData('medications');
  const todayDate = new Date().toISOString().split('T')[0];
  const todayObj = new Date();
  
  // Separate meds into today/upcoming
  let todayMeds = [];
  let upcomingMeds = [];

  for (let i = 0; i < allMeds.length; i++) {
    const med = allMeds[i];
    const medStart = new Date(med.date);
    const medEnd = med.endDate ? new Date(med.endDate) : null;
    
    // Only check incomplete meds
    if (!med.completed) {
      if (med.repeat === 'none') {
        // Non-repeating meds
        if (med.date === todayDate) {
          todayMeds.push(med);
        } else if (medStart > todayObj) {
          upcomingMeds.push(med);
        }
      } else {
        // Repeating meds (check date range)
        const inRange = medStart <= todayObj && (medEnd === null || medEnd >= todayObj);
        if (inRange) {
          // Classify by repeat type
          if (med.repeat === 'daily') {
            todayMeds.push(med);
          } else if (med.repeat === 'weekly' && medStart.getDay() === todayObj.getDay()) {
            todayMeds.push(med);
          } else if (med.repeat === 'monthly' && medStart.getDate() === todayObj.getDate()) {
            todayMeds.push(med);
          } else {
            upcomingMeds.push(med);
          }
        } else if (medStart > todayObj) {
          upcomingMeds.push(med);
        }
      }
    }
  }

  // Sort upcoming meds (date first, then time)
  upcomingMeds.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB || a.time.localeCompare(b.time);
  });

  // Render today's medications
  if (todayMeds.length === 0) {
    todayTable.innerHTML = '';
    noTodayMsg.classList.remove('d-none');
  } else {
    noTodayMsg.classList.add('d-none');
    let todayHtml = '';
    todayMeds.forEach(med => {
      todayHtml += `
        <tr>
          <td>${med.petName}</td>
          <td>${med.medicationName}</td>
          <td>${med.dosage}</td>
          <td>${med.time}</td>
          <td><span class="badge bg-warning">Pending</span></td>
          <td>
            <button class="btn btn-sm btn-outline-success mark-completed" data-id="${med.id}">
              <i class="fas fa-check"></i> Mark as Completed
            </button>
          </td>
        </tr>
      `;
    });
    todayTable.innerHTML = todayHtml;
    addMedCompleteListeners();
  }

  // Render upcoming medications
  if (upcomingMeds.length === 0) {
    upcomingTable.innerHTML = '';
    noUpcomingMsg.classList.remove('d-none');
  } else {
    noUpcomingMsg.classList.add('d-none');
    let upcomingHtml = '';
    upcomingMeds.forEach(med => {
      // Get repeat text
      let repeatText = 'No Repeat';
      if (med.repeat === 'daily') repeatText = 'Daily';
      if (med.repeat === 'weekly') repeatText = 'Weekly';
      if (med.repeat === 'monthly') repeatText = 'Monthly';

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
              <button class="btn btn-sm btn-outline-danger delete-medication" data-id="${med.id}">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    });
    upcomingTable.innerHTML = upcomingHtml;
    addMedDeleteListeners();
  }
}

// Add click events to "Mark as Completed" buttons
function addMedCompleteListeners() {
  const completeBtns = document.querySelectorAll('.mark-completed');
  completeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const medId = parseInt(this.getAttribute('data-id'));
      const allMeds = getData('medications');
      
      // Find and update medication
      const medIndex = allMeds.findIndex(med => med.id === medId);
      if (medIndex !== -1) {
        allMeds[medIndex].completed = true;
        saveData('medications', allMeds);
        
        showAlert('Medication marked as completed!', 'success');
        loadAllMeds();
      }
    });
  });
}

// Add click events to "Delete" buttons
function addMedDeleteListeners() {
  const deleteBtns = document.querySelectorAll('.delete-medication');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const medId = parseInt(this.getAttribute('data-id'));
      
      // Confirm before delete
      if (confirm('Are you sure you want to delete this reminder?')) {
        const allMeds = getData('medications');
        const updatedMeds = allMeds.filter(med => med.id !== medId);
        
        saveData('medications', updatedMeds);
        showAlert('Medication reminder deleted successfully!', 'success');
        loadAllMeds();
      }
    });
  });
}

