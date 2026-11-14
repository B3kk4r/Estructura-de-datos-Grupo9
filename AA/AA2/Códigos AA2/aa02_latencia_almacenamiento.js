
const fs = require('fs');
const os = require('os');
const path = require('path');
const { performance } = require('perf_hooks');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aa2-'));
const medir = (fn) => { const t0 = performance.now(); const r = fn(); return { ms: performance.now() - t0, r }; };
const fmt = (ms) => `${ms.toFixed(2)} ms`;

// ---------- 1. Disco vs memoria (caché) ----------
const PRODUCTOS = 2000;
const catalogo = Array.from({ length: PRODUCTOS }, (_, i) => ({ id: i, nombre: `producto_${i}`, precio: +(Math.random() * 10).toFixed(2) }));
const archivo = path.join(dir, 'catalogo.json');
fs.writeFileSync(archivo, JSON.stringify(catalogo));

const CONSULTAS = 300;
const PRODUCTOS_FRECUENTES = 20;   // los clientes consultan una y otra vez los mismos productos
const leerDeDisco = () => {
  let acumulado = 0;
  for (let i = 0; i < CONSULTAS; i++) {
    const datos = JSON.parse(fs.readFileSync(archivo, 'utf8'));      // cada consulta va al disco
    acumulado += datos[i % PRODUCTOS_FRECUENTES].precio;
  }
  return acumulado;
};

const cache = new Map();
const leerConCache = () => {
  let acumulado = 0;
  for (let i = 0; i < CONSULTAS; i++) {
    const clave = i % PRODUCTOS_FRECUENTES;
    if (!cache.has(clave)) cache.set(clave, JSON.parse(fs.readFileSync(archivo, 'utf8'))[clave]); // solo la 1.ª vez
    acumulado += cache.get(clave).precio;
  }
  return acumulado;
};

console.log(`1) ${CONSULTAS} consultas sobre ${PRODUCTOS_FRECUENTES} productos frecuentes`);
const disco = medir(leerDeDisco);
const memoria = medir(leerConCache);
console.log(`   Leyendo del disco en cada consulta : ${fmt(disco.ms)}`);
console.log(`   Con caché en memoria (Map)         : ${fmt(memoria.ms)}  → ${(disco.ms / memoria.ms).toFixed(1)}x más rápido`);

// ---------- 2. Índice vs búsqueda lineal ----------
const N = 200000;
const registros = Array.from({ length: N }, (_, i) => ({ id: i, nombre: `producto_${i}` }));
const indice = new Map(registros.map((r) => [r.nombre, r]));
const BUSQUEDAS = 200;
const objetivos = Array.from({ length: BUSQUEDAS }, (_, i) => `producto_${N - 1 - i * 7}`);

const lineal = medir(() => objetivos.map((n) => registros.find((r) => r.nombre === n)));
const indexado = medir(() => objetivos.map((n) => indice.get(n)));
console.log(`\n2) ${BUSQUEDAS} búsquedas en ${N.toLocaleString()} registros`);
console.log(`   Búsqueda lineal O(n) : ${fmt(lineal.ms)}`);
console.log(`   Índice (Map) O(1)    : ${fmt(indexado.ms)}`);

// ---------- 3. Agrupar operaciones de E/S ----------
const ESCRITURAS = 1000;
const individuales = medir(() => {
  for (let i = 0; i < ESCRITURAS; i++) fs.writeFileSync(path.join(dir, `ind_${i}.txt`), `registro ${i}\n`);
});
const agrupadas = medir(() => {
  const lote = Array.from({ length: ESCRITURAS }, (_, i) => `registro ${i}`).join('\n');
  fs.writeFileSync(path.join(dir, 'lote.txt'), lote);
});
console.log(`\n3) ${ESCRITURAS} escrituras`);
console.log(`   ${ESCRITURAS} archivos individuales   : ${fmt(individuales.ms)}`);
console.log(`   1 escritura agrupada (lote): ${fmt(agrupadas.ms)}`);

fs.rmSync(dir, { recursive: true, force: true });
