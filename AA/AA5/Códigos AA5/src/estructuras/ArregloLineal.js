/**
 * Arreglo lineal de referencia (RF-10): mismos datos que el GreenBST, búsqueda O(n).
 * La búsqueda debe recorrer TODOS los registros porque un producto puede repetirse.
 */
class ArregloLineal {
  constructor() {
    this.registros = [];
  }

  insertar(registro) {
    this.registros.push(registro);
  }

  /**
   * @param {string} producto
   * @param {string} [feria]
   * @returns {Array} todos los registros del producto (opcionalmente de una feria).
   */
  buscar(producto, feria) {
    const encontrados = [];
    for (let i = 0; i < this.registros.length; i++) {
      const r = this.registros[i];
      if (r.producto === producto && (feria === undefined || r.feria === feria)) encontrados.push(r);
    }
    return encontrados;
  }

  get tamano() {
    return this.registros.length;
  }
}

module.exports = ArregloLineal;
