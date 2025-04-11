const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function addCandidateForm() {
  const container = document.getElementById("candidatos-container");
  const formIndex = container.childElementCount;

  const candidateCard = document.createElement("div");
  candidateCard.className = "candidato-form";
  candidateCard.innerHTML = `
    <div class="candidate-header">
      <h3>Candidato ${formIndex + 1}</h3>
      <button type="button" class="remove-btn" onclick="removeCandidateForm(this)">Eliminar</button>
    </div>
    <input type="text" placeholder="Nombre del Candidato" class="input candidate-name" required>
    <textarea placeholder="Descripción" class="input candidate-desc" required></textarea>
    <input type="file" accept="image/*" class="input-file candidate-img" required>
    <div class="img-preview"></div>`;

  const fileInput = candidateCard.querySelector(".candidate-img");
  const previewDiv = candidateCard.querySelector(".img-preview");

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    previewDiv.innerHTML = "";
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) {
        previewDiv.innerHTML = `<p class="error">La imagen excede 5 MB</p>`;
        fileInput.value = "";
      } else {
        const reader = new FileReader();
        reader.onload = function(event) {
          const img = document.createElement("img");
          img.src = event.target.result;
          previewDiv.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    }
  });

  container.appendChild(candidateCard);
}

function removeCandidateForm(btn) {
  btn.closest(".candidato-form").remove();
}

function loadExistingCandidates(candidatos) {
  const container = document.getElementById("candidatos-container");
  container.innerHTML = "";

  candidatos.forEach((candidato, index) => {
    const candidateCard = document.createElement("div");
    candidateCard.className = "candidato-form";
    candidateCard.innerHTML = `
      <div class="candidate-header">
        <h3>Candidato ${index + 1}</h3>
        <button type="button" class="remove-btn" onclick="removeCandidateForm(this)">Eliminar</button>
      </div>
      <input type="text" placeholder="Nombre del Candidato" 
             class="input candidate-name" 
             value="${candidato.nombre}" required>
      <textarea placeholder="Descripción" 
                class="input candidate-desc" required>${candidato.descripcion || ""}</textarea>
      <input type="file" accept="image/*" class="input-file candidate-img">
      <div class="img-preview">
        ${candidato.foto ? `<img src="${candidato.foto}" style="max-width: 100px; margin: 10px 0;">` : ""}
      </div>`;
    
    const fileInput = candidateCard.querySelector(".candidate-img");
    const previewDiv = candidateCard.querySelector(".img-preview");
    
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      previewDiv.innerHTML = "";
      if (file) {
        if (file.size > MAX_IMAGE_SIZE) {
          previewDiv.innerHTML = `<p class="error">La imagen excede 5 MB</p>`;
          fileInput.value = "";
        } else {
          const reader = new FileReader();
          reader.onload = function(event) {
            const img = document.createElement("img");
            img.src = event.target.result;
            previewDiv.appendChild(img);
          };
          reader.readAsDataURL(file);
        }
      }
    });
    
    container.appendChild(candidateCard);
  });
}

function guardarConfiguracion(event) {
  event.preventDefault();
  
  // Validación mejorada
  if (!currentUser || !profesores.hasOwnProperty(currentUser)) {
    alert("Acceso no autorizado: Solo profesores registrados pueden configurar");
    return;
  }

  const container = document.getElementById("candidatos-container");
  const candidateForms = container.querySelectorAll(".candidato-form");
  
  // Validación actualizada para requerir mínimo 2 candidatos
  if (candidateForms.length < 2) {
    displayConfigMessage("Agrega al menos dos candidatos antes de guardar.", true);
    return;
  }

  const candidatosConfig = [];
  let valid = true;

  candidateForms.forEach((form) => {
    const nombre = form.querySelector(".candidate-name").value.trim();
    const descripcion = form.querySelector(".candidate-desc").value.trim();
    const fileInput = form.querySelector(".candidate-img");
    const file = fileInput.files[0];

    if (!nombre || !descripcion || (file && file.size > MAX_IMAGE_SIZE)) {
      valid = false;
    } else {
      candidatosConfig.push({ nombre, descripcion, file: file || null, foto: form.querySelector("img")?.src || "" });
    }
  });

  if (!valid) {
    displayConfigMessage("Completa correctamente todos los campos y verifica que las imágenes sean menores a 5 MB.", true);
    return;
  }

  Promise.all(candidatosConfig.map(candidato => 
    new Promise(resolve => {
      if (candidato.file) {
        const reader = new FileReader();
        reader.onload = event => resolve({
          nombre: candidato.nombre,
          descripcion: candidato.descripcion,
          foto: event.target.result
        });
        reader.readAsDataURL(candidato.file);
      } else {
        resolve({
          nombre: candidato.nombre,
          descripcion: candidato.descripcion,
          foto: candidato.foto
        });
      }
    })
  )).then(finalCandidatos => {
    localStorage.setItem("votingConfig", JSON.stringify(finalCandidatos));
    displayConfigMessage("Candidatos guardados correctamente.", false);
    candidatos = finalCandidatos;
  });
}

function displayConfigMessage(msg, isError) {
  const msgDiv = document.getElementById("config-message");
  msgDiv.textContent = msg;
  msgDiv.className = `config-message ${isError ? 'error' : 'success'}`;
  setTimeout(() => msgDiv.textContent = "", 3000);
}