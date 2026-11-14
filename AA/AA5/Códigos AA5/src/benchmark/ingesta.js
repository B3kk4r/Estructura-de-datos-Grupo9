/**
 * Ingesta continua (RF-11): carga lotes de datos en el GreenBST y en el arreglo lineal a
 * intervalos regulares mientras se realizan búsquedas, y registra la latencia en cada momento.
 *
 * Ejecución: node src/benchmark/ingesta.js
 */
const { performance } = require('perf_hooks');
const GreenBST = require('../estructuras/GreenBST');
const ArregloLineal = require('../estructuras/ArregloLineal');
const { generarRegistrosSimulados } = require('../scraping/fuenteSimulada');
const { limpiarRegistro, validarRegistros } = require('../scraping/limpieza');

function ejecutarIngestaContinua({ lotes = 8, tamanoLote = 5000, intervaloMs = 200, consultasPorMedicion = 50 } = {}) {
  const arbol = new GreenBST();
  const arreglo = new ArregloLineal();
  const productos = [];
  const mediciones = [];
  let cargados = 0;

  const cargarLote = () => {
    const crudos = generarRegistrosSimulados({ cantidad: tamanoLote, productosDistintos: Math.ceil((tamanoLote * (cargados + 1)) / 5), semilla: 100 + cargados });
    const { validos } = validarRegistros(crudos.map((c) => limpiarRegistro(c, '2026-10-07')));
    for (const r of validos) { arbol.insertar(r); arreglo.insertar(r); productos.push(r.producto); }
    cargados++;
  };

  const medir = (estructura) => {
    const t0 = performance.now();
    for (let i = 0; i < consultasPorMedicion; i++) estructura.buscar(productos[(i * 7919) % productos.length]);
    return ((performance.now() - t0) / consultasPorMedicion) * 1000;
  };

  return new Promise((resolver) => {
    cargarLote();                                   // el primer lote está disponible desde el inicio
    const busqueda = setInterval(() => {            // búsquedas continuas mientras llegan datos
      const m = { registros: arreglo.tamano, greenBST_us: +medir(arbol).toFixed(3), lineal_us: +medir(arreglo).toFixed(3) };
      mediciones.push(m);
      console.log(`  registros: ${String(m.registros).padStart(7)} | GreenBST: ${String(m.greenBST_us).padStart(8)} µs | lineal: ${String(m.lineal_us).padStart(9)} µs`);
    }, Math.max(10, intervaloMs / 2));

    const ingesta = setInterval(() => {
      if (cargados >= lotes) {
        clearInterval(ingesta);
        clearInterval(busqueda);
        resolver({ arbol, arreglo, mediciones });
        return;
      }
      cargarLote();
    }, intervaloMs);
  });
}

if (require.main === module) {
  console.log('=== INGESTA CONTINUA: lotes cada 200 ms mientras se buscan productos ===');
  ejecutarIngestaContinua().then(({ arbol, arreglo }) => {
    console.log(`\nIngesta terminada: ${arreglo.tamano} registros, ${arbol.cantidadProductos} productos, altura del árbol ${arbol.altura}.`);
    const { valido } = arbol.validar();
    console.log(`Árbol válido tras la ingesta: ${valido}`);
  });
}

module.exports = { ejecutarIngestaContinua };
