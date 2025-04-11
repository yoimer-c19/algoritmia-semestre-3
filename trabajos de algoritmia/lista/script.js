document.getElementById('generarGrupos').addEventListener('click', function () {
    const fileInput = document.getElementById('fileInput');
    const tamanoGrupo = parseInt(document.getElementById('tamanoGrupo').value);
    const minMujeres = parseInt(document.getElementById('minMujeres').value);
    const maxMujeres = parseInt(document.getElementById('maxMujeres').value);
    const minHombres = parseInt(document.getElementById('minHombres').value);
    const maxHombres = parseInt(document.getElementById('maxHombres').value);

    if (fileInput.files.length === 0) {
        alert("Por favor, selecciona un archivo CSV.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const text = e.target.result;
        const estudiantes = parseCSV(text);
        const grupos = formarGrupos(estudiantes, tamanoGrupo, minMujeres, maxMujeres, minHombres, maxHombres);
        mostrarGrupos(grupos);
    };

    reader.readAsText(file);
});

function parseCSV(text) {
    const lines = text.split('\n');
    const estudiantes = [];

    for (let i = 1; i < lines.length; i++) {
        const [tipoDoc, numDoc, nombre, repite, genero] = lines[i].split(';');
        if (nombre && genero) {
            estudiantes.push({ nombre: nombre.trim(), genero: genero.trim() });
        }
    }

    return estudiantes;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function formarGrupos(estudiantes, tamanoGrupo, minMujeres, maxMujeres, minHombres, maxHombres) {
    const mujeres = estudiantes.filter(est => est.genero === 'F');
    const hombres = estudiantes.filter(est => est.genero === 'M');
    const grupos = [];

    // Mezclar las listas para aleatoriedad
    shuffleArray(mujeres);
    shuffleArray(hombres);

    while (mujeres.length > 0 || hombres.length > 0) {
        const grupo = [];
        const mujeresEnGrupo = Math.min(maxMujeres, Math.max(minMujeres, Math.floor(Math.random() * (maxMujeres - minMujeres + 1)) + minMujeres));
        const hombresEnGrupo = Math.min(maxHombres, Math.max(minHombres, tamanoGrupo - mujeresEnGrupo));

        // Añadir mujeres al grupo
        for (let i = 0; i < mujeresEnGrupo && mujeres.length > 0; i++) {
            grupo.push(mujeres.pop());
        }

        // Añadir hombres al grupo
        for (let i = 0; i < hombresEnGrupo && hombres.length > 0; i++) {
            grupo.push(hombres.pop());
        }

        // Si el grupo no está vacío, añadirlo a la lista de grupos
        if (grupo.length > 0) {
            grupos.push(grupo);
        }
    }

    // Redistribuir personas si hay grupos con menos de `tamanoGrupo` personas
    for (let i = grupos.length - 1; i >= 0; i--) {
        if (grupos[i].length < tamanoGrupo && i > 0) {
            // Mover personas al grupo anterior
            while (grupos[i].length > 0 && grupos[i - 1].length < tamanoGrupo) {
                grupos[i - 1].push(grupos[i].pop());
            }

            // Si el grupo actual queda vacío, eliminarlo
            if (grupos[i].length === 0) {
                grupos.splice(i, 1);
            }
        }
    }

    return grupos;
}

function mostrarGrupos(grupos) {
    const gruposContainer = document.getElementById('gruposContainer');
    gruposContainer.innerHTML = '';

    grupos.forEach((grupo, index) => {
        const grupoDiv = document.createElement('div');
        grupoDiv.className = 'grupo';
        grupoDiv.innerHTML = `<h3>Grupo ${index + 1}</h3>`;

        grupo.forEach(estudiante => {
            const clase = estudiante.genero === 'F' ? 'mujer' : 'hombre';
            grupoDiv.innerHTML += `<p class="${clase}">${estudiante.nombre}</p>`;
        });

        gruposContainer.appendChild(grupoDiv);
    });
}