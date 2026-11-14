
let ejecutorGlobal = null;

function procesarDatosMasivos() {
  const datosMasivos = new Array(10 * 1024 * 1024).fill("DATA_CRITICA");
  console.log("Procesando", datosMasivos.length, "elementos");
 
}

function crearProcesadorResiduos() {
  procesarDatosMasivos();

  ejecutorGlobal = function () {
    console.log("Ejecutando proceso liviano...");
  };
}

setInterval(() => {
  crearProcesadorResiduos();
  console.log(`Heap usado: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`);
}, 1000);
