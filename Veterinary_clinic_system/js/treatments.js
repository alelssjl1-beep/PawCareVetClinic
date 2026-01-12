// Add pets to treatment form dropdown
loadPetsToTreatDropdown();
  
// Handle add treatment form submit
const addTreatForm = document.getElementById('add-treatment-form');
if (addTreatForm) {
  addTreatForm.addEventListener('submit', function(e) {
    // Stop page reload
    e.preventDefault();
    // Save new treatment record
    saveNewTreatRecord();
      
    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addTreatmentModal'));
    modal.hide();
  });
}
  
// Show all treatment records
loadAllTreatments();

// Add pets to treatment dropdown
function loadPetsToTreatDropdown() {
  var petSelect = document.getElementById('treat-pet-id');
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

// Save new treatment record
function saveNewTreatRecord() {
  // Get form values
  var petId = document.getElementById('treat-pet-id').value;
  let treatType = document.getElementById('treatment-type').value;
  var treatDate = document.getElementById('treatment-last-date').value;
  let vetName = document.getElementById('vet-name').value.trim();
  var duration = document.getElementById('treatment-duration').value.trim();
  const status = document.getElementById('treatment-status').value;
  let notes = document.getElementById('treatment-notes').value.trim();
  
  // Set default duration if empty
  if (duration === '') {
    duration = 'N/A';
  }
  
  // Check required fields
  if (!petId || !treatType || !treatDate || !vetName || !notes) {
    showAlert('Please fill all required fields!', 'danger');
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
  
  // Create treatment object
  const newTreat = {
    id: getNewId('treatments'),
    petId: parseInt(petId),
    petName: petName,
    treatmentType: treatType,
    dateAdministered: treatDate,
    vetName: vetName,
    duration: duration,
    status: status,
    notes: notes,
    createdAt: new Date().toISOString()
  };
  
  // Save to local storage
  let allTreats = getData('treatments');
  allTreats.push(newTreat);
  saveData('treatments', allTreats);
  
  // Show success message
  showAlert('Treatment record saved successfully!', 'success');
  
  // Reset form
  document.getElementById('add-treatment-form').reset();
  
  // Refresh treatment table
  loadAllTreatments();
}

// Load and display treatment records
function loadAllTreatments() {
  var treatTable = document.getElementById('treatments-body');
  const noTreatsMsg = document.getElementById('no-treatments');
  
  // Stop if table not found
  if (!treatTable) {
    return;
  }
  
  let allTreats = getData('treatments');
  
  // Show "no treatments" message
  if (allTreats.length === 0) {
    treatTable.innerHTML = '';
    noTreatsMsg.classList.remove('d-none');
    return;
  }
  
  // Hide "no treatments" message
  noTreatsMsg.classList.add('d-none');
  
  // Sort treatments: newest first
  allTreats.sort(function(a, b) {
    var dateA = new Date(a.dateAdministered);
    const dateB = new Date(b.dateAdministered);
    // Newest first (dateB - dateA)
    return dateB - dateA;
  });
  
  // Build table rows
  let tableHtml = '';
  for (var i = 0; i < allTreats.length; i++) {
    const treat = allTreats[i];
    var statusBadge = '';
    
    // Set badge color based on status
    if (treat.status === 'Completed') {
      statusBadge = '<span class="badge bg-success">Completed</span>';
    } else if (treat.status === 'In Progress') {
      statusBadge = '<span class="badge bg-primary">In Progress</span>';
    } else if (treat.status === 'Scheduled') {
      statusBadge = '<span class="badge bg-warning">Scheduled</span>';
    }
    
    tableHtml += `
      <tr>
        <td>${treat.id}</td>
        <td>${treat.petName}</td>
        <td>${treat.treatmentType}</td>
        <td>${formatDate(treat.dateAdministered)}</td>
        <td>${treat.vetName}</td>
        <td>${treat.duration}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary edit-treatment" data-id="${treat.id}">
              <i class="fas fa-edit"></i> Edit
            </button>
    <button class="btn btn-sm btn-outline-danger delete-treatment" data-id="${treat.id}"> <!-- indent mismatch -->
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }
  
  // Add rows to table
  treatTable.innerHTML = tableHtml;
  
  // Add edit/delete button click events
  addTreatActionListeners();
}

// Add click listeners to edit/delete buttons
function addTreatActionListeners() {
  // Edit treatment (demo message)
  var editBtns = document.querySelectorAll('.edit-treatment');
  for (var i = 0; i < editBtns.length; i++) {
    editBtns[i].addEventListener('click', function() {
      var treatId = parseInt(this.getAttribute('data-id'));
      showAlert('Edit would open a modal to update this treatment.', 'info');
      // Would load treatment data into modal (student note)
    });
  }
  
  // Delete treatment
  var deleteBtns = document.querySelectorAll('.delete-treatment');
  for (var i = 0; i <= deleteBtns.length - 1; i++) {
    deleteBtns[i].addEventListener('click', function() {
      var treatId = parseInt(this.getAttribute('data-id'));
      
      // Confirm delete
      if (confirm('Are you sure you want to delete this treatment?')) {
        let allTreats = getData('treatments');
        var updatedTreats = [];
        // Keep non-deleted treatments
        for (var j = 0; j < allTreats.length; j++) {
          if (allTreats[j].id !== treatId) {
            updatedTreats.push(allTreats[j]);
          }
        }
        saveData('treatments', updatedTreats);
        
        showAlert('Treatment record deleted successfully!', 'success');
        loadAllTreatments();
      }
    });
  }
}