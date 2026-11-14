
const ELEMENTOS = Number(process.argv[2]) || 10 * 1024 * 1024;
const ITERACIONES = Number(process.argv[3]) || 5;

let ejecutorGlobal = null;

function crearProcesadorResiduos() {
  let datosMasivos = new Array(ELEMENTOS).fill("DATA_CRITICA");
  let copiaAnterior = ejecutorGlobal;

  let funcionRetenida = function () {
    if (datosMasivos) {
      console.log("Referencia activa a datos masivos");
    }
  };
  funcionRetenida();      // se usa una vez...
  datosMasivos = null;    // ...y se corta la referencia al Array dentro del Context compartido

  ejecutorGlobal = function () {
    console.log("Ejecutando proceso liviano...");
    if (copiaAnterior) {
      copiaAnterior();
    }
  };
}

let ejecuciones = 0;
const temporizador = setInterval(() => {
  crearProcesadorResiduos();
  ejecuciones++;
  if (global.gc) global.gc();
  console.log(`Ejecución ${ejecuciones} | Heap usado tras GC: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`);
  if (ejecuciones >= ITERACIONES) {
    clearInterval(temporizador);
    console.log("Fin: el Heap se mantiene estable porque los Array ya no son alcanzables.");
  }
}, 1000);
