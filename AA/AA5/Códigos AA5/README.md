# GreenBST – Indexación jerárquica para scraping agrícola (Grupo 09)

Prototipo en **JavaScript / Node.js** (sin dependencias externas) del proyecto ABP de Estructura de Datos,
Universidad Nacional de Loja. Recopila precios de productos agrícolas, los limpia y los indexa con un
árbol AVL (**GreenBST**) para compararlos con una búsqueda lineal.

## Requisitos
- Node.js LTS 20 o superior (`node --version`).
- No hay que instalar paquetes: `package.json` no declara dependencias (versiones reproducibles).

## Uso
| Comando | Qué hace |
| --- | --- |
| `npm start` | Demo: extracción, limpieza, inserción, búsqueda, recorrido, eliminación y validación |
| `npm test` | Pruebas unitarias (árbol, tabla hash, limpieza y scraping) |
| `npm run benchmark` | Latencia GreenBST vs arreglo lineal (1 000 a 100 000 registros, 30 repeticiones, mediana) |
| `npm run benchmark:rapido` | Igual, solo con 1 000 y 10 000 registros |
| `npm run ingesta` | Ingesta continua en lotes mientras se realizan búsquedas |
| `npm run memoria` | Consumo de Heap del árbol según el número de registros |

Los resultados del benchmark se guardan en `resultados/benchmark.json` y `resultados/benchmark.csv`.

## Estructura
```
src/
  estructuras/   NodoAVL.js · GreenBST.js · TablaHash.js · ArregloLineal.js
  scraping/      ScrapingBot.js · limpieza.js · robots.js · fuenteSimulada.js
  benchmark/     benchmark.js · ingesta.js · memoria.js
  index.js       demostración
tests/           *.test.js (node:test)
datos/           ferias_loja_ejemplo.html (fuente de ejemplo)
```

## Requisitos cubiertos
| Requisito | Dónde |
| --- | --- |
| RF-1, RF-2 Bot y fuente configurable | `ScrapingBot` (`simulada`, `json`, `html`, `http`) |
| RF-3 Limpieza | `limpieza.js` |
| RF-4 a RF-7 GreenBST | `GreenBST.insertar/buscar/eliminar/recorrerInorden` |
| RF-8 Tabla Hash por feria | `TablaHash.js` |
| RF-9 Ampliar datos | `fuenteSimulada.js` (`cantidad`, `productosDistintos`) |
| RF-10 Arreglo de referencia | `ArregloLineal.js` |
| RF-11 Ingesta continua | `benchmark/ingesta.js` |
| RF-12 Medición de latencia | `benchmark/benchmark.js` |
| RNF-2 Sin desbordar la pila | recorrido y validación iterativos; recursión de profundidad ≈ log n |
| RNF-3 Integridad | `GreenBST.validar()` y pruebas unitarias |
| RNF-4 Pruebas de latencia | mismos datos y consultas, 30 repeticiones, mediana |
| RNF-5, RNF-6 Scraping responsable | errores controlados, `robots.txt`, rate limiting y `User-Agent` |

## Complejidad
| Operación | GreenBST | Tabla Hash | Arreglo lineal |
| --- | --- | --- | --- |
| Insertar | O(log n) | O(1) promedio | O(1) |
| Buscar | O(log n) | O(1) promedio | O(n) |
| Eliminar | O(log n) | – | O(n) |
| Recorrido completo | O(n) | O(n) | O(n) |

## Notas
- La interfaz web en Next.js (RF-13) no está incluida en este paquete: solo la parte de Node.js.
- La fuente `http` está probada contra un servidor local; para usar un sitio real hay que ajustar `columnas`
  al orden de la tabla de esa página y verificar sus términos de uso.
- Los datos de `fuenteSimulada.js` son sintéticos y sirven para medir rendimiento, no son precios reales.
