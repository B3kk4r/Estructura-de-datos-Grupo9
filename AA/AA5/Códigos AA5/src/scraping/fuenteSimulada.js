/**
 * Fuente simulada y reproducible (RF-2, RF-9): permite trabajar y medir aunque el sitio
 * real de las ferias de Loja no esté disponible, con tantos registros como se necesite.
 * Con la misma semilla se obtienen siempre los mismos datos (RNF-4).
 */

/** Generador pseudoaleatorio determinista (mulberry32). */
function crearPRNG(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BASES = ['tomate riñón', 'papa chola', 'cebolla colorada', 'cebolla blanca', 'zanahoria amarilla', 'col', 'lechuga',
  'yuca', 'plátano verde', 'plátano maduro', 'choclo', 'arveja', 'fréjol', 'aguacate', 'limón', 'naranja', 'babaco',
  'tomate de árbol', 'mora', 'cilantro', 'pimiento', 'ajo', 'remolacha', 'brócoli'];
const VARIEDADES = ['primera', 'segunda', 'criolla', 'orgánica', 'mediana', 'grande'];
const PRESENTACIONES = ['libra', 'kilo', 'arroba', 'quintal', 'atado', 'saco', 'caja'];
const FERIAS = ['Feria Centro Comercial Loja', 'Feria de Las Pitas', 'Feria Orillas del Zamora', 'Mercado Mayorista de Loja'];

/** Catálogo de `m` productos distintos (con tildes y mayúsculas, como llegarían del sitio). */
function generarCatalogo(m) {
  const catalogo = [];
  for (let i = 0; i < m; i++) {
    const base = BASES[i % BASES.length];
    const variedad = VARIEDADES[Math.floor(i / BASES.length) % VARIEDADES.length];
    const presentacion = PRESENTACIONES[Math.floor(i / (BASES.length * VARIEDADES.length)) % PRESENTACIONES.length];
    const lote = Math.floor(i / (BASES.length * VARIEDADES.length * PRESENTACIONES.length));
    const nombre = `${base} ${variedad} por ${presentacion}${lote > 0 ? ` lote ${lote}` : ''}`;
    catalogo.push(nombre.replace(/^./, (c) => c.toUpperCase()));
  }
  return catalogo;
}

/**
 * Genera registros crudos { producto, feria, precio, fecha }.
 * @param {object} opciones
 * @param {number} opciones.cantidad - Registros a generar.
 * @param {number} [opciones.productosDistintos] - Tamaño del catálogo (por defecto cantidad/5).
 * @param {number} [opciones.semilla=1]
 * @param {number} [opciones.ruido=0] - Fracción (0-1) de registros "sucios" o incompletos.
 */
function generarRegistrosSimulados({ cantidad = 100, productosDistintos, semilla = 1, ruido = 0 } = {}) {
  const prng = crearPRNG(semilla);
  const m = Math.max(1, productosDistintos ?? Math.ceil(cantidad / 5));
  const catalogo = generarCatalogo(m);
  const precioBase = catalogo.map(() => 0.25 + prng() * 4);

  const registros = [];
  for (let i = 0; i < cantidad; i++) {
    const idx = Math.floor(prng() * m);
    const feria = FERIAS[Math.floor(prng() * FERIAS.length)];
    const precio = Math.round(precioBase[idx] * (0.85 + prng() * 0.3) * 100) / 100;
    const dia = String(1 + Math.floor(prng() * 28)).padStart(2, '0');
    const registro = { producto: catalogo[idx], feria, precio, fecha: `2026-10-${dia}` };

    if (prng() < ruido) {
      const tipo = Math.floor(prng() * 5);
      if (tipo === 0) registro.precio = `$${String(precio).replace('.', ',')}`;      // "$1,25"
      else if (tipo === 1) registro.precio = `${precio} USD`;                           // "1.25 USD"
      else if (tipo === 2) registro.producto = `  ${registro.producto.toUpperCase()}  `; // mayúsculas y espacios
      else if (tipo === 3) registro.precio = '';                                        // incompleto
      else registro.feria = '';                                                         // incompleto
    }
    registros.push(registro);
  }
  return registros;
}

module.exports = { crearPRNG, generarCatalogo, generarRegistrosSimulados, FERIAS };
