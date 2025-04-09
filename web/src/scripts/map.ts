console.log("📍 map.ts loaded");

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { stadiums } from './constants'; // make sure path matches your file structure

document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ DOM ready");

  const mapElement = document.getElementById('map');
  if (!mapElement) {
    console.error("❌ #map element not found");
    return;
  }

  console.log("🗺️ Initializing map...");

  const map = L.map('map').setView([48.8566, 2.3522], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  console.log("✅ Map initialized");

  // Add markers for each stadium with custom logo icons
  stadiums.forEach((club) => {
    const icon = L.icon({
      iconUrl: club.logo,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
      className: 'club-logo-marker'
    });

    const marker = L.marker(club.coords, { icon }).addTo(map);
    marker.bindPopup(`<b>${club.name}</b>`);
  });

  console.log("✅ All stadium markers added");
});
