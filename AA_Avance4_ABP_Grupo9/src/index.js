const NodoDoble = require('./models/NodoDoble');
const ListaDobleNavegacion = require('./models/ListaDobleNavegacion');

// Punto de integración: el resto del proyecto ABP importa desde aquí.
module.exports = { NodoDoble, ListaDobleNavegacion };

// Demostración: solo se ejecuta con `node src/index.js` (no al hacer require).
if (require.main === module) {
  const historial = new ListaDobleNavegacion();
  historial.insertar({ id: 101, accion: 'Cargar Vista A' });
  historial.insertar({ id: 102, accion: 'Filtrar Datos B' });
  historial.insertar({ id: 103, accion: 'Exportar Reporte C' });

  console.log('Actual      :', historial.obtenerActual());
  console.log('Avanzar     :', historial.avanzar());
  console.log('Avanzar     :', historial.avanzar());
  console.log('Retroceder  :', historial.retroceder());
  console.log('Eliminar    :', historial.eliminarActual());
  console.log('Cursor ahora:', historial.obtenerActual());
  console.log('Recorrido   :', [...historial].map((d) => d.id).join(' <-> '));
  console.log('Longitud    :', historial.longitud);
}
