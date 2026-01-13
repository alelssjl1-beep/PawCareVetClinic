// Initialize treatment page
loadPetsToTreatDropdown();
loadAllTreatments();

// Handle add treatment form submission
const addTreatForm = document.getElementById('add-treatment-form');
if (addTreatForm) {
  addTreatForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent page reload
    saveNewTreatRecord(); // Save new treatment
    
    // Close modal after save
    const modal = bootstrap.Modal.getInstance(document.getElementById('addTreatmentModal'));
    modal.hide();
  });
}

// Add pets to treatment dropdown
function loadPetsToTreatDropdown() {
  const petSelect = document.getElementById('treat-pet-id');
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
    option.textContent = `${pet.petName} (${pet.species})`;
    petSelect.appendChild(option);
  });
}

// Save new treatment record to localStorage
function saveNewTreatRecord() {
  // Get form values
  const petId = document.getElementById('treat-pet-id').value;
  const treatType = document.getElementById('treatment-type').value;
  const treatDate = document.getElementById('treatment-last-date').value;
  const vetName = document.getElementById('vet-name').value.trim();
  let duration = document.getElementById('treatment-duration').value.trim();
  const status = document.getElementById('treatment-status').value;
  const notes = document.getElementById('treatment-notes').value.trim();

  // Set default duration
  if (duration === '') duration = 'N/A';

  // Validate required fields
  if (!petId || !treatType || !treatDate || !vetName || !notes) {
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

  // Save to localStorage and refresh
  const allTreats = getData('treatments');
  allTreats.push(newTreat);
  saveData('treatments', allTreats);

  showAlert('Treatment record saved successfully!', 'success');
  document.getElementById('add-treatment-form').reset();
  loadAllTreatments();
}

// Load and display all treatment records
function loadAllTreatments() {
  const treatTable = document.getElementById('treatments-body');
  const noTreatsMsg = document.getElementById('no-treatments');

  if (!treatTable) return; // Exit if table not found

  let allTreats = getData('treatments');

  // Show "no treatments" message if empty
  if (allTreats.length === 0) {
    treatTable.innerHTML = '';
    noTreatsMsg.classList.remove('d-none');
    return;
  }

  // Hide message and sort treatments (newest first)
  noTreatsMsg.classList.add('d-none');
  allTreats.sort((a, b) => new Date(b.dateAdministered) - new Date(a.dateAdministered));

  // Build table HTML
  let tableHtml = '';
  allTreats.forEach(treat => {
    // Set status badge style
    let statusBadge = '';
    if (treat.status === 'Completed') statusBadge = '<span class="badge bg-success">Completed</span>';
    if (treat.status === 'In Progress') statusBadge = '<span class="badge bg-primary">In Progress</span>';
    if (treat.status === 'Scheduled') statusBadge = '<span class="badge bg-warning">Scheduled</span>';

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
            <button class="btn btn-sm btn-outline-danger delete-treatment" data-id="${treat.id}">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  // Update table and add action listeners
  treatTable.innerHTML = tableHtml;
  addTreatActionListeners();
}

// Add click events to edit/delete buttons
function addTreatActionListeners() {
  // Delete treatment
  document.querySelectorAll('.delete-treatment').forEach(btn => {
    btn.addEventListener('click', function() {
      const treatId = parseInt(this.dataset.id);
      
      // Confirm before delete
      if (confirm('Are you sure you want to delete this treatment?')) {
        const allTreats = getData('treatments');
        const updatedTreats = allTreats.filter(treat => treat.id !== treatId);
        
        saveData('treatments', updatedTreats);
        showAlert('Treatment record deleted successfully!', 'success');
        loadAllTreatments();
      }
    });
  });
}