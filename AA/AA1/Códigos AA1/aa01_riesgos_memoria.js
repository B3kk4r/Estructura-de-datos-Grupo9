
const { PerformanceObserver } = require('perf_hooks');

const heapMB = () => Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
const gc = () => { if (global.gc) global.gc(); };


const cacheGlobal = [];             

function registrarConsulta(i) {
  cacheGlobal.push({ id: i, resultado: new Array(50000).fill('precio') });
}

console.log('1) Fuga de memoria (cacheGlobal conserva todas las consultas):');
gc();
console.log(`  Heap inicial: ${heapMB()} MB`);
for (let i = 1; i <= 200; i++) {
  registrarConsulta(i);
  if (i % 50 === 0) { gc(); console.log(`  consulta ${String(i).padStart(3)} → Heap tras GC: ${heapMB()} MB`); }
}

// ---------- 2. Corrección ----------
console.log('\n2) Corrección: se corta la referencia (cacheGlobal.length = 0):');
cacheGlobal.length = 0;
gc();
console.log(`  Heap tras liberar y forzar GC: ${heapMB()} MB`);

// ---------- 3. Pausas por Garbage Collection ----------
const pausas = [];
const observador = new PerformanceObserver((lista) => {
  for (const entrada of lista.getEntries()) pausas.push(entrada.duration);
});
observador.observe({ entryTypes: ['gc'] });

console.log('\n3) Presión sobre el Heap con muchos objetos efímeros:');
const retenidos = new Array(1000);   
let suma = 0;
for (let i = 0; i < 3_000_000; i++) {
  const efimero = { x: i, y: [i, i + 1] };   // objetos de vida corta (New Space)
  retenidos[i % 1000] = efimero;
  suma += efimero.y[1];
}

// Las entradas 'gc' se entregan de forma asíncrona: se espera un instante antes de leerlas.
setTimeout(() => {
  observador.disconnect();
  const total = pausas.reduce((acc, p) => acc + p, 0);
  const maxima = pausas.length ? Math.max(...pausas) : 0;
  console.log(`  Ciclos de GC: ${pausas.length} | pausa total: ${total.toFixed(2)} ms | pausa máxima: ${maxima.toFixed(2)} ms`);
  console.log(`  (suma de control: ${suma})`);
}, 100);
