const pasos = document.querySelectorAll('.paso');
const botonSiguiente = document.getElementById('siguiente');
let pasoActual = 0;

botonSiguiente.addEventListener('click', function() {
    if (pasoActual < pasos.length - 1) {
        pasos[pasoActual].classList.add('oculto');
        pasoActual++;
        pasos[pasoActual].classList.remove('oculto');
    } else {
        alert('¡Café listo! Disfruta.');
    }
});