// Caso 2: ciclo A->B->C->A en un Map (CORREGIDO + verificación con WeakRef)
class NodoGrafo {
  constructor(id) {
    this.id = id;
    this.vecinos = [];
  }
  conectarCon(nodo) {
    this.vecinos.push(nodo);
  }
}

// [MOD-C2-01] gestorCache se declara ANTES de usarse (evita depender del orden).
const gestorCache = new Map(); // Map<string, NodoGrafo>: la clave es un string

let refDebil; // [MOD-C2-02] WeakRef solo para comprobar que el GC lo libera

function construirGrafoCiclico() {
  const nodoA = new NodoGrafo("A");
  const nodoB = new NodoGrafo("B");
  const nodoC = new NodoGrafo("C");

  nodoA.conectarCon(nodoB);
  nodoB.conectarCon(nodoC);
  nodoC.conectarCon(nodoA); // ciclo

  gestorCache.set(nodoA.id, nodoA);
  refDebil = new WeakRef(nodoA);
  return nodoA.id;
}

const esperar = () => new Promise((r) => setTimeout(r, 0));

(async () => {
  const idRaiz = construirGrafoCiclico();
  await esperar(); global.gc();
  console.log("Antes de delete -> A sigue vivo:", refDebil.deref() !== undefined);

  gestorCache.delete(idRaiz);
  await esperar(); global.gc();
  await esperar(); global.gc();
  console.log("Tras delete + GC -> A sigue vivo:", refDebil.deref() !== undefined);

  // WeakMap NO admite claves string:
  try { new WeakMap().set("A", {}); }
  catch (e) { console.log("WeakMap con clave string ->", e.constructor.name + ":", e.message); }
})();
