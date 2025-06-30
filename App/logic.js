const EVENTS = require("./events");

const REQUIRED_FIELDS = ["fecha", "tipo", "ubicacion", "precio_max"];

function getMissingFields(userData) {
  return REQUIRED_FIELDS.filter(field => !userData[field]);
}

function searchEvents(userData) {
  return EVENTS.filter(ev =>
    ev.fecha === userData.fecha &&
    ev.tipo === userData.tipo &&
    ev.ubicacion === userData.ubicacion &&
    ev.precio <= userData.precio_max
  );
}

module.exports = { getMissingFields, searchEvents };