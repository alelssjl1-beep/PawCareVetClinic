// Load pet form/records functions when page loads
  const addPetForm = document.getElementById('add-pet-form');
  if (addPetForm) {
    addPetForm.addEventListener('submit', function(e) {
      // Stop page reload
      e.preventDefault();
      
      // Get form input values
      var petName = document.getElementById('pet-name').value.trim();
      let species = document.getElementById('species').value;
      var breed = document.getElementById('breed').value.trim();
      let dob = document.getElementById('dob').value;
      var gender = document.getElementById('gender').value;
      let weight = document.getElementById('weight').value.trim();
      var ownerName = document.getElementById('owner-name').value.trim();
      let ownerPhone = document.getElementById('owner-phone').value.trim();
      var ownerEmail = document.getElementById('owner-email').value.trim();
      let medNotes = document.getElementById('medical-notes').value.trim();
      
      // Set default values if empty
      if (weight === '') {
        weight = 'N/A';
      }
      if (medNotes === '') {
        medNotes = 'No notes';
      }
      
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
      
      // Check if form is valid
      if (!checkPetForm(newPet)) {
        return;
      }
      
      // Save pet to local storage
      let allPets = getData('pets');
      allPets.push(newPet);
      saveData('pets', allPets);
      
      // Show success message
      showAlert('Pet record created successfully!', 'success');
      
      // Go to pet records page after 1.5 seconds
      setTimeout(function() {
        window.location.href = 'pet_records.html';
      }, 1500);
    });
  }

  // Load all pet records to table
  loadAllPetRecords();

// Load and display pet records in table
function loadAllPetRecords() {
  var petTable = document.getElementById('pet-records-body');
  const noPetsMsg = document.getElementById('no-pets-message');
  
  // Stop if table not found
  if (!petTable) {
    return;
  }
  
  // Get all pets from storage
  let allPets = getData('pets');
  
  // Show "no pets" message if empty
  if (allPets.length === 0) {
    petTable.innerHTML = '';
    noPetsMsg.classList.remove('d-none');
    return;
  }
  
  // Hide "no pets" message
  noPetsMsg.classList.add('d-none');
  
  // Build table rows
  let tableHtml = '';
  for (var i = 0; i <= allPets.length - 1; i++) {
    const pet = allPets[i];
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
    <button class="btn btn-sm btn-outline-danger delete-pet" data-id="${pet.id}" title="Delete"> <!-- indent mismatch -->
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }
  
  // Add rows to table
  petTable.innerHTML = tableHtml;
  
  // Add delete click events
  var deleteBtns = document.querySelectorAll('.delete-pet');
  for (var i = 0; i < deleteBtns.length; i++) {
    deleteBtns[i].addEventListener('click', function() {
      var petId = parseInt(this.getAttribute('data-id'));
      deletePetRecord(petId);
    });
  }
}

// Delete pet and related data
function deletePetRecord(petId) {
  // Confirm delete with user
  if (confirm('Are you sure you want to delete this pet? You can\'t undo this.')) {
    // Delete pet from storage
    let allPets = getData('pets');
    var updatedPets = [];
    for (var i = 0; i < allPets.length; i++) {
      if (allPets[i].id !== petId) {
        updatedPets.push(allPets[i]);
      }
    }
    saveData('pets', updatedPets);
    
    // Delete related appointments
    let allApps = getData('appointments');
    var updatedApps = [];
    for (var i = 0; i < allApps.length; i++) {
      if (allApps[i].petId !== petId) {
        updatedApps.push(allApps[i]);
      }
    }
    saveData('appointments', updatedApps);
    
    // Delete related vaccinations
    let allVacs = getData('vaccinations');
    var updatedVacs = [];
    for (var i = 0; i < allVacs.length; i++) {
      if (allVacs[i].petId !== petId) {
        updatedVacs.push(allVacs[i]);
      }
    }
    saveData('vaccinations', updatedVacs);
    
    // Delete related medications
    let allMeds = getData('medications');
    var updatedMeds = [];
    for (var i = 0; i < allMeds.length; i++) {
      if (allMeds[i].petId !== petId) {
        updatedMeds.push(allMeds[i]);
      }
    }
    saveData('medications', updatedMeds);
    
    // Refresh pet table
    loadAllPetRecords();
    // Show success message
    showAlert('Pet record deleted successfully!', 'success');
  }
}

