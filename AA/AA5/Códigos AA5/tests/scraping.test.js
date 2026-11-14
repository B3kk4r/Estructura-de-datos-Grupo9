const { test, describe, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const { ScrapingBot, parsearTablaHTML } = require('../src/scraping/ScrapingBot');
const { robotsPermite } = require('../src/scraping/robots');
const { generarRegistrosSimulados } = require('../src/scraping/fuenteSimulada');

const HTML = `<table><tr><th>Producto</th></tr>
<tr><td>Tomate Riñón</td><td>Feria A</td><td>$1,25</td><td>2026-10-20</td></tr>
<tr><td>Papa</td><td>Feria B</td><td>0.45</td><td></td></tr></table>`;

describe('fuente simulada', () => {
  test('es reproducible con la misma semilla y distinta con otra', () => {
    const a = generarRegistrosSimulados({ cantidad: 50, semilla: 3, ruido: 0.2 });
    const b = generarRegistrosSimulados({ cantidad: 50, semilla: 3, ruido: 0.2 });
    const c = generarRegistrosSimulados({ cantidad: 50, semilla: 4, ruido: 0.2 });
    assert.deepEqual(a, b);
    assert.notDeepEqual(a, c);
  });

  test('genera la cantidad pedida y el catálogo de productos indicado', () => {
    const datos = generarRegistrosSimulados({ cantidad: 2000, productosDistintos: 100, semilla: 1 });
    assert.equal(datos.length, 2000);
    assert.ok(new Set(datos.map((d) => d.producto)).size <= 100);
  });
});

describe('parseo HTML y robots.txt', () => {
  test('parsearTablaHTML ignora encabezados y mapea columnas', () => {
    const filas = parsearTablaHTML(HTML);
    assert.equal(filas.length, 2);
    assert.deepEqual(filas[0], { producto: 'Tomate Riñón', feria: 'Feria A', precio: '$1,25', fecha: '2026-10-20' });
  });

  test('robotsPermite aplica Disallow/Allow y el grupo del bot', () => {
    const robots = 'User-agent: *\nDisallow: /privado\nAllow: /privado/publico\n\nUser-agent: GreenBST-ScraperBot\nDisallow: /precios/borrador';
    const ua = 'GreenBST-ScraperBot/1.0 (UNL)';
    assert.equal(robotsPermite(robots, ua, '/precios'), true);
    assert.equal(robotsPermite(robots, ua, '/precios/borrador/1'), false);
    assert.equal(robotsPermite(robots, ua, '/privado'), true);           // el grupo específico reemplaza a '*'
    assert.equal(robotsPermite(robots, 'OtroBot/1', '/privado/x'), false);
    assert.equal(robotsPermite(robots, 'OtroBot/1', '/privado/publico/x'), true);
    assert.equal(robotsPermite('User-agent: *\nDisallow:', ua, '/lo-que-sea'), true);
  });
});

describe('ScrapingBot', () => {
  test('procesa el HTML de ejemplo: limpia y descarta incompletos', async () => {
    const bot = new ScrapingBot({ fuente: { tipo: 'html', ruta: path.join(__dirname, '..', 'datos', 'ferias_loja_ejemplo.html') }, fechaExtraccion: '2026-10-24' });
    const { validos, descartados, errores } = await bot.procesar();
    assert.equal(errores.length, 0);
    assert.equal(validos.length, 4);
    assert.equal(descartados.length, 2);
    assert.deepEqual(validos.map((r) => r.producto), ['tomate rinon', 'papa chola', 'cebolla colorada', 'platano verde']);
    assert.equal(validos[3].fecha, '2026-10-24');
  });

  test('falla de forma controlada: archivo inexistente, JSON inválido y tipo desconocido', async () => {
    for (const fuente of [{ tipo: 'html', ruta: '/no/existe.html' }, { tipo: 'json', ruta: __filename }, { tipo: 'ftp' }]) {
      const { registros, errores } = await new ScrapingBot({ fuente }).extraer();
      assert.deepEqual(registros, []);
      assert.equal(errores.length, 1);
    }
  });

  test('falla de forma controlada ante un servidor caído', async () => {
    const bot = new ScrapingBot({ fuente: { tipo: 'http', urls: ['http://127.0.0.1:9/precios'] }, timeoutMs: 1500, retardoMs: 0 });
    const { registros, errores } = await bot.extraer();
    assert.deepEqual(registros, []);
    assert.ok(errores.length >= 1);
  });

  describe('contra un servidor local', () => {
    const visitas = [];
    const servidor = http.createServer((req, res) => {
      visitas.push({ ruta: req.url, userAgent: req.headers['user-agent'], t: Date.now() });
      if (req.url === '/robots.txt') { res.end('User-agent: *\nDisallow: /privado'); return; }
      if (req.url === '/precios') { res.setHeader('Content-Type', 'text/html'); res.end(HTML); return; }
      res.statusCode = 404; res.end();
    });
    const listo = new Promise((resolver) => servidor.listen(0, '127.0.0.1', resolver));
    after(() => servidor.close());

    test('respeta robots.txt, se identifica con User-Agent y limita la tasa', async () => {
      await listo;
      const base = `http://127.0.0.1:${servidor.address().port}`;
      const bot = new ScrapingBot({ fuente: { tipo: 'http', urls: [`${base}/precios`, `${base}/privado/datos`, `${base}/precios`] }, retardoMs: 120 });
      const { registros, errores } = await bot.extraer();

      assert.equal(registros.length, 4);                                  // 2 filas × 2 páginas permitidas
      assert.equal(errores.length, 1);
      assert.match(errores[0], /robots\.txt no permite/);
      assert.ok(!visitas.some((v) => v.ruta.startsWith('/privado')));      // nunca se pidió la ruta prohibida
      assert.ok(visitas.every((v) => /GreenBST-ScraperBot/.test(v.userAgent)));
      const paginas = visitas.filter((v) => v.ruta === '/precios');
      assert.ok(paginas[1].t - paginas[0].t >= 100, 'debe esperar entre peticiones');
    });
  });
});
