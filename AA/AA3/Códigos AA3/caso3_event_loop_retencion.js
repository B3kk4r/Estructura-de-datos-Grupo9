
const EventEmitter = require('events');

const CORREGIDO = process.argv[2] === 'corregido';
const emisorGlobal = new EventEmitter();
emisorGlobal.setMaxListeners(0); // se esperan 50 listeners: evita la advertencia de Node

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
    if (CORREGIDO) {
      // Solución: se rompe la referencia externa que retenía a la instancia
      emisorGlobal.off('pingSistema', this.oyenteEvento);
    }
    // En el código original el desarrollador olvidó desregistrar el evento en emisorGlobal
  }
}

function simularTrafico() {
  for (let i = 0; i < 50; i++) {
    let usuario = new GestorSesionUsuario(`USR_${i}`);
    usuario.cerrarSesion();
    // La variable local `usuario` sale de alcance (Stack) al terminar la iteración
  }
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);
const estado = (etiqueta) => {
  if (global.gc) { global.gc(); global.gc(); }
  const memoria = process.memoryUsage();
  console.log(`[${etiqueta}] listeners: ${emisorGlobal.listenerCount('pingSistema')} | ArrayBuffers: ${mb(memoria.arrayBuffers)} MB | Heap: ${mb(memoria.heapUsed)} MB`);
};

console.log(CORREGIDO ? '=== VERSIÓN CORREGIDA (off al cerrar sesión) ===' : '=== VERSIÓN ORIGINAL (listeners olvidados) ===');
simularTrafico();

// Forzar la ejecución del evento global
emisorGlobal.emit('pingSistema');

// Se espera un instante para que el GC pueda recolectar lo que ya no es alcanzable
setTimeout(() => {
  estado('tras simularTrafico');
  console.log(CORREGIDO
    ? 'Sin listeners: las 50 instancias y sus buffers pueden ser liberados.'
    : 'Los 50 listeners retienen las 50 instancias y sus buffers (≈ 250 MiB).');
}, 50);
