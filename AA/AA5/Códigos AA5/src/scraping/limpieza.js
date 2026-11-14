/**
 * Limpieza básica de datos extraídos (RF-3):
 * precio a número, nombre del producto en minúsculas y sin tildes, descarte de registros incompletos.
 */

/** "Tomate Riñón " → "tomate rinon" */
function normalizarProducto(texto) {
  if (texto === null || texto === undefined) return '';
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // elimina tildes y diacríticos
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Convierte "$1,25", "1.25 USD", "1.250,50" o 1.25 a número con 2 decimales.
 * Un punto es siempre decimal; una coma es decimal si es la única y le siguen 1-2 dígitos.
 * @returns {number} NaN si no se puede interpretar.
 */
function convertirPrecio(valor) {
  if (typeof valor === 'number') return Number.isFinite(valor) ? Math.round(valor * 100) / 100 : NaN;
  if (typeof valor !== 'string') return NaN;

  let s = valor.replace(/[^\d.,]/g, '');
  if (s === '') return NaN;

  const tienePunto = s.includes('.');
  const tieneComa = s.includes(',');
  if (tienePunto && tieneComa) {
    const decimal = s.lastIndexOf('.') > s.lastIndexOf(',') ? '.' : ',';
    const miles = decimal === '.' ? ',' : '.';
    s = s.split(miles).join('').replace(decimal, '.');
  } else if (tieneComa) {
    s = /^\d+,\d{1,2}$/.test(s) ? s.replace(',', '.') : s.split(',').join('');
  }
  const numero = Number(s);
  return Number.isFinite(numero) ? Math.round(numero * 100) / 100 : NaN;
}

/** Acepta AAAA-MM-DD, DD/MM/AAAA o Date; devuelve AAAA-MM-DD o null si es inválida. */
function normalizarFecha(valor) {
  if (valor instanceof Date) return Number.isNaN(valor.getTime()) ? null : valor.toISOString().slice(0, 10);
  const s = String(valor).trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return esFechaReal(+m[1], +m[2], +m[3]) ? `${m[1]}-${m[2]}-${m[3]}` : null;
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (m) {
    const [d, mes, anio] = [+m[1], +m[2], +m[3]];
    return esFechaReal(anio, mes, d) ? `${anio}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}` : null;
  }
  return null;
}

function esFechaReal(anio, mes, dia) {
  const f = new Date(Date.UTC(anio, mes - 1, dia));
  return f.getUTCFullYear() === anio && f.getUTCMonth() === mes - 1 && f.getUTCDate() === dia;
}

const vacio = (v) => v === null || v === undefined || String(v).trim() === '';

/**
 * Limpia un registro crudo. Los campos que no se pueden interpretar quedan en null
 * para que validar() los descarte. Si falta la fecha se usa la fecha de extracción.
 */
function limpiarRegistro(crudo, fechaExtraccion) {
  return {
    producto: vacio(crudo?.producto) ? null : normalizarProducto(crudo.producto) || null,
    feria: vacio(crudo?.feria) ? null : String(crudo.feria).replace(/\s+/g, ' ').trim(),
    precio: vacio(crudo?.precio) ? null : convertirPrecio(crudo.precio),
    fecha: vacio(crudo?.fecha) ? fechaExtraccion : normalizarFecha(crudo.fecha),
  };
}

/** Un registro es completo si tiene producto, feria, precio numérico positivo y fecha. */
function esCompleto(r) {
  return Boolean(r.producto) && Boolean(r.feria) && typeof r.precio === 'number' && Number.isFinite(r.precio) && r.precio > 0 && Boolean(r.fecha);
}

/** Separa los registros válidos de los descartados. */
function validarRegistros(registros) {
  const validos = [];
  const descartados = [];
  for (const r of registros) (esCompleto(r) ? validos : descartados).push(r);
  return { validos, descartados };
}

module.exports = { normalizarProducto, convertirPrecio, normalizarFecha, limpiarRegistro, esCompleto, validarRegistros };
