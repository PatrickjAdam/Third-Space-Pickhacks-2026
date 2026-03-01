import { useState, useEffect, useRef, useCallback } from "react";
import { PLACE_CATEGORIES, GOOGLE_MAPS_API_KEY, MAP_STYLES } from "../constants";
import { computeScore } from "../utils/scoring";
import { GradeBadge, ScoreCard } from "../components/ScoreCard";
import PlaceList from "../components/PlaceList";
import { appStyles as s } from "../styles/app";

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

export default function MainApp({ searchInput, setSearchInput, shouldSearch, setShouldSearch }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [google, setGoogle] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [hoveredPlace, setHoveredPlace] = useState(null);
  const [activeCategories, setActiveCategories] = useState(PLACE_CATEGORIES.map((c) => c.type));
  const [scoreData, setScoreData] = useState(null);
  const [searched, setSearched] = useState(false);

  // Init Google Maps once on mount
  useEffect(() => {
    loadGoogleMaps(GOOGLE_MAPS_API_KEY).then((g) => {
      setGoogle(g);
      const map = new g.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.006 },
        zoom: 13,
        styles: MAP_STYLES,
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
          scale: 15,
          fillColor: cat?.color || "#888",
          fillOpacity: 0.9,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
      marker.addListener("click", () => setSelectedPlace(place));
      marker.addListener("mouseover", () => setHoveredPlace(place));
      marker.addListener("mouseout", () => setHoveredPlace(null));
      markersRef.current.push(marker);
    });
  }, [google]);

  const handleSearch = useCallback(async () => {
    if (!google || !searchInput.trim()) return;
    setLoading(true);
    setSearched(false);

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchInput }, (results, status) => {
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
        service.nearbySearch({ location, radius: 1500, type }, (res, stat) => {
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
        });
      });
    });
  }, [google, searchInput, activeCategories, plotMarkers]);

  // Auto-fire search when arriving from landing page with a pre-filled query
  useEffect(() => {
    if (shouldSearch && google && searchInput.trim()) {
      handleSearch();
      setShouldSearch(false);
    }
  }, [shouldSearch, google]);

  const toggleCategory = (type) =>
    setActiveCategories((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
    mapInstanceRef.current.panTo(place.geometry.location);
    mapInstanceRef.current.setZoom(16);
  };

  const visiblePlaces = places.filter((p) => activeCategories.includes(p.category));

  const priceLabel = (level) => {
    if (level === undefined || level === null) return null;
    if (level === 0) return "Free";
    return "$".repeat(level);
  };

  return (
    <div style={s.root}>
      <header style={s.header}>
        <div style={s.headerInner}>
          <div>
            <h1 style={s.title}>Third Space</h1>
            <p style={s.subtitle}>How socially alive is your neighborhood?</p>
          </div>
          <GradeBadge scoreData={scoreData} />
        </div>

        <div style={s.searchRow}>
          <input
            style={s.input}
            placeholder="Enter a neighborhood or city (e.g. Brooklyn, NY)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button style={s.searchBtn} onClick={handleSearch} disabled={loading}>
            {loading ? "Searching…" : "Analyze →"}
          </button>
        </div>

        <div style={s.filters}>
          {PLACE_CATEGORIES.map((cat) => (
            <button
              key={cat.type}
              style={{
                ...s.filterChip,
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

      <div style={s.body}>
        <aside style={s.sidebar}>
          {searched && <ScoreCard scoreData={scoreData} />}
          <PlaceList
            places={visiblePlaces}
            selectedPlace={selectedPlace}
            onSelect={handleSelectPlace}
            searched={searched}
          />
        </aside>

        <div style={s.mapContainer}>
          <div ref={mapRef} style={s.map} />

          {/* Hover tooltip — shows on pin mouseover */}
          {hoveredPlace && (
            <div style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "#0d0d14",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "0.5rem 0.8rem",
              zIndex: 10,
              pointerEvents: "none",
              fontSize: "0.85rem",
              color: "#eee",
              minWidth: 140,
            }}>
              <p style={{ margin: "0 0 0.2rem", fontWeight: 700 }}>{hoveredPlace.name}</p>
              {priceLabel(hoveredPlace.price_level) && (
                <p style={{ margin: "0 0 0.1rem", color: "#81B29A", fontWeight: 600 }}>
                  {priceLabel(hoveredPlace.price_level)}
                </p>
              )}
              {hoveredPlace.rating && (
                <p style={{ margin: 0, color: "#aaa" }}>⭐ {hoveredPlace.rating}</p>
              )}
            </div>
          )}

          {/* Click popup — shows on pin click */}
          {selectedPlace && (
            <div style={s.placePopup}>
              <button style={s.closeBtn} onClick={() => setSelectedPlace(null)}>✕</button>
              <p style={s.popupName}>{selectedPlace.name}</p>
              <p style={s.popupMeta}>
                {PLACE_CATEGORIES.find((c) => c.type === selectedPlace.category)?.emoji}{" "}
                {PLACE_CATEGORIES.find((c) => c.type === selectedPlace.category)?.label}
                {selectedPlace.rating ? ` · ⭐ ${selectedPlace.rating}` : ""}
              </p>
              {priceLabel(selectedPlace.price_level) && (
                <p style={{ fontSize: "0.8rem", color: "#81B29A", margin: "0.2rem 0" }}>
                  {priceLabel(selectedPlace.price_level)}
                </p>
              )}
              {selectedPlace.vicinity && (
                <p style={s.popupAddr}>📍 {selectedPlace.vicinity}</p>
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