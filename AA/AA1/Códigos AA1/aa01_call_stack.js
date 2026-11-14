
const pila = [];
const entrar = (nombre) => { pila.push(nombre); console.log(`  → entra ${nombre.padEnd(2)} | pila: [${pila.join(' > ')}]`); };
const salir = () => { const n = pila.pop(); console.log(`  ← sale  ${n.padEnd(2)} | pila: [${pila.join(' > ')}]`); };

function C() { entrar('C'); salir(); }
function B() { entrar('B'); C(); salir(); }
function A() { entrar('A'); B(); salir(); }

console.log('1) Entrada y salida de marcos (la última función que entra es la primera en salir):');
A();

let profundidad = 0;
function recursionSinBaseDeParada() {
  profundidad++;
  recursionSinBaseDeParada();
}

console.log('\n2) Stack Overflow controlado:');
try {
  recursionSinBaseDeParada();
} catch (error) {
  console.log(`  ${error.constructor.name}: ${error.message}`);
  console.log(`  Marcos apilados antes del error: ${profundidad}`);
}


function crearLista(n) {
  let cabeza = null;
  for (let i = n; i > 0; i--) cabeza = { valor: i, siguiente: cabeza };
  return cabeza;
}

function sumarRecursivo(nodo) {
  return nodo ? nodo.valor + sumarRecursivo(nodo.siguiente) : 0;
}

function sumarIterativo(nodo) {
  let total = 0;
  while (nodo) { total += nodo.valor; nodo = nodo.siguiente; }
  return total;
}

const lista = crearLista(200000);
console.log('\n3) Recorrido de 200 000 nodos:');
try {
  console.log('  Recursivo :', sumarRecursivo(lista));
} catch (error) {
  console.log(`  Recursivo : ${error.constructor.name} (la pila se desbordó)`);
}
console.log('  Iterativo :', sumarIterativo(lista));
