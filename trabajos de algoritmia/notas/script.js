document.getElementById('formNotas').addEventListener('submit', function (e) {
    e.preventDefault();

    const nota1 = parseFloat(document.getElementById('nota1').value);
    const nota2 = parseFloat(document.getElementById('nota2').value);
    const notaMinima = 3; // Nota mínima para aprobar

    if (isNaN(nota1) || isNaN(nota2)) {
        mostrarResultado('Por favor, ingresa valores válidos para las notas.', 'error');
        return;
    }

    // Calcular la nota necesaria para aprobar (NF)
    const nf = ((notaMinima - (nota1 * 0.3) - (nota2 * 0.3)) / 0.4).toFixed(2);

    if (nf > 5) {
        mostrarResultado(`No es posible aprobar. Necesitarías una nota final de ${nf}.`, 'error');
    } else if (nf <= 0) {
        mostrarResultado('¡Ya tienes suficientes puntos para aprobar!', 'success');
    } else {
        mostrarResultado(`Necesitas una nota final de al menos ${nf} para aprobar.`, 'success');
    }
});

function mostrarResultado(mensaje, tipo) {
    const resultado = document.getElementById('resultado');
    resultado.textContent = mensaje;
    resultado.style.color = tipo === 'success' ? '#2ea043' : '#f85149'; // Verde para éxito, rojo para error
}