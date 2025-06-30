// Herramientas (tools) para el asistente, por ejemplo, búsqueda de eventos en la base de datos
const { searchEvents } = require("./logic");

// Simula una herramienta externa para buscar eventos
async function buscarEventosTool({ fecha, tipo, ubicacion, precio_max }) {
  if (!fecha || !tipo || !ubicacion || !precio_max) {
    throw new Error("Faltan datos para buscar eventos.");
  }
  const resultados = searchEvents({ fecha, tipo, ubicacion, precio_max });
  return resultados;
}

module.exports = { buscarEventosTool };