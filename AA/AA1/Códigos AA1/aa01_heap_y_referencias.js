
const heapMB = () => process.memoryUsage().heapUsed / 1024 / 1024;
const gc = () => { if (global.gc) global.gc(); };

// ---------- 1. Referencias ----------
console.log('1) Referencias: la variable guarda el puntero, el objeto vive en el Heap');
let a = { producto: 'tomate', precio: 1.25 };
let b = a;                // b apunta al MISMO objeto del Heap
b.precio = 1.5;
console.log('  a.precio =', a.precio, '(se modificó a través de b)');
console.log('  a === b  =', a === b);

let c = { ...a };         // copia: nuevo objeto en el Heap
c.precio = 2;
console.log('  a.precio =', a.precio, '| c.precio =', c.precio, '| a === c =', a === c);

// ---------- 2. Consumo por registro ----------
function medirRegistros(n) {
  gc();
  const antes = process.memoryUsage().heapUsed;
  const registros = [];
  for (let i = 0; i < n; i++) {
    registros.push({ producto: `producto_${i % 500}`, feria: `feria_${i % 5}`, precio: Math.random() * 10, fecha: '2026-10-07' });
  }
  const despues = process.memoryUsage().heapUsed;
  return { n, bytesPorRegistro: (despues - antes) / n, registros };
}

console.log('\n2) Consumo de Heap por registro (debe crecer de forma lineal con n):');
for (const n of [10000, 50000, 100000, 200000]) {
  const { bytesPorRegistro } = medirRegistros(n);
  console.log(`  n = ${String(n).padStart(7)} → ≈ ${bytesPorRegistro.toFixed(1)} bytes/registro`);
}

// ---------- 3. Objetos vs TypedArray ----------
const N = 1_000_000;
gc();
let base = process.memoryUsage().heapUsed + process.memoryUsage().arrayBuffers;
const objetos = Array.from({ length: N }, (_, i) => ({ valor: i }));
let uso = process.memoryUsage().heapUsed + process.memoryUsage().arrayBuffers - base;
console.log(`\n3) ${N.toLocaleString()} números como objetos { valor }: ${(uso / 1024 / 1024).toFixed(1)} MB`);

objetos.length = 0;
gc();
base = process.memoryUsage().heapUsed + process.memoryUsage().arrayBuffers;
const tipado = new Float64Array(N).map((_, i) => i);
uso = process.memoryUsage().heapUsed + process.memoryUsage().arrayBuffers - base;
console.log(`   ${N.toLocaleString()} números en Float64Array         : ${(uso / 1024 / 1024).toFixed(1)} MB`);
console.log('   (el TypedArray evita cabeceras y envoltorios por elemento)', tipado.length);
