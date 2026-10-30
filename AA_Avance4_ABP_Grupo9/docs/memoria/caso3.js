
const EventEmitter = require('events');
const emisorGlobal = new EventEmitter();

class GestorSesionUsuario {
  constructor(idUsuario) {
    this.idUsuario = idUsuario;
    
    this.bufferSesion = new Uint8Array(5 * 1024 * 1024);

    
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
    
    emisorGlobal.off('pingSistema', this.oyenteEvento);
    
    this.bufferSesion = null;
    this.oyenteEvento = null;
  }
}

function simularTrafico() {
  for (let i = 0; i < 50; i++) {
    const usuario = new GestorSesionUsuario(`USR_${i}`);
   
    try {
    
    } finally {
      usuario.cerrarSesion();
    }
  }
}

simularTrafico();

emisorGlobal.emit('pingSistema');
console.log("Listeners activos:", emisorGlobal.listenerCount('pingSistema'));
