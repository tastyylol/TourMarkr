const bounds = L.latLngBounds([-85, -180], [85, 180]);

const map = L.map('map', {
  maxBounds: bounds,
  maxBoundsViscosity: 1.0,
  minZoom: 2,
  maxZoom: 10
}).setView([-14.2350, -51.9253], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let markers = [];
let tempLatLng = null;

function saveMarkers() {
  const destinos = markers.map(marker => {
    const { lat, lng } = marker.getLatLng();
    return { lat, lng, name: marker.name };
  });
  localStorage.setItem('destinos', JSON.stringify(destinos));
}

function loadMarkers() {
  const data = localStorage.getItem('destinos');
  if (!data) return;
  const destinos = JSON.parse(data);
  destinos.forEach(d => addMarker(d.lat, d.lng, d.name, false));
}

function addMarker(lat, lng, name = '', save = true) {
  const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
  marker.name = name || 'Destino';

  function updatePopup() {
    marker.bindPopup(`
      <b>${marker.name}</b><br/>
      <button onclick="removeMarker('${marker._leaflet_id}')">Remover</button>
    `);
  }
  updatePopup();

  marker.on('click', () => marker.openPopup());
  marker.on('dragend', saveMarkers);

  markers.push(marker);
  if (save) saveMarkers();
}

window.removeMarker = function(id) {
  const marker = markers.find(m => m._leaflet_id == id);
  if (!marker) return;
  map.removeLayer(marker);
  markers = markers.filter(m => m._leaflet_id != id);
  saveMarkers();
};

// --- Popup customizado ---
const popup = document.getElementById('popup');
const destinoInput = document.getElementById('destinoInput');
const popupAdd = document.getElementById('popupAdd');
const popupCancel = document.getElementById('popupCancel');

map.on('click', e => {
  tempLatLng = e.latlng;
  destinoInput.value = '';
  popup.classList.remove('hidden');
  destinoInput.focus();
});

popupAdd.onclick = () => {
  const nome = destinoInput.value.trim() || 'Destino';
  addMarker(tempLatLng.lat, tempLatLng.lng, nome);
  popup.classList.add('hidden');
};

popupCancel.onclick = () => {
  popup.classList.add('hidden');
};

loadMarkers();
