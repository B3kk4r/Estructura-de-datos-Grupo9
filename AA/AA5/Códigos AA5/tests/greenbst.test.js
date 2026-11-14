const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const GreenBST = require('../src/estructuras/GreenBST');
const { crearPRNG } = require('../src/scraping/fuenteSimulada');

const reg = (producto, feria = 'Feria A', precio = 1) => ({ producto, feria, precio, fecha: '2026-10-07' });
const arbolCon = (...productos) => { const a = new GreenBST(); productos.forEach((p) => a.insertar(reg(p))); return a; };

describe('GreenBST - rotaciones', () => {
  test('izquierda-izquierda: rotación simple a la derecha', () => {
    const a = arbolCon('c', 'b', 'a');
    assert.equal(a.raiz.clave, 'b');
    assert.equal(a.rotacionesSimples, 1);
    assert.equal(a.rotacionesDobles, 0);
    assert.ok(a.validar().valido);
  });

  test('derecha-derecha: rotación simple a la izquierda', () => {
    const a = arbolCon('a', 'b', 'c');
    assert.equal(a.raiz.clave, 'b');
    assert.equal(a.rotacionesSimples, 1);
  });

  test('izquierda-derecha: rotación doble', () => {
    const a = arbolCon('c', 'a', 'b');
    assert.equal(a.raiz.clave, 'b');
    assert.equal(a.rotacionesDobles, 1);
    assert.equal(a.rotacionesSimples, 0);
  });

  test('derecha-izquierda: rotación doble', () => {
    const a = arbolCon('a', 'c', 'b');
    assert.equal(a.raiz.clave, 'b');
    assert.equal(a.rotacionesDobles, 1);
  });

  test('inserción ordenada de 10 000 productos mantiene altura logarítmica', () => {
    const a = new GreenBST();
    for (let i = 0; i < 10000; i++) a.insertar(reg(`producto_${String(i).padStart(5, '0')}`));
    assert.ok(a.altura <= Math.ceil(1.44 * Math.log2(10002)), `altura ${a.altura}`);
    assert.ok(a.validar().valido);
  });
});

describe('GreenBST - inserción y búsqueda', () => {
  test('un mismo producto acumula sus registros en un solo nodo', () => {
    const a = new GreenBST();
    a.insertar(reg('papa', 'Feria A', 0.4));
    a.insertar(reg('papa', 'Feria B', 0.5));
    assert.equal(a.cantidadProductos, 1);
    assert.equal(a.cantidadRegistros, 2);
    assert.equal(a.buscar('papa').length, 2);
  });

  test('buscar devuelve [] si no existe y filtra por feria', () => {
    const a = new GreenBST();
    a.insertar(reg('papa', 'Feria A'));
    a.insertar(reg('papa', 'Feria B'));
    assert.deepEqual(a.buscar('quinua'), []);
    assert.equal(a.buscar('papa', 'Feria B').length, 1);
    assert.deepEqual(a.buscar('papa', 'Feria Z'), []);
  });

  test('rechaza registros sin producto', () => {
    assert.throws(() => new GreenBST().insertar({ feria: 'x' }), TypeError);
  });
});

describe('GreenBST - recorrido', () => {
  test('recorrerInorden devuelve los productos en orden alfabético', () => {
    const a = arbolCon('yuca', 'cebolla', 'papa', 'ajo', 'tomate', 'limon');
    assert.deepEqual(a.recorrerInorden().map((n) => n.producto), ['ajo', 'cebolla', 'limon', 'papa', 'tomate', 'yuca']);
  });

  test('el recorrido es iterativo: funciona con 50 000 nodos sin desbordar la pila', () => {
    const a = new GreenBST();
    for (let i = 0; i < 50000; i++) a.insertar(reg(`p${String(i).padStart(6, '0')}`));
    assert.equal(a.recorrerInorden().length, 50000);
  });
});

describe('GreenBST - eliminación', () => {
  test('elimina hoja, nodo con un hijo y nodo con dos hijos manteniendo el balance', () => {
    const a = arbolCon('m', 'f', 't', 'c', 'h', 'p', 'w', 'a');
    for (const p of ['a', 'f', 'm']) {                // hoja, un hijo / dos hijos, raíz
      assert.equal(a.eliminar(p), true);
      assert.equal(a.contiene(p), false);
      assert.deepEqual(a.validar(), { valido: true, errores: [] });
    }
    assert.equal(a.cantidadProductos, 5);
  });

  test('eliminar un producto inexistente devuelve false', () => {
    assert.equal(arbolCon('a').eliminar('z'), false);
  });

  test('los contadores restan todos los registros del producto eliminado', () => {
    const a = new GreenBST();
    a.insertar(reg('papa')); a.insertar(reg('papa')); a.insertar(reg('yuca'));
    a.eliminar('papa');
    assert.equal(a.cantidadRegistros, 1);
    assert.equal(a.cantidadProductos, 1);
  });

  test('vaciar el árbol deja una estructura válida', () => {
    const a = arbolCon('a', 'b', 'c');
    ['b', 'a', 'c'].forEach((p) => a.eliminar(p));
    assert.equal(a.raiz, null);
    assert.ok(a.validar().valido);
  });
});

describe('GreenBST - integridad (RNF-3)', () => {
  test('2000 operaciones aleatorias mantienen los invariantes y coinciden con un modelo Map', () => {
    const prng = crearPRNG(2026);
    const a = new GreenBST();
    const modelo = new Map();
    for (let i = 0; i < 2000; i++) {
      const producto = `p${Math.floor(prng() * 300)}`;
      if (prng() < 0.65) {
        a.insertar(reg(producto));
        modelo.set(producto, (modelo.get(producto) ?? 0) + 1);
      } else {
        assert.equal(a.eliminar(producto), modelo.delete(producto));
      }
      if (i % 100 === 0) assert.deepEqual(a.validar(), { valido: true, errores: [] });
    }
    assert.deepEqual(a.validar(), { valido: true, errores: [] });
    assert.equal(a.cantidadProductos, modelo.size);
    for (const [producto, cantidad] of modelo) assert.equal(a.buscar(producto).length, cantidad);
  });

  test('validar detecta un orden roto', () => {
    const a = arbolCon('b', 'a', 'c');
    a.raiz.clave = 'z';
    assert.equal(a.validar().valido, false);
  });

  test('validar detecta una altura incorrecta', () => {
    const a = arbolCon('b', 'a', 'c');
    a.raiz.altura = 7;
    const { valido, errores } = a.validar();
    assert.equal(valido, false);
    assert.match(errores[0], /Altura incorrecta/);
  });

  test('validar detecta un desbalance', () => {
    const a = arbolCon('b');
    a.raiz.der = { clave: 'c', registros: [reg('c')], altura: 2, izq: null, der: { clave: 'd', registros: [reg('d')], altura: 1, izq: null, der: null } };
    a.raiz.altura = 3;
    a.cantidadProductos = 3; a.cantidadRegistros = 3;
    assert.match(a.validar().errores.join(' '), /Desbalance/);
  });
});
