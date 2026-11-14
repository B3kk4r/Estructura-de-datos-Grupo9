/**
 * Lectura mínima de robots.txt (RNF-6). Soporta User-agent, Allow y Disallow por prefijo
 * (la regla más larga gana). No interpreta comodines '*' ni '$'.
 * @param {string} textoRobots - Contenido de robots.txt
 * @param {string} userAgent - p. ej. "GreenBST-ScraperBot/1.0 (...)"
 * @param {string} ruta - Ruta a consultar, p. ej. "/precios"
 */
function robotsPermite(textoRobots, userAgent, ruta) {
  const token = userAgent.split(/[\/\s]/)[0].toLowerCase();
  const grupos = [];
  let actual = null;
  let leyendoAgentes = false;

  for (const cruda of textoRobots.split(/\r?\n/)) {
    const linea = cruda.split('#')[0].trim();
    const i = linea.indexOf(':');
    if (i < 0) continue;
    const campo = linea.slice(0, i).trim().toLowerCase();
    const valor = linea.slice(i + 1).trim();

    if (campo === 'user-agent') {
      if (!leyendoAgentes) { actual = { agentes: [], reglas: [] }; grupos.push(actual); }
      actual.agentes.push(valor.toLowerCase());
      leyendoAgentes = true;
    } else if (campo === 'allow' || campo === 'disallow') {
      leyendoAgentes = false;
      if (actual && valor !== '') actual.reglas.push({ permite: campo === 'allow', ruta: valor });
    }
  }

  const especificos = grupos.filter((g) => g.agentes.some((a) => a !== '*' && token.includes(a)));
  const aplicables = especificos.length ? especificos : grupos.filter((g) => g.agentes.includes('*'));

  let mejor = null;
  for (const grupo of aplicables) {
    for (const regla of grupo.reglas) {
      if (ruta.startsWith(regla.ruta) && (!mejor || regla.ruta.length > mejor.ruta.length)) mejor = regla;
    }
  }
  return mejor ? mejor.permite : true;
}

module.exports = { robotsPermite };
