
class Nodo {
    constructor(dato) {
        this.dato = dato; // Guarda la coordenada satelital
        this.siguiente = null; // Apunta al siguiente nodo
    }
}

class ListaSatelital {
    constructor() {
        this.cabeza = null; // Al principio, la lista está vacía
        this.longitud = 0; // Cantidad de elementos
    }

    // Inserta un nuevo nodo al inicio de la lista
    prepend(dato) {
        const nuevoNodo = new Nodo(dato);

        // El nuevo nodo apunta al que antes era el primero
        nuevoNodo.siguiente = this.cabeza;

        // La cabeza ahora es el nuevo nodo
        this.cabeza = nuevoNodo;

        this.longitud++;
    }
}

// Permite importar la clase desde otro archivo
module.exports = { ListaSatelital };
