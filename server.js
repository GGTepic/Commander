const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

const datosFile = path.join(__dirname, 'datos.json');
const historialFile = path.join(__dirname, 'historial.json');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Leer datos actuales
function leerDatos() {
  if (!fs.existsSync(datosFile)) return {};
  return JSON.parse(fs.readFileSync(datosFile));
}

// Guardar datos actuales
function guardarDatos(datos) {
  fs.writeFileSync(datosFile, JSON.stringify(datos, null, 2));
}

// Obtener marcador actual
app.get('/api/marcador', (req, res) => {
  const datos = leerDatos();
  res.json(datos);
});

// Guardar marcador actual
app.post('/api/marcador', (req, res) => {
  guardarDatos(req.body);
  res.json({ message: 'Datos actualizados' });
});

// Finalizar torneo y guardar en historial
app.post('/api/finalizar', (req, res) => {
  const marcador = leerDatos();
  let historial = [];
  if (fs.existsSync(historialFile)) {
    historial = JSON.parse(fs.readFileSync(historialFile));
  }
  historial.push({ fecha: new Date().toISOString(), marcador });
  fs.writeFileSync(historialFile, JSON.stringify(historial, null, 2));
  res.json({ message: 'Torneo guardado en historial' });
});

// Obtener historial
app.get('/api/historial', (req, res) => {
  if (!fs.existsSync(historialFile)) return res.json([]);
  const historial = JSON.parse(fs.readFileSync(historialFile));
  res.json(historial);
});

// Borrar historial
app.delete('/api/historial', (req, res) => {
  if (fs.existsSync(historialFile)) {
    fs.writeFileSync(historialFile, '[]');
  }
  res.json({ message: 'Historial eliminado' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
