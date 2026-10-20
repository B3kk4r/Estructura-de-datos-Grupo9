const fs = require('fs');
const { performance } = require('perf_hooks');

const FILE_NAME = 'coordenadas_masivas.csv';

console.log('[Lectura por Stream] Iniciando procesamiento...');
const memoryBefore = process.memoryUsage().heapUsed;
const start = performance.now();
let totalRegistros = 0;

// Creamos un flujo de lectura secuencial no bloqueante
const readableStream = fs.createReadStream(FILE_NAME, { encoding: 'utf-8' });

readableStream.on('data', (chunk) => {
    // Procesamos el chunk de datos actual sin almacenarlo completo
    // Contamos cuántos saltos de línea hay en este fragmento
    let lineBreakCount = (chunk.match(/\n/g) || []).length;
    totalRegistros += lineBreakCount;
});

readableStream.on('end', () => {
    const end = performance.now();
    const memoryAfter = process.memoryUsage().heapUsed;

    console.log(`[Lectura por Stream] Total registros procesados: ${totalRegistros}`);
    console.log(`[Lectura por Stream] Tiempo de I/O parcializado: ${((end - start) / 1000).toFixed(2)} segundos.`);
    
    // ZONA DE SUSTENTABILIDAD (Green Computing)
    // Al mantener el consumo de RAM en O(1), evitamos saturar la memoria principal. 
    // Esto previene que el Garbage Collector trabaje en exceso liberando grandes bloques de datos, 
    // reduciendo drásticamente los ciclos de CPU y, por ende, el gasto térmico y energético del servidor.
    console.log(`[Lectura por Stream] Consumo Neto de RAM: ${((memoryAfter - memoryBefore) / 1024 / 1024).toFixed(2)} MB`);
});