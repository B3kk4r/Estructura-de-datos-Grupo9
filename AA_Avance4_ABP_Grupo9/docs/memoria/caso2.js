// Caso 2 CORREGIDO: el ciclo A -> B -> C -> A no es fuga en V8 (marcar y barrer)
class NodoGrafo {
  constructor(id) {
    this.id = id;
    this.vecinos = [];
  }

  conectarCon(nodo) {
    this.vecinos.push(nodo);
  }
}

// [MOD-C2-01] gestorCache se declara ANTES de las funciones que lo usan.
const gestorCache = new Map(); // Map<string, NodoGrafo>: la clave es un string

function construirGrafoCiclico() {
  const nodoA = new NodoGrafo("A");
  const nodoB = new NodoGrafo("B");
  const nodoC = new NodoGrafo("C");

  // Conexión circular
  nodoA.conectarCon(nodoB);
  nodoB.conectarCon(nodoC);
  nodoC.conectarCon(nodoA);

  gestorCache.set(nodoA.id, nodoA);
  return nodoA.id;
}

const idRaiz = construirGrafoCiclico();

// [MOD-C2-02] Se ejecuta el delete y se comprueba con WeakRef (ver caso2_verificacion.js)
gestorCache.delete(idRaiz);
