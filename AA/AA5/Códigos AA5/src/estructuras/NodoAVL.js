/**
 * Nodo del GreenBST (árbol AVL).
 * La clave es el nombre del producto; el nodo guarda la lista de registros de ese producto.
 */
class NodoAVL {
  /**
   * @param {string} clave - Nombre normalizado del producto.
   * @param {{producto:string, feria:string, precio:number, fecha:string}} registro - Primer registro.
   */
  constructor(clave, registro) {
    this.clave = clave;
    this.registros = [registro];
    this.altura = 1;   // una hoja tiene altura 1
    this.izq = null;
    this.der = null;
  }
}

module.exports = NodoAVL;
