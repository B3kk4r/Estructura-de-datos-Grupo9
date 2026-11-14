/**
 * Tabla Hash sencilla que indexa los registros por feria (encadenamiento separado).
 * Búsqueda e inserción en O(1) promedio; se redimensiona al superar el factor de carga 0.75.
 */
class TablaHash {
  /** @param {number} capacidadInicial - Número inicial de cubetas. */
  constructor(capacidadInicial = 16) {
    this.capacidad = capacidadInicial;
    this.cubetas = new Array(capacidadInicial).fill(null);
    this.cantidadFerias = 0;
    this.cantidadRegistros = 0;
  }

  /** Función hash djb2 sobre el nombre de la feria. */
  #hash(feria, capacidad = this.capacidad) {
    let h = 5381;
    for (let i = 0; i < feria.length; i++) h = ((h << 5) + h + feria.charCodeAt(i)) >>> 0;
    return h % capacidad;
  }

  #entrada(feria, crear) {
    const indice = this.#hash(feria);
    let cubeta = this.cubetas[indice];
    if (cubeta) {
      for (const entrada of cubeta) if (entrada.feria === feria) return entrada;
    }
    if (!crear) return null;
    const entrada = { feria, registros: [] };
    (cubeta ??= this.cubetas[indice] = []).push(entrada);
    this.cantidadFerias++;
    return entrada;
  }

  /** Indexa un registro bajo el nombre de su feria. */
  indexarPorFeria(registro) {
    if (!registro || typeof registro.feria !== 'string' || registro.feria === '') {
      throw new TypeError('El registro debe incluir una feria');
    }
    this.#entrada(registro.feria, true).registros.push(registro);
    this.cantidadRegistros++;
    if (this.cantidadFerias / this.capacidad > 0.75) this.#redimensionar();
  }

  /** @returns {Array} registros de la feria; arreglo vacío si no existe. */
  buscarPorFeria(feria) {
    const entrada = this.#entrada(feria, false);
    return entrada ? entrada.registros : [];
  }

  /** @returns {Array} todos los registros indexados. */
  obtenerRegistros() {
    const todos = [];
    for (const cubeta of this.cubetas) {
      if (cubeta) for (const entrada of cubeta) for (const r of entrada.registros) todos.push(r);
    }
    return todos;
  }

  /** @returns {string[]} nombres de las ferias indexadas. */
  ferias() {
    const nombres = [];
    for (const cubeta of this.cubetas) if (cubeta) for (const entrada of cubeta) nombres.push(entrada.feria);
    return nombres;
  }

  #redimensionar() {
    const anteriores = this.cubetas;
    this.capacidad *= 2;
    this.cubetas = new Array(this.capacidad).fill(null);
    for (const cubeta of anteriores) {
      if (!cubeta) continue;
      for (const entrada of cubeta) (this.cubetas[this.#hash(entrada.feria)] ??= []).push(entrada);
    }
  }
}

module.exports = TablaHash;
