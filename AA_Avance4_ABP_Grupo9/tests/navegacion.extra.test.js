// Pruebas COMPLEMENTARIAS (no sustituyen a las 5 oficiales de navegacion.test.js)
const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const ListaDobleNavegacion = require('../src/models/ListaDobleNavegacion');

const ids = (lista) => [...lista].map((d) => d.id);

describe('Pruebas complementarias - extremos, integridad de enlaces y memoria', () => {
  let lista;

  beforeEach(() => {
    lista = new ListaDobleNavegacion();
    [101, 102, 103].forEach((id) => lista.insertar({ id }));
  });

  test('6. Eliminar la cabeza: cabeza y cursor pasan al siguiente', () => {
    assert.equal(lista.eliminarActual(), true);
    assert.equal(lista.cabeza.dato.id, 102);
    assert.equal(lista.cabeza.anterior, null);
    assert.equal(lista.obtenerActual().id, 102);
    assert.deepEqual(ids(lista), [102, 103]);
  });

  test('7. Eliminar la cola: cola y cursor pasan al anterior', () => {
    lista.irAlFinal();
    assert.equal(lista.eliminarActual(), true);
    assert.equal(lista.cola.dato.id, 102);
    assert.equal(lista.cola.siguiente, null);
    assert.equal(lista.obtenerActual().id, 102);
    assert.deepEqual(ids(lista), [101, 102]);
  });

  test('8. Eliminar el único nodo deja la lista vacía y consistente', () => {
    const unica = new ListaDobleNavegacion();
    unica.insertar({ id: 1 });
    assert.equal(unica.eliminarActual(), true);
    assert.equal(unica.cabeza, null);
    assert.equal(unica.cola, null);
    assert.equal(unica.obtenerActual(), null);
    assert.equal(unica.longitud, 0);
    assert.equal(unica.estaVacia(), true);
  });

  test('9. Reutilización: se puede insertar de nuevo tras vaciar con eliminarActual', () => {
    while (lista.eliminarActual()) { /* vacía la lista */ }
    assert.equal(lista.longitud, 0);
    lista.insertar({ id: 999 });
    assert.equal(lista.obtenerActual().id, 999);
    assert.equal(lista.cabeza, lista.cola);
  });

  test('10. Memoria: el nodo eliminado queda desvinculado (sin referencias)', () => {
    const nodo = lista.cabeza.siguiente; // nodo 102
    lista.avanzar();
    lista.eliminarActual();
    assert.equal(nodo.siguiente, null);
    assert.equal(nodo.anterior, null);
  });

  test('11. irAlInicio / irAlFinal reposicionan el cursor en O(1)', () => {
    assert.equal(lista.irAlFinal().id, 103);
    assert.equal(lista.irAlInicio().id, 101);
  });

  test('12. vaciar() desvincula todos los nodos y reinicia la estructura', () => {
    const primero = lista.cabeza;
    const segundo = primero.siguiente;
    lista.vaciar();
    assert.equal(lista.longitud, 0);
    assert.equal(lista.cabeza, null);
    assert.equal(lista.cola, null);
    assert.equal(lista.obtenerActual(), null);
    assert.equal(primero.siguiente, null);
    assert.equal(segundo.anterior, null);
  });

  test('13. Integridad bidireccional: recorrer ida y vuelta devuelve la misma secuencia', () => {
    const ida = ids(lista);
    const vuelta = [];
    for (let n = lista.cola; n; n = n.anterior) vuelta.unshift(n.dato.id);
    assert.deepEqual(vuelta, ida);
  });
});
