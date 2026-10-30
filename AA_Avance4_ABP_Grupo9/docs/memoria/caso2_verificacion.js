
class NodoGrafo {
  constructor(id) {
    this.id = id;
    this.vecinos = [];
  }
  conectarCon(nodo) {
    this.vecinos.push(nodo);
  }
}


const gestorCache = new Map(); 

let refDebil; 

function construirGrafoCiclico() {
  const nodoA = new NodoGrafo("A");
  const nodoB = new NodoGrafo("B");
  const nodoC = new NodoGrafo("C");

  nodoA.conectarCon(nodoB);
  nodoB.conectarCon(nodoC);
  nodoC.conectarCon(nodoA); 

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

  
  try { new WeakMap().set("A", {}); }
  catch (e) { console.log("WeakMap con clave string ->", e.constructor.name + ":", e.message); }
})();
