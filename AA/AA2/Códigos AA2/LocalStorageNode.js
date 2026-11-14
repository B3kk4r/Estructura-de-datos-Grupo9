
const fs = require('fs');

class LocalStorageNode {
  constructor(archivo = null) {
    this.archivo = archivo;
    this.datos = new Map();
    if (archivo && fs.existsSync(archivo)) {
      const guardado = JSON.parse(fs.readFileSync(archivo, 'utf8'));
      for (const [clave, valor] of Object.entries(guardado)) this.datos.set(clave, valor);
    }
  }

  get length() { return this.datos.size; }

  /** Guarda un dato. Convierte la clave y el valor a cadena, como hace el navegador. */
  setItem(clave, valor) {
    this.datos.set(String(clave), String(valor));
    this.#persistir();
  }

  /** Recupera un dato; devuelve null si la clave no existe. */
  getItem(clave) {
    return this.datos.has(String(clave)) ? this.datos.get(String(clave)) : null;
  }

  /** Borra un solo ítem. */
  removeItem(clave) {
    this.datos.delete(String(clave));
    this.#persistir();
  }

  /** Borra toda la información. */
  clear() {
    this.datos.clear();
    this.#persistir();
  }

  /** Devuelve el nombre de la clave en la posición indicada. */
  key(indice) {
    return [...this.datos.keys()][indice] ?? null;
  }

  #persistir() {
    if (this.archivo) fs.writeFileSync(this.archivo, JSON.stringify(Object.fromEntries(this.datos)));
  }
}

module.exports = LocalStorageNode;
