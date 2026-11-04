
const { performance } = require('perf_hooks');
const { ListaSatelital } = require('./lab04_lista_simple');

const N = 100000;

console.log(`Iniciando prueba con ${N} coordenadas...`);

// PRUEBA 1: ARREGLO NATIVO
const arregloHistorial = [];

const inicioArreglo = performance.now();

for (let i = 0; i < N; i++) {
    arregloHistorial.unshift({
        id: i,
        lat: 10.5,
        lng: -79.2
    });
}

const finArreglo = performance.now();
const tiempoArreglo = finArreglo - inicioArreglo;

console.log(
    `Arreglo nativo (unshift): ${tiempoArreglo.toFixed(2)} ms`
);

// PRUEBA 2: LISTA ENLAZADA
const listaHistorial = new ListaSatelital();

const inicioLista = performance.now();

for (let i = 0; i < N; i++) {
    listaHistorial.prepend({
        id: i,
        lat: 10.5,
        lng: -79.2
    });
}

const finLista = performance.now();
const tiempoLista = finLista - inicioLista;

console.log(
    `Lista enlazada (prepend): ${tiempoLista.toFixed(2)} ms`
);

// COMPARACIÓN DE LOS TIEMPOS
if (tiempoLista > 0) {
    const multiplicador = tiempoArreglo / tiempoLista;

    console.log(
        `El arreglo tardó ${multiplicador.toFixed(1)} veces el tiempo de la lista.`
    );
}

console.log('Prueba finalizada.');
