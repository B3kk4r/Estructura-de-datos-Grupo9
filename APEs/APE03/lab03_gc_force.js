// Simula la llegada masiva de datos satelitales que se acumulan sin límite
// en historialSatelitalGlobal. Cada 100 paquetes se fuerza el Garbage Collector
// (que se ejecuta con --expose-gc), pero no libera memoria, ya que el arreglo es
// global y sigue siendo alcanzable desde la raíz, por lo que el GC marca todos
// los paquetes como si estuvieran en uso y no puede eliminarlos. 
// Como resultado la memoria sigue creciendo con cada paquete, S(n) = O(n).
const { performance } = require('perf_hooks');

const historialSatelitalGlobal = []; 
console.log("[Auditoría] Iniciando simulación de Memory Leak...");

function procesarCoordenada() {
    const paquete = {
        timestamp: Date.now(),
        lat: Math.random() * 90,
        lng: Math.random() * 180,
        payload: new Array(100000).fill('datos_topograficos_basura') 
    };
    historialSatelitalGlobal.push(paquete);
}

for (let i = 1; i <= 500; i++) {
    procesarCoordenada();

    // Añada esto dentro de su ciclo iterativo, después del push al historial
    if (i % 100 === 0) {
        // Si global.gc está expuesto, lo forzamos a limpiar
        if (global.gc) {
            global.gc(); // Ejecutamos el barrido manual
        }
        const memoryUsed = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        console.log(`Iteración ${i} | RAM post-GC: ${memoryUsed} MB`);
        
    }
}
console.log(`[Auditoría] Finalizado. El arreglo retiene ${historialSatelitalGlobal.length} registros en el Heap.`);
