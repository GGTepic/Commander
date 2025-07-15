async function cargarDatos() {
  const res = await fetch('/api/marcador');
  return res.ok ? res.json() : {};
}

async function guardarDatos(datos) {
  await fetch('/api/marcador', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
}

async function actualizarUI() {
  const datos = await cargarDatos();
  const tabla = document.getElementById('tabla-jugadores');
  const jugadorSel = document.getElementById('jugador');
  const jugadorAdmin = document.getElementById('jugador-admin');
  const listaEliminar = document.getElementById('lista-jugadores');

  tabla.innerHTML = '';
  jugadorSel.innerHTML = '';
  jugadorAdmin.innerHTML = '';
  listaEliminar.innerHTML = '';

  Object.entries(datos).forEach(([jugador, stats]) => {
    // Tabla
    const fila = document.createElement('tr');
    fila.innerHTML = `<td>${jugador}</td><td>${stats.puntos}</td><td>${stats.partidas}</td>`;
    tabla.appendChild(fila);

    // Selects
    const opt1 = new Option(jugador, jugador);
    const opt2 = new Option(jugador, jugador);
    jugadorSel.appendChild(opt1);
    jugadorAdmin.appendChild(opt2);

    // Lista de eliminación
    const li = document.createElement('li');
    li.innerHTML = `${jugador} <button onclick="eliminarJugador('${jugador}')">Eliminar</button>`;
    listaEliminar.appendChild(li);
  });
}

async function agregarJugador() {
  const nombre = document.getElementById('nuevo-jugador').value.trim();
  if (!nombre) return alert('Escribe un nombre');
  const datos = await cargarDatos();
  if (datos[nombre]) return alert('Jugador ya existe');
  datos[nombre] = { puntos: 0, partidas: 0 };
  await guardarDatos(datos);
  document.getElementById('nuevo-jugador').value = '';
  actualizarUI();
}

document.getElementById('registro-form').addEventListener('submit', async e => {
  e.preventDefault();
  const datos = await cargarDatos();
  const jugador = document.getElementById('jugador').value;
  if (!jugador) return alert('Selecciona un jugador');

  let total = 0;
  const posicion = document.querySelector('input[name="posicion"]:checked');
  if (posicion) total += parseInt(posicion.value);

  document.querySelectorAll('.extra:checked').forEach(c => {
    total += parseInt(c.value);
  });

  datos[jugador].puntos += total;
  datos[jugador].partidas += 1;
  await guardarDatos(datos);
  document.getElementById('registro-form').reset();
  actualizarUI();
});

async function modificarPuntos() {
  const datos = await cargarDatos();
  const jugador = document.getElementById('jugador-admin').value;
  const puntos = parseInt(document.getElementById('mod-puntos').value) || 0;
  if (!datos[jugador]) return alert('Jugador no encontrado');
  datos[jugador].puntos += puntos;
  await guardarDatos(datos);
  actualizarUI();
}

async function resetearTodo() {
  if (!confirm('¿Seguro que deseas resetear todos los datos?')) return;
  const datos = await cargarDatos();
  Object.keys(datos).forEach(j => {
    datos[j].puntos = 0;
    datos[j].partidas = 0;
  });
  await guardarDatos(datos);
  actualizarUI();
}

async function finalizarTorneo() {
  const res = await fetch('/api/finalizar', { method: 'POST' });
  if (res.ok) {
    alert('Torneo finalizado y guardado en historial');
    await resetearTodo();
  } else {
    alert('Error al finalizar torneo');
  }
}

async function borrarHistorialTorneos() {
  if (!confirm('¿Seguro que deseas borrar el historial de torneos?')) return;
  await fetch('/api/historial', { method: 'DELETE' });
  alert('Historial eliminado');
}

async function eliminarJugador(nombre) {
  const datos = await cargarDatos();
  delete datos[nombre];
  await guardarDatos(datos);
  actualizarUI();
}

window.onload = actualizarUI;
