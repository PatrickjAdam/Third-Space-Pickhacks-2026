export const GOOGLE_MAPS_API_KEY = "AIzaSyB56GujcnOprvAWbiPC-j3iSZndDsiGKOQ";

// Each category maps to a Google Places API type.
// color   → the map pin + filter chip color
// weight  → used in scoring (higher = more important)
export const PLACE_CATEGORIES = [
  { type: "cafe", label: "Cafes", color: "#E07A5F", emoji: "☕", weight: 1.2 },
  { type: "library", label: "Libraries", color: "#3D405B", emoji: "📚", weight: 1.5 },
  { type: "park", label: "Parks",color: "#81B29A", emoji: "🌳", weight: 1.0 },
  { type: "community_center", label: "Community Centers", color: "#F2CC8F", emoji: "🏛️", weight: 1.8 },
  { type: "gym", label: "Gyms / Rec", color: "#5FA8D3", emoji: "🏋️", weight: 0.9 },
  { type: "museum", label: "Museums", color: "#C97B3A", emoji: "🏛️", weight: 1.1 },
];

export const GRADE_COLORS = {
  A: "#81B29A",
  B: "#5FA8D3",
  C: "#F2CC8F",
  D: "#E07A5F",
  F: "#C0392B",
};

// Dark map theme passed to Google Maps
export const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#0d0d14" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d0d14" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a1a2a" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#050d1a" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0d1a10" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#1a1a2a" }] },
];