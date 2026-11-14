/**
 * Benchmark de latencia de búsqueda: GreenBST vs arreglo lineal (RF-12, RNF-4).
 *
 * - Mismos datos y mismas búsquedas para ambas estructuras.
 * - 30 repeticiones por tamaño; se reporta la mediana.
 * - Resultados guardados en resultados/benchmark.json y resultados/benchmark.csv.
 *
 * Ejecución: node --expose-gc src/benchmark/benchmark.js [--rapido]
 */
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const GreenBST = require('../estructuras/GreenBST');
const TablaHash = require('../estructuras/TablaHash');
const ArregloLineal = require('../estructuras/ArregloLineal');
const { generarRegistrosSimulados, crearPRNG } = require('../scraping/fuenteSimulada');
const { limpiarRegistro, validarRegistros } = require('../scraping/limpieza');

const RAPIDO = process.argv.includes('--rapido');
const TAMANOS = RAPIDO ? [1000, 10000] : [1000, 10000, 40000, 100000];
const REPETICIONES = 30;
const CONSULTAS = 100;
const CALENTAMIENTO = 3;

const mediana = (valores) => {
  const orden = [...valores].sort((a, b) => a - b);
  const m = orden.length >> 1;
  return orden.length % 2 ? orden[m] : (orden[m - 1] + orden[m]) / 2;
};

/** Genera datos limpios y los carga en las tres estructuras. */
function construir(n) {
  const crudos = generarRegistrosSimulados({ cantidad: n, productosDistintos: Math.ceil(n / 5), semilla: 42 });
  const { validos } = validarRegistros(crudos.map((c) => limpiarRegistro(c, '2026-10-07')));

  const arbol = new GreenBST();
  const hash = new TablaHash();
  const arreglo = new ArregloLineal();

  const tArbol = performance.now();
  for (const r of validos) arbol.insertar(r);
  const msArbol = performance.now() - tArbol;

  const tHash = performance.now();
  for (const r of validos) hash.indexarPorFeria(r);
  const msHash = performance.now() - tHash;

  const tArreglo = performance.now();
  for (const r of validos) arreglo.insertar(r);
  const msArreglo = performance.now() - tArreglo;

  return { validos, arbol, hash, arreglo, msArbol, msHash, msArreglo };
}

/** Mismas consultas para ambas estructuras: 90 % productos existentes y 10 % inexistentes. */
function crearConsultas(validos) {
  const prng = crearPRNG(7);
  const consultas = [];
  for (let i = 0; i < CONSULTAS; i++) {
    consultas.push(i % 10 === 9 ? `producto inexistente ${i}` : validos[Math.floor(prng() * validos.length)].producto);
  }
  return consultas;
}

/** Latencia media por búsqueda (µs) de una repetición. */
function medirRepeticion(estructura, consultas) {
  const inicio = performance.now();
  let encontrados = 0;
  for (const producto of consultas) encontrados += estructura.buscar(producto).length;
  const fin = performance.now();
  return { us: ((fin - inicio) / consultas.length) * 1000, encontrados };
}

console.log(`=== BENCHMARK GreenBST vs arreglo lineal (${REPETICIONES} repeticiones, ${CONSULTAS} búsquedas, mediana) ===\n`);
const filas = [];

for (const n of TAMANOS) {
  if (global.gc) global.gc();
  const { validos, arbol, hash, arreglo, msArbol, msHash, msArreglo } = construir(n);
  const consultas = crearConsultas(validos);

  // Comprobación: ambas estructuras devuelven lo mismo (mismos datos, mismas búsquedas)
  for (const producto of consultas) {
    if (arbol.buscar(producto).length !== arreglo.buscar(producto).length) throw new Error(`Resultados distintos para "${producto}"`);
  }
  const { valido, errores } = arbol.validar();
  if (!valido) throw new Error(`Árbol inválido: ${errores[0]}`);

  for (let i = 0; i < CALENTAMIENTO; i++) { medirRepeticion(arbol, consultas); medirRepeticion(arreglo, consultas); }

  const tiemposArbol = [];
  const tiemposLineal = [];
  for (let rep = 0; rep < REPETICIONES; rep++) {
    tiemposArbol.push(medirRepeticion(arbol, consultas).us);
    tiemposLineal.push(medirRepeticion(arreglo, consultas).us);
  }

  const fila = {
    registros: validos.length,
    productosDistintos: arbol.cantidadProductos,
    alturaArbol: arbol.altura,
    comparacionesTeoricasLineal: validos.length,
    comparacionesTeoricasArbol: Math.ceil(Math.log2(arbol.cantidadProductos + 1)),
    medianaGreenBST_us: +mediana(tiemposArbol).toFixed(3),
    medianaLineal_us: +mediana(tiemposLineal).toFixed(3),
    mejora: +(mediana(tiemposLineal) / mediana(tiemposArbol)).toFixed(1),
    insercionGreenBST_ms: +msArbol.toFixed(1),
    insercionTablaHash_ms: +msHash.toFixed(1),
    insercionArreglo_ms: +msArreglo.toFixed(1),
    ferias: hash.cantidadFerias,
  };
  filas.push(fila);
}

console.log('Registros | Productos | Altura | GreenBST (µs) | Lineal (µs) | Mejora');
for (const f of filas) {
  console.log(`${String(f.registros).padStart(9)} | ${String(f.productosDistintos).padStart(9)} | ${String(f.alturaArbol).padStart(6)} | ${String(f.medianaGreenBST_us).padStart(13)} | ${String(f.medianaLineal_us).padStart(11)} | ${f.mejora}x`);
}

const carpeta = path.join(__dirname, '..', '..', 'resultados');
fs.mkdirSync(carpeta, { recursive: true });
fs.writeFileSync(path.join(carpeta, 'benchmark.json'), JSON.stringify({ fecha: new Date().toISOString(), repeticiones: REPETICIONES, consultas: CONSULTAS, filas }, null, 2));
const columnas = Object.keys(filas[0]);
fs.writeFileSync(path.join(carpeta, 'benchmark.csv'), [columnas.join(','), ...filas.map((f) => columnas.map((c) => f[c]).join(','))].join('\n') + '\n');
console.log(`\nResultados guardados en ${path.relative(process.cwd(), carpeta) || carpeta}/benchmark.json y benchmark.csv`);
