const express = require("express");
const bodyParser = require("body-parser");
const { llama3Chat } = require("./llama3");
const { getMissingFields } = require("./logic");
const { buscarEventosTool } = require("./tools");

const app = express();
app.use(bodyParser.json());

// Estado de sesión simple en memoria (para demo, usa Redis/DB en producción)
const userSessions = {};

function getSession(userId) {
  if (!userSessions[userId]) {
    userSessions[userId] = { datos: {}, messages: [] };
  }
  return userSessions[userId];
}

app.post("/conversar", async (req, res) => {
  const { userId = "default", userMessage } = req.body;
  const session = getSession(userId);

  // Añade el mensaje del usuario al historial
  session.messages.push({ role: "user", content: userMessage });

  // Pregunta a Llama3 cómo continuar la conversación
  let aiReply;
  try {
    aiReply = await llama3Chat(session.messages);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
  session.messages.push({ role: "assistant", content: aiReply });

  // Extrae entidades (campos) del mensaje del usuario usando expresión simple (puedes usar spaCy, LLM, etc.)
  const campos = ["fecha", "tipo", "ubicacion", "precio_max"];
  for (const campo of campos) {
    const regex = new RegExp(`${campo}\\s*:?\\s*([\\wáéíóúüñ\\d\\s]+)`, "i");
    const match = userMessage.match(regex);
    if (match) {
      session.datos[campo] = match[1].trim();
    }
  }

  // Si ya tengo todos los datos, busca eventos usando el tool
  const faltan = getMissingFields(session.datos);
  let events = [];
  if (faltan.length === 0) {
    try {
      events = await buscarEventosTool(session.datos);
    } catch (e) {}
  }

  res.json({
    aiReply,
    datos: session.datos,
    missing: faltan,
    events
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Event Assistant API escuchando en puerto ${PORT}`);
});