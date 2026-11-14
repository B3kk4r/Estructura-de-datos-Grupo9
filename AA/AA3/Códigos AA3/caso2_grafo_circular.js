
class NodoGrafo {
  constructor(id) {
    this.id = id;
    this.vecinos = [];
  }

  conectarCon(nodo) {
    this.vecinos.push(nodo);
  }
}

const esperar = (ms = 20) => new Promise((resolver) => setTimeout(resolver, ms));
const recolectar = async () => { await esperar(); global.gc(); await esperar(); };

// ---------- Parte A: gestorCache como Map (referencia fuerte) ----------
const gestorCache = new Map(); // Map: referencia fuerte a los nodos

let observadorA;
function construirGrafoCiclico() {
  let nodoA = new NodoGrafo("A");
  let nodoB = new NodoGrafo("B");
  let nodoC = new NodoGrafo("C");

  // Conexión circular
  nodoA.conectarCon(nodoB);
  nodoB.conectarCon(nodoC);
  nodoC.conectarCon(nodoA);

  observadorA = new WeakRef(nodoA);   // solo para observar, no retiene al nodo

  // Registro en un gestor centralizado
  gestorCache.set(nodoA.id, nodoA);

  return nodoA.id;
}

async function main() {
  if (!global.gc) {
    console.log("Ejecute con: node --expose-gc caso2_grafo_circular.js");
    return;
  }

  let idRaiz = construirGrafoCiclico();

  await recolectar();
  console.log("A) Map con el nodo A registrado");
  console.log("   ¿Nodo A vivo tras GC? →", observadorA.deref() !== undefined, "(el Map lo mantiene alcanzable)");

  gestorCache.delete(idRaiz);         // se destruye el ÚNICO enlace desde la raíz
  await recolectar();
  console.log("   Tras gestorCache.delete(idRaiz)");
  console.log("   ¿Nodo A vivo tras GC? →", observadorA.deref() !== undefined, "(el ciclo A→B→C→A quedó aislado y se liberó)");

  // ---------- Parte B: WeakMap (clave débil) ----------
  console.log("\nB) WeakMap: no retiene la clave (la clave debe ser un objeto, no un string)");
  const gestorDebil = new WeakMap();
  let claveRaiz = { id: "A" };
  let observadorB;
  (() => {
    const a = new NodoGrafo("A"), b = new NodoGrafo("B"), c = new NodoGrafo("C");
    a.conectarCon(b); b.conectarCon(c); c.conectarCon(a);
    gestorDebil.set(claveRaiz, a);
    observadorB = new WeakRef(a);
  })();

  await recolectar();
  console.log("   Con claveRaiz viva      → ¿nodo A vivo? ", observadorB.deref() !== undefined);

  claveRaiz = null;                   // ya nadie referencia la clave: la entrada desaparece sola
  await recolectar();
  console.log("   Tras claveRaiz = null   → ¿nodo A vivo? ", observadorB.deref() !== undefined);
}

main();
