/**
 * Consumo de memoria del GreenBST en el Heap de V8 (RNF-2).
 * Debe crecer de forma lineal con el número de registros.
 *
 * Ejecución: node --expose-gc src/benchmark/memoria.js
 */
const GreenBST = require('../estructuras/GreenBST');
const { generarRegistrosSimulados } = require('../scraping/fuenteSimulada');
const { limpiarRegistro, validarRegistros } = require('../scraping/limpieza');

// Dos recolecciones completas: el barrido de V8 es perezoso y una sola puede dejar heapUsed sin actualizar.
const gc = () => { if (global.gc) { global.gc(); global.gc(); } };

function medir(n) {
  const crudos = generarRegistrosSimulados({ cantidad: n, productosDistintos: Math.ceil(n / 5), semilla: 42 });
  const { validos } = validarRegistros(crudos.map((c) => limpiarRegistro(c, '2026-10-07')));
  // Se aplanan los strings (V8 los crea encadenados) para que las comparaciones del árbol
  // no los transformen durante la medición y falseen la diferencia de heapUsed.
  for (const r of validos) { r.producto.charCodeAt(0); r.feria.charCodeAt(0); }
  gc();
  const antes = process.memoryUsage().heapUsed;
  const arbol = new GreenBST();
  for (const r of validos) arbol.insertar(r);
  gc();
  const delta = process.memoryUsage().heapUsed - antes;
  return { n, productos: arbol.cantidadProductos, delta, vivo: arbol.cantidadRegistros + validos.length };
}

if (!global.gc) console.log('Aviso: sin --expose-gc las cifras son menos precisas.\n');
console.log('=== MEMORIA DEL GreenBST (heapUsed) ===');
console.log('Registros | Productos | Heap añadido (MB) | Bytes/registro | Bytes/nodo (aprox.)');
for (const n of [10000, 40000, 100000, 200000]) {
  const { productos, delta } = medir(n);
  console.log(`${String(n).padStart(9)} | ${String(productos).padStart(9)} | ${(delta / 1024 / 1024).toFixed(2).padStart(17)} | ${(delta / n).toFixed(1).padStart(14)} | ${(delta / productos).toFixed(1).padStart(19)}`);
}
console.log('\nNota: se mide solo lo que añade el árbol (nodos, listas y punteros); los registros ya existían en memoria.');
