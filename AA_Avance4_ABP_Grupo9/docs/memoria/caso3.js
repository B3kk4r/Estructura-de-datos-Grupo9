// Caso 3 CORREGIDO
const EventEmitter = require('events');
const emisorGlobal = new EventEmitter();

class GestorSesionUsuario {
  constructor(idUsuario) {
    this.idUsuario = idUsuario;
    // Reserva de 5 MB de datos por sesión
    this.bufferSesion = new Uint8Array(5 * 1024 * 1024);

    // Suscripción al emisor global
    this.oyenteEvento = () => {
      this.actualizarActividad();
    };

    emisorGlobal.on('pingSistema', this.oyenteEvento);
  }

  actualizarActividad() {
    console.log(`Sesión ${this.idUsuario} activa.`);
  }

  cerrarSesion() {
    console.log(`Cerrando sesión de ${this.idUsuario}`);
    // [MOD-C3-01] Se desregistra el oyente: el emisor global deja de retener "this".
    emisorGlobal.off('pingSistema', this.oyenteEvento);
    // [MOD-C3-02] Se sueltan explícitamente los recursos pesados de la sesión.
    this.bufferSesion = null;
    this.oyenteEvento = null;
  }
}

function simularTrafico() {
  for (let i = 0; i < 50; i++) {
    const usuario = new GestorSesionUsuario(`USR_${i}`);
    // [MOD-C3-03] try/finally garantiza el cierre aunque ocurra una excepción.
    try {
      // ... trabajo de la sesión ...
    } finally {
      usuario.cerrarSesion();
    }
  }
}

simularTrafico();
// Forzar la ejecución del evento global: ya no responde ninguna sesión cerrada
emisorGlobal.emit('pingSistema');
console.log("Listeners activos:", emisorGlobal.listenerCount('pingSistema'));
