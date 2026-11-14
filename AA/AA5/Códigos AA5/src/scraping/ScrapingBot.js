const fs = require('fs');
const { generarRegistrosSimulados } = require('./fuenteSimulada');
const { robotsPermite } = require('./robots');
const { limpiarRegistro, validarRegistros } = require('./limpieza');

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

const quitarEtiquetas = (html) => html
  .replace(/<[^>]*>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(+c))
  .trim();

/**
 * Extrae las filas de las tablas HTML de una página.
 * @param {string} html
 * @param {string[]} columnas - Orden de las columnas, p. ej. ['producto','feria','precio','fecha'].
 */
function parsearTablaHTML(html, columnas = ['producto', 'feria', 'precio', 'fecha']) {
  const registros = [];
  for (const fila of html.match(/<tr[\s\S]*?<\/tr>/gi) ?? []) {
    if (/<th[\s>]/i.test(fila)) continue;                              // encabezados
    const celdas = (fila.match(/<td[\s\S]*?<\/td>/gi) ?? []).map(quitarEtiquetas);
    if (celdas.length === 0) continue;
    const registro = {};
    columnas.forEach((nombre, i) => { registro[nombre] = celdas[i] ?? ''; });
    registros.push(registro);
  }
  return registros;
}

/**
 * Bot de scraping. Fuentes configurables (RF-2):
 *   { tipo: 'simulada', cantidad, productosDistintos, semilla, ruido }
 *   { tipo: 'json',     ruta }            → archivo JSON con un arreglo de registros
 *   { tipo: 'html',     ruta }            → archivo HTML local con una tabla
 *   { tipo: 'http',     urls: [...] }     → páginas web (respeta robots.txt y limita la tasa)
 *
 * Falla de forma controlada (RNF-5): extraer() nunca lanza; devuelve { registros, errores }.
 */
class ScrapingBot {
  constructor(opciones = {}) {
    this.fuente = opciones.fuente ?? { tipo: 'simulada', cantidad: 100 };
    this.userAgent = opciones.userAgent ?? 'GreenBST-ScraperBot/1.0 (Universidad Nacional de Loja; Grupo 09; uso academico)';
    this.retardoMs = opciones.retardoMs ?? 1000;          // rate limiting entre peticiones (RNF-6)
    this.respetarRobots = opciones.respetarRobots ?? true;
    this.timeoutMs = opciones.timeoutMs ?? 8000;
    this.columnas = opciones.columnas ?? ['producto', 'feria', 'precio', 'fecha'];
    this.fechaExtraccion = opciones.fechaExtraccion ?? new Date().toISOString().slice(0, 10);
  }

  /** @returns {Promise<{registros:Array, errores:string[]}>} datos crudos tal como se extrajeron. */
  async extraer() {
    const errores = [];
    let registros = [];
    try {
      switch (this.fuente.tipo) {
        case 'simulada': registros = generarRegistrosSimulados(this.fuente); break;
        case 'json': {
          const datos = JSON.parse(fs.readFileSync(this.fuente.ruta, 'utf8'));
          if (!Array.isArray(datos)) throw new Error('El JSON debe contener un arreglo de registros');
          registros = datos;
          break;
        }
        case 'html': registros = parsearTablaHTML(fs.readFileSync(this.fuente.ruta, 'utf8'), this.columnas); break;
        case 'http': registros = await this.#extraerHttp(this.fuente.urls ?? [this.fuente.url], errores); break;
        default: throw new Error(`Tipo de fuente no soportado: ${this.fuente.tipo}`);
      }
    } catch (error) {
      errores.push(error.message);
      registros = [];
    }
    return { registros, errores };
  }

  /** Normaliza producto, precio, feria y fecha de cada registro crudo (RF-3). */
  limpiar(crudos) {
    return crudos.map((crudo) => limpiarRegistro(crudo, this.fechaExtraccion));
  }

  /** Descarta los registros incompletos o inválidos (RF-3). */
  validar(registros) {
    return validarRegistros(registros);
  }

  /** Atajo: extraer → limpiar → validar. */
  async procesar() {
    const { registros, errores } = await this.extraer();
    const { validos, descartados } = this.validar(this.limpiar(registros));
    return { validos, descartados, errores };
  }

  async #extraerHttp(urls, errores) {
    const registros = [];
    const robotsPorOrigen = new Map();
    let primera = true;

    for (const url of urls) {
      try {
        const destino = new URL(url);
        if (this.respetarRobots && !(await this.#permitido(destino, robotsPorOrigen))) {
          errores.push(`robots.txt no permite acceder a ${url}`);
          continue;
        }
        if (!primera) await esperar(this.retardoMs);
        primera = false;

        const respuesta = await fetch(url, {
          headers: { 'User-Agent': this.userAgent, Accept: 'text/html' },
          signal: AbortSignal.timeout(this.timeoutMs),
        });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        registros.push(...parsearTablaHTML(await respuesta.text(), this.columnas));
      } catch (error) {
        errores.push(`${url}: ${error.message}`);
      }
    }
    return registros;
  }

  async #permitido(destino, cache) {
    if (!cache.has(destino.origin)) {
      try {
        const respuesta = await fetch(`${destino.origin}/robots.txt`, {
          headers: { 'User-Agent': this.userAgent },
          signal: AbortSignal.timeout(this.timeoutMs),
        });
        if (respuesta.status >= 500) throw new Error(`HTTP ${respuesta.status}`);
        cache.set(destino.origin, respuesta.ok ? await respuesta.text() : ''); // 404: sin restricciones
      } catch {
        cache.set(destino.origin, null);                                         // sin robots.txt legible: no se scrapea
      }
    }
    const texto = cache.get(destino.origin);
    return texto === null ? false : robotsPermite(texto, this.userAgent, destino.pathname);
  }
}

module.exports = { ScrapingBot, parsearTablaHTML };
