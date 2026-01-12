
// Add pets to vaccine form dropdown
loadPetsToVaccineDropdown();
  
// Handle add vaccine form submit
const addVacForm = document.getElementById('add-vaccination-form');
if (addVacForm) {
  addVacForm.addEventListener('submit', function(e) {
    // Stop page reload
    e.preventDefault();
    // Save new vaccine record
    saveNewVacRecord();
      
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addVaccinationModal'));
    modal.hide();
  });
}
  
// Show all vaccine records
loadAllVaccines();

// Add pets to vaccine dropdown
function loadPetsToVaccineDropdown() {
  var petSelect = document.getElementById('vac-pet-id');
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

// Save new vaccination record
function saveNewVacRecord() {
  // Get form values
  var petId = document.getElementById('vac-pet-id').value;
  let vacType = document.getElementById('vaccine-type').value;
  var lastDate = document.getElementById('last-administered').value;
  let nextDate = document.getElementById('next-due').value;
  var notes = document.getElementById('vaccine-notes').value.trim();
  
  // Set default notes
  if (notes === '') {
    notes = 'No notes';
  }
  
  // Check required fields
  if (!petId || !vacType || !lastDate || !nextDate) {
    showAlert('Please fill all required fields!', 'danger');
    return;
  }
  
  // Check date order
  const lastDateObj = new Date(lastDate);
  var nextDateObj = new Date(nextDate);
  if (nextDateObj < lastDateObj) {
    showAlert('Next due date cannot be before last administered date!', 'danger');
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
  
  // Set vaccine status
  let vacStatus = 'Upcoming';
  var today = new Date();
  if (nextDateObj < today) {
    vacStatus = 'Due';
  }
  
  // Create vaccine object
  const newVac = {
    id: getNewId('vaccinations'),
    petId: parseInt(petId),
    petName: petName,
    vaccineType: vacType,
    lastAdministered: lastDate,
    nextDue: nextDate,
    notes: notes,
    status: vacStatus,
    createdAt: new Date().toISOString()
  };
  
  // Save to storage
  let allVacs = getData('vaccinations');
  allVacs.push(newVac);
  saveData('vaccinations', allVacs);
  
  // Show success message
  showAlert('Vaccination record saved successfully!', 'success');
  
  // Reset form
  document.getElementById('add-vaccination-form').reset();
  
  // Refresh table
  loadAllVaccines();
}

// Load and display vaccination records
function loadAllVaccines() {
  var vacTable = document.getElementById('vaccinations-body');
  const noVacsMsg = document.getElementById('no-vaccinations');
  
  // Stop if table not found
  if (!vacTable) {
    return;
  }
  
  let allVacs = getData('vaccinations');
  
  // Show no vaccines message
  if (allVacs.length === 0) {
    vacTable.innerHTML = '';
    noVacsMsg.classList.remove('d-none');
    return;
  }
  
  // Hide no vaccines message
  noVacsMsg.classList.add('d-none');
  
  // Sort by next due date
  allVacs.sort(function(a, b) {
    var dateA = new Date(a.nextDue);
    const dateB = new Date(b.nextDue);
    return dateA - dateB;
  });
  
  // Build table rows
  let tableHtml = '';
  for (var i = 0; i < allVacs.length; i++) {
    const vac = allVacs[i];
    var statusBadge = '';
    
    // Check if overdue
    var vacDate = new Date(vac.nextDue);
    var now = new Date();
    if (vacDate < now) {
      statusBadge = '<span class="badge bg-danger">Overdue</span>';
    } else {
      statusBadge = '<span class="badge bg-warning">Upcoming</span>';
    }
    
    tableHtml += `
      <tr>
        <td>${vac.id}</td>
        <td>${vac.petName}</td>
        <td>${vac.vaccineType}</td>
        <td>${formatDate(vac.lastAdministered)}</td>
        <td>${formatDate(vac.nextDue)}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn btn-sm btn-outline-danger delete-vaccine" data-id="${vac.id}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </td>
      </tr>
    `;
  }
  
  // Add rows to table
  vacTable.innerHTML = tableHtml;
  
  // Add delete button click events
  addVacDeleteClicks();
}

// Add delete button listeners
function addVacDeleteClicks() {
  var deleteBtns = document.querySelectorAll('.delete-vaccine');
  for (var i = 0; i < deleteBtns.length; i++) {
    deleteBtns[i].addEventListener('click', function() {
      var vacId = parseInt(this.getAttribute('data-id'));
      
      // Confirm delete
      if (confirm('Are you sure you want to delete this vaccination?')) {
        let allVacs = getData('vaccinations');
        var updatedVacs = [];
        // Keep non-deleted vaccines
        for (var j = 0; j <= allVacs.length - 1; j++) {
          if (allVacs[j].id !== vacId) {
            updatedVacs.push(allVacs[j]);
          }
        }
        saveData('vaccinations', updatedVacs);
        
        showAlert('Vaccination record deleted successfully!', 'success');
        loadAllVaccines();
      }
    });
  }
}