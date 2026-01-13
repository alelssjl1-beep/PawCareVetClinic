// Initialize pet records page
initPetForm();
loadAllPetRecords();

// Initialize add pet form submission
function initPetForm() {
  const addPetForm = document.getElementById('add-pet-form');
  if (addPetForm) {
    addPetForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Prevent page reload

      // Get form values
      const petName = document.getElementById('pet-name').value.trim();
      const species = document.getElementById('species').value;
      const breed = document.getElementById('breed').value.trim();
      const dob = document.getElementById('dob').value;
      const gender = document.getElementById('gender').value;
      let weight = document.getElementById('weight').value.trim();
      const ownerName = document.getElementById('owner-name').value.trim();
      const ownerPhone = document.getElementById('owner-phone').value.trim();
      const ownerEmail = document.getElementById('owner-email').value.trim();
      let medNotes = document.getElementById('medical-notes').value.trim();

      // Set default values
      if (weight === '') weight = 'N/A';
      if (medNotes === '') medNotes = 'No notes';

      // Create pet object
      const newPet = {
        id: getNewId('pets'),
        petName: petName,
        species: species,
        breed: breed,
        dob: dob,
        gender: gender,
        weight: weight,
        ownerName: ownerName,
        ownerPhone: ownerPhone,
        ownerEmail: ownerEmail,
        medicalNotes: medNotes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Validate and save pet
      if (!checkPetForm(newPet)) return;
      
      const allPets = getData('pets');
      allPets.push(newPet);
      saveData('pets', allPets);

      showAlert('Pet record created successfully!', 'success');
      
      // Redirect to pet records page after 1.5s
      setTimeout(() => {
        window.location.href = 'pet_records.html';
      }, 1500);
    });
  }
}

// Load and display all pet records in table
function loadAllPetRecords() {
  const petTable = document.getElementById('pet-records-body');
  const noPetsMsg = document.getElementById('no-pets-message');

  if (!petTable) return; // Exit if table not found

  const allPets = getData('pets');

  // Show "no pets" message if empty
  if (allPets.length === 0) {
    petTable.innerHTML = '';
    noPetsMsg.classList.remove('d-none');
    return;
  }

  // Hide "no pets" message and build table
  noPetsMsg.classList.add('d-none');
  let tableHtml = '';
  
  allPets.forEach(pet => {
    tableHtml += `
      <tr>
        <td>${pet.id}</td>
        <td>${pet.petName}</td>
        <td>${pet.species}</td>
        <td>${pet.breed}</td>
        <td>${formatDate(pet.dob)}</td>
        <td>${pet.ownerName}</td>
        <td>
          <div class="d-flex gap-2">
            <a href="edit_pet.html?id=${pet.id}" class="btn btn-sm btn-outline-primary" title="Edit">
              <i class="fas fa-edit"></i>
            </a>
            <button class="btn btn-sm btn-outline-danger delete-pet" data-id="${pet.id}" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  // Update table and add delete listeners
  petTable.innerHTML = tableHtml;
  document.querySelectorAll('.delete-pet').forEach(btn => {
    btn.addEventListener('click', function() {
      const petId = parseInt(this.dataset.id);
      deletePetRecord(petId);
    });
  });
}

// Delete pet and all related data (apps/vacs/meds)
function deletePetRecord(petId) {
  // Confirm deletion with user
  if (!confirm('Are you sure you want to delete this pet? You can\'t undo this.')) return;

  // Helper function to filter and save data
  const filterAndSave = (key) => {
    const data = getData(key);
    const filteredData = data.filter(item => item.petId !== petId);
    saveData(key, filteredData);
  };

  // Delete pet and related data
  filterAndSave('pets');
  filterAndSave('appointments');
  filterAndSave('vaccinations');
  filterAndSave('medications');

  // Refresh table and show success message
  loadAllPetRecords();
  showAlert('Pet record deleted successfully!', 'success');
}