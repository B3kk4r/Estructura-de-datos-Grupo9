
const ELEMENTOS = Number(process.argv[2]) || 10 * 1024 * 1024;
const ITERACIONES = Number(process.argv[3]) || 5;

let ejecutorGlobal = null;

function crearProcesadorResiduos() {
  // Asignación de 10 MB (o los elementos indicados) en el Heap
  let datosMasivos = new Array(ELEMENTOS).fill("DATA_CRITICA");
  let copiaAnterior = ejecutorGlobal;

  // Función interna 1: NUNCA se invoca directamente, pero utiliza datosMasivos
  let funcionRetenida = function () {
    if (datosMasivos) {
      console.log("Referencia activa a datos masivos");
    }
  };

  // Función interna 2: Sobrevive asignándose a la variable global
  ejecutorGlobal = function () {
    console.log("Ejecutando proceso liviano...");
    if (copiaAnterior) {
      copiaAnterior();
    }
  };
}

// Simulación de llamadas repetidas
let ejecuciones = 0;
const temporizador = setInterval(() => {
  crearProcesadorResiduos();
  ejecuciones++;
  console.log(`Ejecución ${ejecuciones} | Heap usado: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`);
  if (ejecuciones >= ITERACIONES) {
    clearInterval(temporizador);
    console.log("Fin de la simulación: el Heap solo crece, el GC no libera ningún Array.");
  }
}, 1000);
