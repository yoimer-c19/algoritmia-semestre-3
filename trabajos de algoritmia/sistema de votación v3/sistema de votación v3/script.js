// Estados de votación
const VOTING_STATUS = {
  NOT_STARTED: 'not_started',
  STARTED: 'started',
  FINISHED: 'finished'
};

let candidatos = [];
let selectedVote = null;
let currentUser = null;

const ADMIN_CREDENTIALS = {
  user: "admin",
  pass: "Admin2024#"
};

// ================== CONTROL DE VOTACIÓN ==================
function getVotingStatus() {
  return localStorage.getItem('votingStatus') || VOTING_STATUS.NOT_STARTED;
}

function setVotingStatus(status) {
  localStorage.setItem('votingStatus', status);
}

function updateVotingControls() {
  const status = getVotingStatus();
  document.getElementById('start-voting').disabled = status !== VOTING_STATUS.NOT_STARTED;
  document.getElementById('end-voting').disabled = status !== VOTING_STATUS.STARTED;
}

function startVoting() {
  if (!profesores[currentUser]) {
    alert("Solo los profesores pueden iniciar votaciones");
    return;
  }
  
  // Validación actualizada para requerir mínimo 2 candidatos
  if (candidatos.length < 2) {
    alert("¡Debes configurar al menos dos candidatos primero!");
    return;
  }

  if (confirm("¿Iniciar la votación oficialmente?\nLos estudiantes podrán comenzar a votar.")) {
    setVotingStatus(VOTING_STATUS.STARTED);
    updateVotingControls();
    alert("✅ Votación iniciada con éxito");
  }
}

function endVoting() {
  if (!profesores[currentUser]) {
    alert("Solo los profesores pueden finalizar votaciones");
    return;
  }
  
  if (confirm("¿Finalizar la votación definitivamente?\nSe bloquearán todos los nuevos votos.")) {
    setVotingStatus(VOTING_STATUS.FINISHED);
    updateVotingControls();
    alert("✅ Votación finalizada correctamente");
  }
}

// ================== AUTENTICACIÓN ==================
function updateUserNames() {
  const userType = document.getElementById("user-type").value;
  const userNameSelect = document.getElementById("user-name");
  userNameSelect.innerHTML = '<option value="" disabled selected>Selecciona tu nombre</option>';
  userNameSelect.disabled = false;

  const users = userType === "estudiante" ? estudiantes : profesores;
  Object.keys(users).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    userNameSelect.appendChild(option);
  });
}

function login() {
  const userType = document.getElementById("user-type").value;
  const userName = document.getElementById("user-name").value;
  const userCode = document.getElementById("user-code").value;

  if (!userType || !userName || !userCode) {
    alert("¡Debes completar todos los campos!");
    return;
  }

  const users = userType === "estudiante" ? estudiantes : profesores;
  
  if (users[userName] === userCode) {
    currentUser = userName;
    
    if (userType === "profesor") {
      showSection("profesor");
      updateVotingControls();
    } else {
      handleStudentLogin(userName);
    }
  } else {
    alert("Credenciales incorrectas. Verifica tus datos.");
  }

  resetLoginForm();
}

function handleStudentLogin(studentName) {
  const status = getVotingStatus();
  
  if (status === VOTING_STATUS.FINISHED) {
    alert("❌ La votación ya ha finalizado");
    showSection("login");
    return;
  }
  
  if (status !== VOTING_STATUS.STARTED) {
    alert("⏳ La votación no ha comenzado aún");
    showSection("login");
    return;
  }
  
  if (hasStudentVoted(studentName)) {
    alert("⚠️ Ya has ejercido tu derecho al voto");
    showSection("login");
    return;
  }
  
  updateVotingList();
  showSection("estudiante");
}

function resetLoginForm() {
  document.getElementById("user-type").value = "";
  document.getElementById("user-name").innerHTML = '<option value="" disabled selected>Selecciona tu nombre</option>';
  document.getElementById("user-name").disabled = true;
  document.getElementById("user-code").value = "";
}

// ================== VOTACIÓN ==================
function updateVotingList() {
  try {
    const savedConfig = localStorage.getItem("votingConfig");
    candidatos = savedConfig ? JSON.parse(savedConfig) : [];
    
    const list = document.getElementById("candidatos-list");
    list.innerHTML = "";
    
    if (candidatos.length === 0) {
      list.innerHTML = "<p class='error-voting'>No hay candidatos disponibles</p>";
      return;
    }

    candidatos.forEach((candidato, index) => {
      if (!candidato.nombre || !candidato.foto) return;
      
      const card = document.createElement("div");
      card.className = "candidato-card" + (selectedVote === index ? " selected" : "");
      card.innerHTML = `
        <div class="candidato-inner">
          <div class="candidato-front">
            <img src="${candidato.foto}" alt="${candidato.nombre}">
            <h3>${candidato.nombre}</h3>
          </div>
          <div class="candidato-back">
            <p>${candidato.descripcion || "Descripción no disponible"}</p>
            <button class="vote-btn" onclick="handleVote(${index})">Votar</button>
          </div>
        </div>`;
      card.onclick = () => handleVote(index);
      list.appendChild(card);
    });
    
    // --- Agregar botón para voto en blanco ---
    const blankCard = document.createElement("div");
    blankCard.className = "candidato-card" + (selectedVote === -1 ? " selected" : "");
    blankCard.innerHTML = `
      <div class="candidato-inner">
        <div class="candidato-front">
          <img src="https://cdn-icons-png.flaticon.com/512/32/32232.png" alt="Voto en Blanco" style="opacity: 0.5;">
          <h3>Voto en Blanco</h3>
        </div>
        <div class="candidato-back">
          <p>Selecciona esta opción si no deseas votar por ningún candidato.</p>
          <button class="vote-btn" onclick="handleVote(-1)">Votar en Blanco</button>
        </div>
      </div>`;
    list.appendChild(blankCard);

  } catch (error) {
    console.error("Error cargando candidatos:", error);
    alert("Error al cargar los candidatos");
  }
}

function handleVote(index) {
  if (hasStudentVoted(currentUser)) return;
  
  // --- Manejo del voto en blanco ---
  if (index === -1) {
    if (confirm("¿Confirmas tu voto en blanco?")) {
      selectedVote = -1;
      submitVote();
    }
    return;
  }

  if (index < 0 || index >= candidatos.length) {
    alert("Selección inválida");
    return;
  }

  if (confirm(`¿Confirmas tu voto por ${candidatos[index].nombre}?`)) {
    selectedVote = index;
    submitVote();
  }
}

function submitVote() {
  if (selectedVote === null || (selectedVote !== -1 && !candidatos[selectedVote])) {
    alert("Error al procesar el voto");
    return;
  }

  try {
    if (selectedVote === -1) {
      // Voto en blanco
      registerVote("blanco");
      alert("✅ Voto registrado para:\nVoto en Blanco");
    } else {
      registerVote(selectedVote);
      alert(`✅ Voto registrado para:\n${candidatos[selectedVote].nombre}`);
    }
    markStudentVoted(currentUser);
    
    showSection("login");
  } catch (error) {
    console.error("Error al votar:", error);
    alert("Error crítico al registrar el voto");
  } finally {
    selectedVote = null;
    document.querySelectorAll(".candidato-card").forEach(card => card.classList.remove("selected"));
  }
}

// ================== GESTIÓN DE VOTOS ==================
function hasStudentVoted(studentName) {
  const votedStudents = JSON.parse(localStorage.getItem("votedStudents") || "{}");
  return votedStudents[studentName] === true;
}

function markStudentVoted(studentName) {
  const votedStudents = JSON.parse(localStorage.getItem("votedStudents") || "{}");
  votedStudents[studentName] = true;
  localStorage.setItem("votedStudents", JSON.stringify(votedStudents));
}

// ================== RESULTADOS ==================
function showResults() {
  const resultsDiv = document.createElement("div");
  resultsDiv.className = "results-card";
  resultsDiv.innerHTML = `
    <h2>Resultados Actualizados</h2>
    <div class="results-list"></div>
    <button onclick="closeResults()" class="btn secondary">Cerrar</button>`;

  document.body.appendChild(resultsDiv);
  updateResultsDisplay();
}

// ================== UTILIDADES ==================
function showSection(section) {
  document.querySelectorAll("[id$='-section']").forEach(el => el.classList.add("hidden"));
  document.getElementById(`${section}-section`).classList.remove("hidden");
}

function showResetPrompt() {
  document.getElementById('auth-overlay').classList.remove("hidden");
}

function hideAuthModal() {
  document.getElementById('auth-overlay').classList.add("hidden");
  document.getElementById('admin-user').value = '';
  document.getElementById('admin-pass').value = '';
}

function confirmReset() {
  const user = document.getElementById('admin-user').value;
  const pass = document.getElementById('admin-pass').value;

  if (user === ADMIN_CREDENTIALS.user && pass === ADMIN_CREDENTIALS.pass) {
    localStorage.clear();
    candidatos = [];
    selectedVote = null;
    currentUser = null;
    setVotingStatus(VOTING_STATUS.NOT_STARTED);
    alert("Sistema reiniciado exitosamente");
    location.reload();
  } else {
    alert("Credenciales de administrador incorrectas");
  }
  hideAuthModal();
}

// ================== MODIFICAR CANDIDATOS ==================
function modifyCandidates() {
  if (!profesores[currentUser]) {
    alert("Solo los profesores pueden modificar candidatos");
    return;
  }
  
  // Cargar configuración existente
  const savedConfig = localStorage.getItem("votingConfig");
  if (savedConfig) {
    candidatos = JSON.parse(savedConfig);
    loadExistingCandidates(candidatos);
  }
  
  showSection("profesor");
  updateVotingControls();
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  updateVotingControls();
  loadResults();
});