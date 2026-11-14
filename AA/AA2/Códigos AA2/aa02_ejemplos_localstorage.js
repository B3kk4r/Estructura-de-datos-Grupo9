
const path = require('path');
const LocalStorageNode = require('./LocalStorageNode');

const localStorage = new LocalStorageNode(path.join(__dirname, '.localstorage.json'));
const sessionStorage = new LocalStorageNode(); // sin archivo: no persiste

console.log(`Claves ya guardadas por ejecuciones anteriores: ${localStorage.length}\n`);

// ---------- Ejemplo 1: Guardar y mostrar un nombre ----------
console.log('Ejemplo 1: Guardar y mostrar un nombre');
localStorage.setItem('nombre', 'Carlos');             // Guardamos el nombre
let nombre = localStorage.getItem('nombre');          // Recuperamos el nombre guardado
console.log('  El nombre guardado es: ' + nombre);

// ---------- Ejemplo 2: Guardar un color favorito ----------
console.log('\nEjemplo 2: Guardar un color favorito');
localStorage.setItem('color', 'azul');
let color = localStorage.getItem('color');
console.log('  Mi color favorito es: ' + color);

// ---------- Ejemplo 3: Guardar y eliminar una edad ----------
console.log('\nEjemplo 3: Guardar y eliminar una edad');
localStorage.setItem('edad', 20);
console.log('  Edad guardada:', localStorage.getItem('edad'));
localStorage.removeItem('edad');
console.log('  Edad después de removeItem():', localStorage.getItem('edad')); // null

// ---------- Objetos y arreglos: JSON.stringify / JSON.parse ----------
console.log('\nObjetos y arreglos (localStorage solo guarda cadenas):');
const producto = { nombre: 'tomate', precio: 1.25, ferias: ['Las Pitas', 'Orillas del Zamora'] };

localStorage.setItem('sinJSON', producto);
console.log('  Sin JSON.stringify →', localStorage.getItem('sinJSON'));       // "[object Object]"

localStorage.setItem('producto', JSON.stringify(producto));
const recuperado = JSON.parse(localStorage.getItem('producto'));
console.log('  Con JSON.stringify/parse →', recuperado, '| ferias[0]:', recuperado.ferias[0]);

// ---------- key() y length ----------
console.log('\nkey() y length:');
for (let i = 0; i < localStorage.length; i++) {
  console.log(`  key(${i}) = ${localStorage.key(i)}`);
}

// ---------- localStorage vs sessionStorage ----------
console.log('\nlocalStorage vs sessionStorage:');
sessionStorage.setItem('sesion', 'solo mientras dure este proceso');
console.log('  sessionStorage.getItem("sesion") →', sessionStorage.getItem('sesion'));
const otraSesion = new LocalStorageNode();            // equivale a abrir otra pestaña/sesión
console.log('  En otra sesión →', otraSesion.getItem('sesion'));               // null
const otraLectura = new LocalStorageNode(path.join(__dirname, '.localstorage.json'));
console.log('  localStorage compartido, en otra "pestaña" →', otraLectura.getItem('nombre'));

