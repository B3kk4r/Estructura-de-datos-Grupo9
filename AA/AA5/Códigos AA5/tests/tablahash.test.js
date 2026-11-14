const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const TablaHash = require('../src/estructuras/TablaHash');
const ArregloLineal = require('../src/estructuras/ArregloLineal');

const reg = (producto, feria, precio = 1) => ({ producto, feria, precio, fecha: '2026-10-07' });

describe('TablaHash por feria', () => {
  test('indexa y recupera los registros de cada feria', () => {
    const t = new TablaHash();
    t.indexarPorFeria(reg('papa', 'Feria de Las Pitas'));
    t.indexarPorFeria(reg('yuca', 'Feria de Las Pitas'));
    t.indexarPorFeria(reg('papa', 'Feria Orillas del Zamora'));
    assert.equal(t.buscarPorFeria('Feria de Las Pitas').length, 2);
    assert.equal(t.buscarPorFeria('Feria Orillas del Zamora').length, 1);
    assert.deepEqual(t.buscarPorFeria('Feria inexistente'), []);
    assert.equal(t.cantidadFerias, 2);
    assert.equal(t.cantidadRegistros, 3);
  });

  test('se redimensiona y conserva todos los registros (500 ferias)', () => {
    const t = new TablaHash(4);
    for (let i = 0; i < 500; i++) t.indexarPorFeria(reg('papa', `Feria ${i}`));
    assert.ok(t.capacidad > 4);
    assert.equal(t.cantidadFerias, 500);
    assert.equal(t.obtenerRegistros().length, 500);
    for (let i = 0; i < 500; i++) assert.equal(t.buscarPorFeria(`Feria ${i}`).length, 1);
    assert.equal(new Set(t.ferias()).size, 500);
  });

  test('rechaza registros sin feria', () => {
    assert.throws(() => new TablaHash().indexarPorFeria({ producto: 'papa' }), TypeError);
  });
});

describe('ArregloLineal de referencia', () => {
  test('devuelve todos los registros del producto, con filtro opcional por feria', () => {
    const a = new ArregloLineal();
    a.insertar(reg('papa', 'A')); a.insertar(reg('yuca', 'A')); a.insertar(reg('papa', 'B'));
    assert.equal(a.buscar('papa').length, 2);
    assert.equal(a.buscar('papa', 'B').length, 1);
    assert.deepEqual(a.buscar('quinua'), []);
    assert.equal(a.tamano, 3);
  });
});
