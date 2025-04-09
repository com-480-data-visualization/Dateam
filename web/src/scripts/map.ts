import L from "leaflet";
import "leaflet/dist/leaflet.css";

export function initMap(): void {
  const map = L.map("map_eur").setView([50, 10], 4); // Center on Europe

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
}
