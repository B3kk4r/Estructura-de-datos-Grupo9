const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { normalizarProducto, convertirPrecio, normalizarFecha, limpiarRegistro, validarRegistros } = require('../src/scraping/limpieza');

describe('limpieza de datos (RF-3)', () => {
  test('normalizarProducto: minúsculas, sin tildes y sin espacios sobrantes', () => {
    assert.equal(normalizarProducto('  Tomate   Riñón '), 'tomate rinon');
    assert.equal(normalizarProducto('PLÁTANO Verde'), 'platano verde');
    assert.equal(normalizarProducto(null), '');
  });

  test('convertirPrecio: distintos formatos', () => {
    assert.equal(convertirPrecio('$1,25'), 1.25);
    assert.equal(convertirPrecio('1.25 USD'), 1.25);
    assert.equal(convertirPrecio('0,8'), 0.8);
    assert.equal(convertirPrecio('1.250,50'), 1250.5);
    assert.equal(convertirPrecio('1,250.50'), 1250.5);
    assert.equal(convertirPrecio('1,250'), 1250);
    assert.equal(convertirPrecio(2), 2);
    assert.ok(Number.isNaN(convertirPrecio('gratis')));
    assert.ok(Number.isNaN(convertirPrecio('')));
  });

  test('normalizarFecha: ISO, DD/MM/AAAA e inválidas', () => {
    assert.equal(normalizarFecha('2026-10-20'), '2026-10-20');
    assert.equal(normalizarFecha('21/10/2026'), '2026-10-21');
    assert.equal(normalizarFecha('31/02/2026'), null);
    assert.equal(normalizarFecha('ayer'), null);
  });

  test('limpiarRegistro usa la fecha de extracción si falta la fecha', () => {
    const r = limpiarRegistro({ producto: 'Yuca', feria: ' Feria A ', precio: '$0,50', fecha: '' }, '2026-10-24');
    assert.deepEqual(r, { producto: 'yuca', feria: 'Feria A', precio: 0.5, fecha: '2026-10-24' });
  });

  test('validarRegistros descarta los incompletos', () => {
    const crudos = [
      { producto: 'Papa', feria: 'A', precio: '0,45', fecha: '2026-10-01' },
      { producto: 'Yuca', feria: 'A', precio: '', fecha: '2026-10-01' },
      { producto: 'Ajo', feria: '', precio: '1', fecha: '2026-10-01' },
      { producto: '', feria: 'A', precio: '1', fecha: '2026-10-01' },
      { producto: 'Col', feria: 'A', precio: '0', fecha: '2026-10-01' },
      { producto: 'Col', feria: 'A', precio: '1', fecha: '31/02/2026' },
    ].map((c) => limpiarRegistro(c, '2026-10-24'));
    const { validos, descartados } = validarRegistros(crudos);
    assert.equal(validos.length, 1);
    assert.equal(descartados.length, 5);
    assert.equal(validos[0].producto, 'papa');
  });
});
