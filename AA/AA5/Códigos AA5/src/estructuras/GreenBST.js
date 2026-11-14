const NodoAVL = require('./NodoAVL');

const altura = (nodo) => (nodo ? nodo.altura : 0);
const factorBalance = (nodo) => (nodo ? altura(nodo.izq) - altura(nodo.der) : 0);
const actualizarAltura = (nodo) => { nodo.altura = 1 + Math.max(altura(nodo.izq), altura(nodo.der)); };

/**
 * GreenBST: árbol binario de búsqueda auto-balanceado (AVL) indexado por producto.
 *
 * Complejidad: insertar, buscar y eliminar en O(log n); recorrido completo en O(n).
 * La recursión de insertar/eliminar tiene profundidad máxima ≈ 1.44·log2(n), por lo que no
 * hay riesgo de desbordar el Call Stack; el recorrido y la validación son iterativos (RNF-2).
 */
class GreenBST {
  constructor() {
    this.raiz = null;
    this.cantidadProductos = 0;   // nodos del árbol
    this.cantidadRegistros = 0;   // registros totales (suma de las listas de cada nodo)
    this.rotacionesSimples = 0;
    this.rotacionesDobles = 0;
  }

  // ------------------------------------------------------------------ inserción

  /**
   * Inserta un registro bajo la clave de su producto y rebalancea con rotaciones simples y dobles.
   * @param {{producto:string, feria:string, precio:number, fecha:string}} registro
   */
  insertar(registro) {
    if (!registro || typeof registro.producto !== 'string' || registro.producto === '') {
      throw new TypeError('El registro debe incluir un nombre de producto');
    }
    this.raiz = this.#insertar(this.raiz, registro.producto, registro);
    this.cantidadRegistros++;
  }

  #insertar(nodo, clave, registro) {
    if (!nodo) {
      this.cantidadProductos++;
      return new NodoAVL(clave, registro);
    }
    if (clave < nodo.clave) nodo.izq = this.#insertar(nodo.izq, clave, registro);
    else if (clave > nodo.clave) nodo.der = this.#insertar(nodo.der, clave, registro);
    else { nodo.registros.push(registro); return nodo; } // mismo producto: no cambia la forma del árbol
    return this.balancear(nodo);
  }

  // ------------------------------------------------------------------ balanceo

  /**
   * Restablece el invariante AVL (|factor de balance| ≤ 1) en un nodo.
   * Casos: izquierda-izquierda y derecha-derecha (rotación simple);
   *        izquierda-derecha y derecha-izquierda (rotación doble).
   * @returns {NodoAVL} nueva raíz del subárbol
   */
  balancear(nodo) {
    actualizarAltura(nodo);
    const fb = factorBalance(nodo);

    if (fb > 1) {
      if (factorBalance(nodo.izq) < 0) {          // izquierda-derecha → rotación doble
        nodo.izq = this.#rotarIzquierda(nodo.izq);
        this.rotacionesDobles++;
      } else {
        this.rotacionesSimples++;                   // izquierda-izquierda → rotación simple
      }
      return this.#rotarDerecha(nodo);
    }
    if (fb < -1) {
      if (factorBalance(nodo.der) > 0) {          // derecha-izquierda → rotación doble
        nodo.der = this.#rotarDerecha(nodo.der);
        this.rotacionesDobles++;
      } else {
        this.rotacionesSimples++;                   // derecha-derecha → rotación simple
      }
      return this.#rotarIzquierda(nodo);
    }
    return nodo;
  }

  #rotarDerecha(y) {
    const x = y.izq;
    y.izq = x.der;
    x.der = y;
    actualizarAltura(y);
    actualizarAltura(x);
    return x;
  }

  #rotarIzquierda(x) {
    const y = x.der;
    x.der = y.izq;
    y.izq = x;
    actualizarAltura(x);
    actualizarAltura(y);
    return y;
  }

  // ------------------------------------------------------------------ búsqueda

  /**
   * Busca un producto por su nombre (normalizado) y devuelve todos sus registros.
   * @param {string} producto
   * @param {string} [feria] - Si se indica, filtra los registros de esa feria.
   * @returns {Array} registros del producto; arreglo vacío si no existe.
   */
  buscar(producto, feria) {
    const nodo = this.#nodoDe(producto);
    if (!nodo) return [];
    return feria === undefined ? nodo.registros : nodo.registros.filter((r) => r.feria === feria);
  }

  contiene(producto) {
    return this.#nodoDe(producto) !== null;
  }

  #nodoDe(clave) {
    let actual = this.raiz;
    while (actual) {
      if (clave === actual.clave) return actual;
      actual = clave < actual.clave ? actual.izq : actual.der;
    }
    return null;
  }

  // ------------------------------------------------------------------ eliminación

  /**
   * Elimina un producto (con todos sus registros) y rebalancea.
   * @returns {boolean} true si existía.
   */
  eliminar(producto) {
    const nodo = this.#nodoDe(producto);
    if (!nodo) return false;
    const registrosEliminados = nodo.registros.length;
    this.raiz = this.#eliminar(this.raiz, producto);
    this.cantidadProductos--;
    this.cantidadRegistros -= registrosEliminados;
    return true;
  }

  #eliminar(nodo, clave) {
    if (!nodo) return null;
    if (clave < nodo.clave) nodo.izq = this.#eliminar(nodo.izq, clave);
    else if (clave > nodo.clave) nodo.der = this.#eliminar(nodo.der, clave);
    else {
      if (!nodo.izq || !nodo.der) return nodo.izq || nodo.der;  // hoja o un solo hijo
      let sucesor = nodo.der;                                     // dos hijos: sucesor inorden
      while (sucesor.izq) sucesor = sucesor.izq;
      nodo.clave = sucesor.clave;
      nodo.registros = sucesor.registros;
      nodo.der = this.#eliminar(nodo.der, sucesor.clave);
    }
    return this.balancear(nodo);
  }

  // ------------------------------------------------------------------ recorrido

  /**
   * Generador inorden ITERATIVO (pila explícita): productos en orden alfabético.
   * @yields {{producto:string, registros:Array}}
   */
  *inorden() {
    const pila = [];
    let actual = this.raiz;
    while (actual || pila.length) {
      while (actual) { pila.push(actual); actual = actual.izq; }
      actual = pila.pop();
      yield { producto: actual.clave, registros: actual.registros };
      actual = actual.der;
    }
  }

  /** Recorre los productos en orden alfabético y devuelve un arreglo. O(n). */
  recorrerInorden() {
    return [...this.inorden()];
  }

  /** Altura actual del árbol (0 si está vacío). */
  get altura() {
    return altura(this.raiz);
  }

  // ------------------------------------------------------------------ validación

  /**
   * Verifica los invariantes del árbol (RNF-3), de forma iterativa:
   * orden estricto de claves, alturas correctas, balance AVL y contadores coherentes.
   * @returns {{valido:boolean, errores:string[]}}
   */
  validar() {
    const errores = [];
    if (!this.raiz) {
      if (this.cantidadProductos !== 0 || this.cantidadRegistros !== 0) errores.push('Contadores distintos de cero en árbol vacío');
      return { valido: errores.length === 0, errores };
    }

    // 1) Orden: el recorrido inorden debe ser estrictamente creciente
    let anterior = null;
    let nodos = 0;
    let registros = 0;
    for (const { producto, registros: lista } of this.inorden()) {
      if (anterior !== null && !(anterior < producto)) errores.push(`Orden violado: "${anterior}" antes de "${producto}"`);
      anterior = producto;
      nodos++;
      registros += lista.length;
    }

    // 2) Alturas y balance: postorden iterativo (hijos antes que padres)
    const alturas = new Map();
    const pendientes = [this.raiz];
    const postorden = [];
    while (pendientes.length) {
      const nodo = pendientes.pop();
      postorden.push(nodo);
      if (nodo.izq) pendientes.push(nodo.izq);
      if (nodo.der) pendientes.push(nodo.der);
    }
    for (let i = postorden.length - 1; i >= 0; i--) {
      const nodo = postorden[i];
      const hi = nodo.izq ? alturas.get(nodo.izq) : 0;
      const hd = nodo.der ? alturas.get(nodo.der) : 0;
      const real = 1 + Math.max(hi, hd);
      alturas.set(nodo, real);
      if (nodo.altura !== real) errores.push(`Altura incorrecta en "${nodo.clave}": guardada ${nodo.altura}, real ${real}`);
      if (Math.abs(hi - hd) > 1) errores.push(`Desbalance en "${nodo.clave}": factor ${hi - hd}`);
      if (!Array.isArray(nodo.registros) || nodo.registros.length === 0) errores.push(`Nodo "${nodo.clave}" sin registros`);
    }

    // 3) Contadores
    if (nodos !== this.cantidadProductos) errores.push(`cantidadProductos=${this.cantidadProductos} pero hay ${nodos} nodos`);
    if (registros !== this.cantidadRegistros) errores.push(`cantidadRegistros=${this.cantidadRegistros} pero hay ${registros} registros`);

    return { valido: errores.length === 0, errores };
  }
}

module.exports = GreenBST;
