// Initialize vaccine page
loadPetsToVaccineDropdown();
loadAllVaccines();

// Handle add vaccine form submission
const addVacForm = document.getElementById('add-vaccination-form');
if (addVacForm) {
  addVacForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent page reload
    saveNewVacRecord(); // Save new vaccine record
    
    // Close modal after save
    const modal = bootstrap.Modal.getInstance(document.getElementById('addVaccinationModal'));
    modal.hide();
  });
}

// Add pets to vaccine dropdown
function loadPetsToVaccineDropdown() {
  const petSelect = document.getElementById('vac-pet-id');
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

// Save new vaccination record to localStorage
function saveNewVacRecord() {
  // Get form values
  const petId = document.getElementById('vac-pet-id').value;
  const vacType = document.getElementById('vaccine-type').value;
  const lastDate = document.getElementById('last-administered').value;
  const nextDate = document.getElementById('next-due').value;
  let notes = document.getElementById('vaccine-notes').value.trim();

  // Set default notes
  if (notes === '') notes = 'No notes';

  // Validate required fields
  if (!petId || !vacType || !lastDate || !nextDate) {
    showAlert('Please fill all required fields!', 'danger');
    return;
  }

  // Validate date order (next >= last)
  const lastDateObj = new Date(lastDate);
  const nextDateObj = new Date(nextDate);
  if (nextDateObj < lastDateObj) {
    showAlert('Next due date cannot be before last administered date!', 'danger');
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

  // Set vaccine status
  const today = new Date();
  const vacStatus = nextDateObj < today ? 'Due' : 'Upcoming';

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

  // Save to localStorage and refresh
  const allVacs = getData('vaccinations');
  allVacs.push(newVac);
  saveData('vaccinations', allVacs);

  showAlert('Vaccination record saved successfully!', 'success');
  document.getElementById('add-vaccination-form').reset();
  loadAllVaccines();
}

// Load and display all vaccine records
function loadAllVaccines() {
  const vacTable = document.getElementById('vaccinations-body');
  const noVacsMsg = document.getElementById('no-vaccinations');

  if (!vacTable) return; // Exit if table not found

  let allVacs = getData('vaccinations');

  // Show "no vaccines" message if empty
  if (allVacs.length === 0) {
    vacTable.innerHTML = '';
    noVacsMsg.classList.remove('d-none');
    return;
  }

  // Hide message and sort vaccines (next due date - earliest first)
  noVacsMsg.classList.add('d-none');
  allVacs.sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue));

  // Build table HTML
  let tableHtml = '';
  const today = new Date(); // Reuse for status check
  allVacs.forEach(vac => {
    // Set status badge (Overdue/Upcoming)
    const vacDate = new Date(vac.nextDue);
    const statusBadge = vacDate < today 
      ? '<span class="badge bg-danger">Overdue</span>' 
      : '<span class="badge bg-warning">Upcoming</span>';

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
  });

  // Update table and add delete listeners
  vacTable.innerHTML = tableHtml;
  addVacDeleteClicks();
}

// Add click events to delete vaccine buttons
function addVacDeleteClicks() {
  document.querySelectorAll('.delete-vaccine').forEach(btn => {
    btn.addEventListener('click', function() {
      const vacId = parseInt(this.dataset.id);
      
      // Confirm before delete
      if (confirm('Are you sure you want to delete this vaccination?')) {
        const allVacs = getData('vaccinations');
        const updatedVacs = allVacs.filter(vac => vac.id !== vacId);
        
        saveData('vaccinations', updatedVacs);
        showAlert('Vaccination record deleted successfully!', 'success');
        loadAllVaccines();
      }
    });
  });
}