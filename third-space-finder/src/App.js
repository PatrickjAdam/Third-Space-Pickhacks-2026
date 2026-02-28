import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// SETUP INSTRUCTIONS (read before running):
//
// 1. Get a Google Maps API Key:
//    - Go to https://console.cloud.google.com
//    - Create a new project
//    - Enable these APIs:
//        • Maps JavaScript API
//        • Places API
//    - Create credentials → API Key
//    - Paste your key below where it says YOUR_GOOGLE_MAPS_API_KEY
//
// 2. Install & run:
//    npx create-react-app third-space-finder
//    cd third-space-finder
//    Replace src/App.js content with this file
//    npm start
//
// 3. Optional: restrict your API key to localhost for dev safety
// ============================================================

const GOOGLE_MAPS_API_KEY = "AIzaSyB56GujcnOprvAWbiPC-j3iSZndDsiGKOQ";

const PLACE_CATEGORIES = [
  { type: "cafe",             label: "Cafés",           color: "#E07A5F", emoji: "☕", weight: 1.2 },
  { type: "library",         label: "Libraries",       color: "#3D405B", emoji: "📚", weight: 1.5 },
  { type: "park",            label: "Parks",           color: "#81B29A", emoji: "🌳", weight: 1.0 },
  { type: "community_center",label: "Community Centers",color: "#F2CC8F", emoji: "🏛️", weight: 1.8 },
  { type: "book_store",      label: "Bookstores",      color: "#9B8EA8", emoji: "📖", weight: 1.3 },
  { type: "gym",             label: "Gyms / Rec",      color: "#5FA8D3", emoji: "🏋️", weight: 0.9 },
  { type: "museum",          label: "Museums",         color: "#C97B3A", emoji: "🏛️", weight: 1.1 },
];

// Scoring logic — tweak these thresholds as you see fit
function computeScore(places) {
  if (!places.length) return { grade: "F", score: 0, breakdown: {} };

  const total = places.length;
  const typeSet = new Set(places.map((p) => p.category));
  const diversity = typeSet.size / PLACE_CATEGORIES.length; // 0–1
  const avgRating = places.reduce((s, p) => s + (p.rating || 3.5), 0) / total;
  const densityScore = Math.min(total / 20, 1); // 20+ = max density

  const raw = densityScore * 40 + diversity * 35 + ((avgRating - 1) / 4) * 25;
  const score = Math.round(raw);

  const grade =
    score >= 85 ? "A" :
    score >= 70 ? "B" :
    score >= 55 ? "C" :
    score >= 40 ? "D" : "F";

  const missing = PLACE_CATEGORIES
    .filter((c) => !typeSet.has(c.type))
    .map((c) => c.label);

  return {
    grade,
    score,
    breakdown: { total, diversity: Math.round(diversity * 100), avgRating: avgRating.toFixed(1), missing },
  };
}

const gradeColors = { A: "#81B29A", B: "#5FA8D3", C: "#F2CC8F", D: "#E07A5F", F: "#C0392B" };

// Load Google Maps script dynamically
function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google) return resolve(window.google);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function ThirdSpaceFinder() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [google, setGoogle] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [activeCategories, setActiveCategories] = useState(
    PLACE_CATEGORIES.map((c) => c.type)
  );
  const [scoreData, setScoreData] = useState(null);
  const [searched, setSearched] = useState(false);

  // Init map
  useEffect(() => {
    loadGoogleMaps(GOOGLE_MAPS_API_KEY).then((g) => {
      setGoogle(g);
      const map = new g.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.006 },
        zoom: 13,
        styles: mapStyles,
        disableDefaultUI: false,
        zoomControl: true,
      });
      mapInstanceRef.current = map;
    });
  }, []);

  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  };

  const plotMarkers = useCallback((results) => {
    clearMarkers();
    results.forEach((place) => {
      const cat = PLACE_CATEGORIES.find((c) => c.type === place.category);
      const marker = new google.maps.Marker({
        position: place.geometry.location,
        map: mapInstanceRef.current,
        title: place.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: cat?.color || "#888",
          fillOpacity: 0.9,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
      marker.addListener("click", () => setSelectedPlace(place));
      markersRef.current.push(marker);
    });
  }, [google]);

  // Search a neighborhood
  const handleSearch = useCallback(async () => {
    if (!google || !searchInput.trim()) return;
    setLoading(true);
    setSearched(false);

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchInput }, async (results, status) => {
      if (status !== "OK" || !results[0]) {
        alert("Location not found. Try a city or neighborhood name.");
        setLoading(false);
        return;
      }

      const location = results[0].geometry.location;
      mapInstanceRef.current.setCenter(location);
      mapInstanceRef.current.setZoom(14);

      const service = new google.maps.places.PlacesService(mapInstanceRef.current);
      const allPlaces = [];

      let remaining = activeCategories.length;

      activeCategories.forEach((type) => {
        service.nearbySearch(
          { location, radius: 1500, type },
          (res, stat) => {
            if (stat === "OK" && res) {
              res.slice(0, 8).forEach((p) => allPlaces.push({ ...p, category: type }));
            }
            remaining--;
            if (remaining === 0) {
              setPlaces(allPlaces);
              setScoreData(computeScore(allPlaces));
              plotMarkers(allPlaces);
              setLoading(false);
              setSearched(true);
            }
          }
        );
      });
    });
  }, [google, searchInput, activeCategories, plotMarkers]);

  const toggleCategory = (type) => {
    setActiveCategories((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const visiblePlaces = places.filter((p) => activeCategories.includes(p.category));

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <h1 style={styles.title}>Third Space</h1>
            <p style={styles.subtitle}>How socially alive is your neighborhood?</p>
          </div>
          {scoreData && (
            <div style={{ ...styles.gradeBadge, background: gradeColors[scoreData.grade] }}>
              <span style={styles.gradeLabel}>Social Score</span>
              <span style={styles.gradeValue}>{scoreData.grade}</span>
              <span style={styles.gradeNum}>{scoreData.score}/100</span>
            </div>
          )}
        </div>

        {/* Search bar */}
        <div style={styles.searchRow}>
          <input
            style={styles.input}
            placeholder="Enter a neighborhood or city (e.g. Brooklyn, NY)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button style={styles.searchBtn} onClick={handleSearch} disabled={loading}>
            {loading ? "Searching…" : "Analyze →"}
          </button>
        </div>

        {/* Category filters */}
        <div style={styles.filters}>
          {PLACE_CATEGORIES.map((cat) => (
            <button
              key={cat.type}
              style={{
                ...styles.filterChip,
                background: activeCategories.includes(cat.type) ? cat.color : "transparent",
                color: activeCategories.includes(cat.type) ? "#fff" : "#aaa",
                borderColor: cat.color,
              }}
              onClick={() => toggleCategory(cat.type)}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </header>

      <div style={styles.body}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          {searched && scoreData && (
            <div style={styles.scoreCard}>
              <h3 style={styles.sidebarTitle}>Neighborhood Report</h3>
              <div style={styles.scoreRow}>
                <span>Total third places</span>
                <strong>{scoreData.breakdown.total}</strong>
              </div>
              <div style={styles.scoreRow}>
                <span>Type diversity</span>
                <strong>{scoreData.breakdown.diversity}%</strong>
              </div>
              <div style={styles.scoreRow}>
                <span>Avg rating</span>
                <strong>⭐ {scoreData.breakdown.avgRating}</strong>
              </div>
              {scoreData.breakdown.missing?.length > 0 && (
                <div style={styles.missingBox}>
                  <p style={styles.missingTitle}>⚠️ What's missing</p>
                  {scoreData.breakdown.missing.map((m) => (
                    <span key={m} style={styles.missingTag}>{m}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Place list */}
          <div style={styles.placeList}>
            {visiblePlaces.length === 0 && searched && (
              <p style={{ color: "#888", padding: "1rem" }}>No places found. Try adjusting filters.</p>
            )}
            {!searched && (
              <p style={{ color: "#666", padding: "1rem", fontSize: "0.9rem" }}>
                Search a neighborhood to discover its social infrastructure.
              </p>
            )}
            {visiblePlaces.map((place, i) => {
              const cat = PLACE_CATEGORIES.find((c) => c.type === place.category);
              return (
                <div
                  key={i}
                  style={{
                    ...styles.placeCard,
                    borderLeft: `4px solid ${cat?.color || "#888"}`,
                    background: selectedPlace?.place_id === place.place_id ? "#1a1a2e" : "#111",
                  }}
                  onClick={() => {
                    setSelectedPlace(place);
                    mapInstanceRef.current.panTo(place.geometry.location);
                    mapInstanceRef.current.setZoom(16);
                  }}
                >
                  <span style={styles.placeEmoji}>{cat?.emoji}</span>
                  <div>
                    <p style={styles.placeName}>{place.name}</p>
                    <p style={styles.placeType}>{cat?.label} {place.rating ? `· ⭐ ${place.rating}` : ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Map */}
        <div style={styles.mapContainer}>
          <div ref={mapRef} style={styles.map} />
          {selectedPlace && (
            <div style={styles.placePopup}>
              <button style={styles.closeBtn} onClick={() => setSelectedPlace(null)}>✕</button>
              <p style={styles.popupName}>{selectedPlace.name}</p>
              <p style={styles.popupMeta}>
                {PLACE_CATEGORIES.find((c) => c.type === selectedPlace.category)?.emoji}{" "}
                {PLACE_CATEGORIES.find((c) => c.type === selectedPlace.category)?.label}
                {selectedPlace.rating ? ` · ⭐ ${selectedPlace.rating}` : ""}
              </p>
              {selectedPlace.vicinity && (
                <p style={styles.popupAddr}>📍 {selectedPlace.vicinity}</p>
              )}
              {selectedPlace.opening_hours && (
                <p style={{ fontSize: "0.8rem", color: selectedPlace.opening_hours.open_now ? "#81B29A" : "#E07A5F" }}>
                  {selectedPlace.opening_hours.open_now ? "● Open now" : "● Closed"}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────
const styles = {
  app: { display: "flex", flexDirection: "column", height: "100vh", background: "#0a0a0f", color: "#eee", fontFamily: "'DM Sans', sans-serif" },
  header: { padding: "1rem 1.5rem 0.5rem", borderBottom: "1px solid #222", background: "#0d0d14" },
  headerInner: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" },
  title: { margin: 0, fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.03em", fontFamily: "'Playfair Display', serif" },
  subtitle: { margin: "0.1rem 0 0", fontSize: "0.85rem", color: "#888" },
  gradeBadge: { borderRadius: "12px", padding: "0.5rem 1rem", textAlign: "center", minWidth: 90, display: "flex", flexDirection: "column" },
  gradeLabel: { fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(0,0,0,0.6)" },
  gradeValue: { fontSize: "2rem", fontWeight: 800, color: "#fff", lineHeight: 1 },
  gradeNum: { fontSize: "0.7rem", color: "rgba(255,255,255,0.7)" },
  searchRow: { display: "flex", gap: "0.5rem", marginBottom: "0.75rem" },
  input: { flex: 1, background: "#1a1a2a", border: "1px solid #333", borderRadius: "8px", padding: "0.6rem 1rem", color: "#eee", fontSize: "0.9rem", outline: "none" },
  searchBtn: { background: "#E07A5F", border: "none", borderRadius: "8px", padding: "0.6rem 1.2rem", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" },
  filters: { display: "flex", gap: "0.4rem", flexWrap: "wrap", paddingBottom: "0.75rem" },
  filterChip: { border: "1px solid", borderRadius: "20px", padding: "0.25rem 0.7rem", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s" },
  body: { display: "flex", flex: 1, overflow: "hidden" },
  sidebar: { width: 280, background: "#0d0d14", borderRight: "1px solid #1a1a2a", overflowY: "auto", display: "flex", flexDirection: "column" },
  scoreCard: { padding: "1rem", borderBottom: "1px solid #1a1a2a" },
  sidebarTitle: { margin: "0 0 0.75rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#888" },
  scoreRow: { display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "0.3rem 0", borderBottom: "1px solid #1a1a2a" },
  missingBox: { marginTop: "0.75rem", padding: "0.6rem", background: "#1a1218", borderRadius: "8px" },
  missingTitle: { margin: "0 0 0.4rem", fontSize: "0.75rem", color: "#E07A5F" },
  missingTag: { display: "inline-block", background: "#2a1a1a", borderRadius: "4px", padding: "0.15rem 0.4rem", fontSize: "0.7rem", marginRight: "0.3rem", marginBottom: "0.3rem", color: "#ccc" },
  placeList: { flex: 1, padding: "0.5rem" },
  placeCard: { display: "flex", gap: "0.7rem", alignItems: "center", padding: "0.6rem 0.7rem", borderRadius: "8px", marginBottom: "0.4rem", cursor: "pointer", transition: "background 0.2s" },
  placeEmoji: { fontSize: "1.2rem" },
  placeName: { margin: 0, fontSize: "0.85rem", fontWeight: 600 },
  placeType: { margin: 0, fontSize: "0.72rem", color: "#888" },
  mapContainer: { flex: 1, position: "relative" },
  map: { width: "100%", height: "100%" },
  placePopup: { position: "absolute", bottom: 24, left: 24, background: "#0d0d14", border: "1px solid #333", borderRadius: "12px", padding: "1rem 1.2rem", minWidth: 220, zIndex: 10 },
  closeBtn: { position: "absolute", top: 8, right: 10, background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "1rem" },
  popupName: { margin: "0 0 0.2rem", fontWeight: 700, fontSize: "1rem" },
  popupMeta: { margin: "0 0 0.2rem", fontSize: "0.8rem", color: "#aaa" },
  popupAddr: { margin: 0, fontSize: "0.78rem", color: "#888" },
};

// Dark map theme
const mapStyles = [
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