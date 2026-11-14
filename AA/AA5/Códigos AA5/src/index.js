/**
 * Demostración del sistema (secciones de la sustentación): inserción, búsqueda,
 * recorrido y validación del GreenBST, con datos que pasan por el bot de scraping.
 *
 * Ejecución: npm start   (o: node src/index.js)
 */
const path = require('path');
const GreenBST = require('./estructuras/GreenBST');
const TablaHash = require('./estructuras/TablaHash');
const ArregloLineal = require('./estructuras/ArregloLineal');
const { ScrapingBot } = require('./scraping/ScrapingBot');

async function main() {
  // Fuente configurable: aquí un HTML local de ejemplo (puede cambiarse por 'simulada' o 'http')
  const bot = new ScrapingBot({
    fuente: { tipo: 'html', ruta: path.join(__dirname, '..', 'datos', 'ferias_loja_ejemplo.html') },
    retardoMs: 0,
    fechaExtraccion: '2026-10-24',
  });

  console.log('=== 0. Extracción y limpieza ===');
  const { validos, descartados, errores } = await bot.procesar();
  console.log(`Registros válidos: ${validos.length} | descartados por incompletos: ${descartados.length} | errores: ${errores.length}`);
  console.table(validos);

  const arbol = new GreenBST();
  const porFeria = new TablaHash();
  const arreglo = new ArregloLineal();

  console.log('\n=== 1. Inserción ===');
  for (const registro of validos) {
    arbol.insertar(registro);
    porFeria.indexarPorFeria(registro);
    arreglo.insertar(registro);
  }
  // Se amplía con más registros del mismo producto para mostrar la lista por nodo
  arbol.insertar({ producto: 'tomate rinon', feria: 'Feria Centro Comercial Loja', precio: 1.4, fecha: '2026-10-24' });
  console.log(`Productos en el árbol: ${arbol.cantidadProductos} | registros: ${arbol.cantidadRegistros} | altura: ${arbol.altura}`);

  console.log('\n=== 2. Búsqueda ===');
  console.log('buscar("tomate rinon"):', arbol.buscar('tomate rinon'));
  console.log('buscar("tomate rinon", "Feria de Las Pitas"):', arbol.buscar('tomate rinon', 'Feria de Las Pitas'));
  console.log('buscar("quinua") →', arbol.buscar('quinua'), '(sin resultados)');
  console.log('Tabla Hash, buscarPorFeria("Feria de Las Pitas"):', porFeria.buscarPorFeria('Feria de Las Pitas').map((r) => r.producto));

  console.log('\n=== 3. Recorrido (orden alfabético) ===');
  for (const { producto, registros } of arbol.recorrerInorden()) console.log(`  ${producto.padEnd(16)} ${registros.length} registro(s)`);

  console.log('\n=== 4. Eliminación y rebalanceo ===');
  console.log('eliminar("platano verde") →', arbol.eliminar('platano verde'), '| eliminar("quinua") →', arbol.eliminar('quinua'), '(no existe)');
  console.log(`Productos restantes: ${arbol.cantidadProductos} | altura: ${arbol.altura}`);

  console.log('\n=== 5. Validación de invariantes ===');
  console.log('Árbol íntegro:', arbol.validar());
  arbol.raiz.altura += 3;                       // se corrompe a propósito para comprobar que se detecta
  console.log('Tras corromper una altura:', arbol.validar());
}

main();
