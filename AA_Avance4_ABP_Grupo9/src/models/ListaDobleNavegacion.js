const NodoDoble = require('./NodoDoble');

/**
 * Estructura de datos dinámica para la gestión de navegación bidireccional.
 * No usa Array, Map ni Set: solo nodos enlazados (cabeza, cola y cursor).
 */
class ListaDobleNavegacion {
  constructor() {
    this.cabeza = null;
    this.cola = null;
    this.actual = null; // Puntero/Cursor de navegación activa
    this.longitud = 0;
  }

  /**
   * Inserta un nuevo registro al final de la lista. Complejidad: O(1)
   * @param {Object} dato - Registro a almacenar.
   * @returns {NodoDoble} El nodo creado.
   */
  insertar(dato) {
    const nuevoNodo = new NodoDoble(dato);

    if (!this.cabeza) {
      this.cabeza = nuevoNodo;
      this.cola = nuevoNodo;
      this.actual = nuevoNodo;
    } else {
      this.cola.siguiente = nuevoNodo;
      nuevoNodo.anterior = this.cola;
      this.cola = nuevoNodo;
    }

    this.longitud++;
    return nuevoNodo;
  }

  /**
   * Desplaza el cursor activo hacia el siguiente nodo. Complejidad: O(1)
   * @returns {Object|null} El dato del nuevo nodo activo o null si alcanza el final.
   */
  avanzar() {
    if (this.actual && this.actual.siguiente) {
      this.actual = this.actual.siguiente;
      return this.actual.dato;
    }
    return null;
  }

  /**
   * Desplaza el cursor activo hacia el nodo anterior. Complejidad: O(1)
   * @returns {Object|null} El dato del nuevo nodo activo o null si alcanza el inicio.
   */
  retroceder() {
    if (this.actual && this.actual.anterior) {
      this.actual = this.actual.anterior;
      return this.actual.dato;
    }
    return null;
  }

  /**
   * Retorna el elemento actualmente seleccionado por el cursor.
   * @returns {Object|null}
   */
  obtenerActual() {
    return this.actual ? this.actual.dato : null;
  }

  /**
   * Elimina el elemento en la posición actual y reconecta los enlaces.
   * Libera las referencias internas para apoyar la gestión de memoria.
   * Complejidad: O(1)
   * @returns {boolean} Confirmación de eliminación.
   */
  eliminarActual() {
    const nodo = this.actual;
    if (nodo === null) return false;

    // [MOD-01] Se leen 'anterior' y 'siguiente' una sola vez (destructuring).
    // Antes se accedía 6 veces a nodoAEliminar.anterior/siguiente.
    const { anterior: ant, siguiente: sig } = nodo;

    // Reconexión de los vecinos (o actualización de cabeza/cola en los extremos)
    if (ant) ant.siguiente = sig; else this.cabeza = sig;
    if (sig) sig.anterior = ant; else this.cola = ant;

    // [MOD-02] Un solo punto de decisión para el cursor: va al siguiente y, si
    // no existe, al anterior (queda en null si la lista queda vacía).
    this.actual = sig ?? ant;

    // Limpieza explícita de referencias (Garbage Collection Helper)
    nodo.siguiente = null;
    nodo.anterior = null;

    this.longitud--;
    return true;
  }

  // ---------------------------------------------------------------------
  // [MOD-03] MÉTODOS NUEVOS (no alteran la API original del Avance 4)
  // ---------------------------------------------------------------------

  /** @returns {boolean} true si no hay elementos. Complejidad: O(1) */
  estaVacia() {
    return this.longitud === 0;
  }

  /** Lleva el cursor a la cabeza. Complejidad: O(1) */
  irAlInicio() {
    this.actual = this.cabeza;
    return this.obtenerActual();
  }

  /** Lleva el cursor a la cola. Complejidad: O(1) */
  irAlFinal() {
    this.actual = this.cola;
    return this.obtenerActual();
  }

  /**
   * [MOD-04] Desvincula TODOS los nodos para que el recolector de basura
   * pueda liberarlos sin esperar a que la lista completa sea inalcanzable.
   * Complejidad: O(n)
   */
  vaciar() {
    let nodo = this.cabeza;
    while (nodo) {
      const sig = nodo.siguiente;
      nodo.siguiente = null;
      nodo.anterior = null;
      nodo = sig;
    }
    this.cabeza = this.cola = this.actual = null;
    this.longitud = 0;
  }

  /**
   * [MOD-05] Recorrido de cabeza a cola (útil para depurar y probar).
   * Complejidad total: O(n)
   */
  *[Symbol.iterator]() {
    for (let n = this.cabeza; n; n = n.siguiente) yield n.dato;
  }
}

module.exports = ListaDobleNavegacion;
