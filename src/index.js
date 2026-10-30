// Se hace uso de los nodos, usando información relacionada al proyecto del Grupo09
const ListaDobleNavegación = require ('./models/ListaDobleNavegación');

const historial = new ListaDobleNavegación();

historial.insertar({id: 1, producto: 'tomate', feria: 'Feria Centro Comercial Loja', fecha: '2026-10-20'});
historial.insertar({id: 2, producto: 'papa', feria: 'Feria de Las Pitas', fecha: '2026-10-21'});
historial.insertar({id: 1, producto: 'cebolla', feria: 'Feria Orillas del Zamora', fecha: '2026-10-22'});

console.log('Historial cargando');
console.log('Consultas guardadas', historial.longitud);
console.log('Consulta actual', historial.ObtenerActual());

console.log('Siguiendo con las consultas');
console.log('Avanzando', historial.avanzar());
console.log('Avanzando', historial.avanzar());
console.log('Avanzando', historial.avanzar());


console.log('Volviendo a una consulta anterior');
console.log('Retrocediendo', historial.retroceder());
console.log('Retrocedientdo', historial.retroceder());
console.log('Retrocedientdo', historial.retroceder());

console.log('Borrando una consulta');
historial.avanzar();
console.log('Eliminar', historial.ObtenerActual());
console.log('Eliminado', historial.eliminarActual());
console.log('Nueva Consulta', historial.ObtenerActual());
console.log('Consultas restantes', historial.longitud);