// une réponse d'Overpass (OpenStreetMap) près de la Bahnhofstrasse, Zurich (forme réelle : nodes, ways avec center), réduite pour les tests
export const OVERPASS_ZURICH = { version: 0.6, generator: 'Overpass API', elements: [
  { type: 'node', id: 1, lat: 47.3720, lon: 8.5390, tags: { amenity: 'toilets', fee: 'no', wheelchair: 'yes', name: 'Züri WC' } },
  { type: 'node', id: 2, lat: 47.3745, lon: 8.5410, tags: { amenity: 'drinking_water' } },
  { type: 'node', id: 3, lat: 47.3712, lon: 8.5402, tags: { amenity: 'cafe', name: 'Café Sprüngli', opening_hours: 'Mo-Sa 07:30-18:30' } },
  { type: 'node', id: 4, lat: 47.3731, lon: 8.5378, tags: { amenity: 'bar', name: 'Kronenhalle Bar' } },
  { type: 'node', id: 5, lat: 47.3699, lon: 8.5385, tags: { tourism: 'artwork', name: 'Heureka' } },
  { type: 'way', id: 6, center: { lat: 47.3760, lon: 8.5400 }, tags: { leisure: 'park', name: 'Platzspitz' } },
  { type: 'node', id: 7, lat: 47.3725, lon: 8.5420, tags: { amenity: 'restaurant', name: 'Zeughauskeller' } },
  { type: 'node', id: 8, lat: 47.3800, lon: 8.5500, tags: { amenity: 'bench' } },
  { type: 'node', id: 9, lat: 'x', lon: 8.54, tags: { amenity: 'toilets' } },
] };
