const { performance } = require('perf_hooks');
const { ListaSatelital } = require('./lab04_lista_simple');
 
const N = 100000; // 100 mil registros satelitales
 
console.log(`[Benchmark] Iniciando inserción de ${N} elementos al INICIO...`);
 
// ---------------------------------------------------------
// PRUEBA 1: ARREGLO NATIVO (O(n) por inserción y O(n²) en el bucle completo)
// ---------------------------------------------------------
let arregloHistorial = [];
const startArray = performance.now();
 
for (let i = 0; i < N; i++) {
	// unshift() fuerza a V8 a mover los índices de todos los elementos previos, mayor latencia generada
	arregloHistorial.unshift({ id: i, lat: 10.5, lng: -79.2 });
}
 
const endArray = performance.now();
const timeArray = (endArray - startArray).toFixed(2);
console.log(`[Energía Alta] Arreglo nativo (unshift): ${timeArray} ms`);
 
// ---------------------------------------------------------
// PRUEBA 2: LISTA ENLAZADA (Asignación de punteros O(1))
// ---------------------------------------------------------
let listaHistorial = new ListaSatelital();
const startList = performance.now();
 
for (let i = 0; i < N; i++) {
	// prepend() solo reasigna dos referencias, sin mover ningún nodo existente
	listaHistorial.prepend({ id: i, lat: 10.5, lng: -79.2 });
}
 
const endList = performance.now();
const timeList = (endList - startList).toFixed(2);
console.log(`[Energía Baja] Lista Enlazada (prepend): ${timeList} ms`);
 
// Conclusión de impacto por el uso de ambos métodos 
const multiplicador = (timeArray / timeList).toFixed(1);
console.log(`\n[Auditoría Verde] La lista enlazada es ${multiplicador} veces más rápida.`);
console.log(`Ahorro directo de ciclos de CPU y consumo eléctrico en el servidor.`);
listaHistorial.imprimirPrimeros(5);
