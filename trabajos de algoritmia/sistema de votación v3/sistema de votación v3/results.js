let votingResults = {
  candidatos: {},
  blanco: 0,
  total: 0
};

function initializeResults(candidatosList) {
  votingResults.candidatos = {};
  
  candidatosList.forEach(candidato => {
    if (candidato?.nombre && typeof candidato.nombre === "string") {
      votingResults.candidatos[candidato.nombre] = 0;
    }
  });
  saveResults();
}

function registerVote(vote) {
  try {
    if (vote === "blanco") {
      votingResults.blanco++;
    } else if (typeof vote === "number" && candidatos[vote]?.nombre) {
      const nombreCandidato = candidatos[vote].nombre;
      if (!votingResults.candidatos[nombreCandidato]) {
        votingResults.candidatos[nombreCandidato] = 0;
      }
      votingResults.candidatos[nombreCandidato]++;
    } else {
      throw new Error("Tipo de voto inválido");
    }
    
    votingResults.total = Object.values(votingResults.candidatos).reduce((a, b) => a + b, 0) + votingResults.blanco;
    saveResults();
  } catch (error) {
    console.error("Error registrando voto:", error);
    alert("Error al procesar el voto");
    throw error;
  }
}

function saveResults() {
  localStorage.setItem("votingResults", JSON.stringify({
    candidatos: votingResults.candidatos,
    blanco: votingResults.blanco,
    total: votingResults.total
  }));
}

function loadResults() {
  const saved = localStorage.getItem("votingResults");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      votingResults = {
        candidatos: typeof parsed.candidatos === "object" ? parsed.candidatos : {},
        blanco: Number.isInteger(parsed.blanco) ? parsed.blanco : 0,
        total: Number.isInteger(parsed.total) ? parsed.total : 0
      };
    } catch (e) {
      console.error("Error cargando resultados:", e);
      votingResults = { candidatos: {}, blanco: 0, total: 0 };
    }
  }
}

function showResults() {
  const resultsDiv = document.createElement("div");
  resultsDiv.className = "results-card";
  resultsDiv.innerHTML = `
    <h2>Resultados de la Votación</h2>
    <div class="results-list"></div>
    <button onclick="closeResults()" class="btn secondary">Cerrar</button>`;

  const list = resultsDiv.querySelector(".results-list");
  let content = "<h3>Votos por candidato:</h3>";

  Object.entries(votingResults.candidatos).forEach(([nombre, votos]) => {
    if (nombre && typeof votos === "number") {
      const percentage = votingResults.total > 0 
        ? ((votos / votingResults.total) * 100).toFixed(2) 
        : "0.00";
      content += `
        <div class="result-item">
          <span>${nombre}: ${votos} votos</span>
          <div class="progress-bar">
            <div style="width: ${percentage}%" class="progress-fill"></div>
          </div>
          <span>${percentage}%</span>
        </div>`;
    }
  });

  // Calcular y formatear el porcentaje del voto en blanco con dos decimales
  const blankPercentage = votingResults.total > 0 
    ? ((votingResults.blanco / votingResults.total) * 100).toFixed(2) 
    : "0.00";

  content += `
    <div class="result-item">
      <span>Voto en blanco: ${votingResults.blanco}</span>
      <div class="progress-bar">
        <div style="width: ${blankPercentage}%" class="progress-fill"></div>
      </div>
      <span>${blankPercentage}%</span>
    </div>
    <p class="total-votes">Total de votos: ${votingResults.total}</p>`;

  list.innerHTML = content;
  document.body.appendChild(resultsDiv);
}

function closeResults() {
  const resultsCard = document.querySelector(".results-card");
  if (resultsCard) resultsCard.remove();
}

// Inicialización
loadResults();
