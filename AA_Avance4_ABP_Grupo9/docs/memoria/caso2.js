
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

function construirGrafoCiclico() {
  const nodoA = new NodoGrafo("A");
  const nodoB = new NodoGrafo("B");
  const nodoC = new NodoGrafo("C");


  nodoA.conectarCon(nodoB);
  nodoB.conectarCon(nodoC);
  nodoC.conectarCon(nodoA);

  gestorCache.set(nodoA.id, nodoA);
  return nodoA.id;
}

const idRaiz = construirGrafoCiclico();


gestorCache.delete(idRaiz);
