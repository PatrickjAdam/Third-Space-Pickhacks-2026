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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

      marker.addListener("mouseover", () => {
        setHoveredPlace(place);
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 22,
          fillColor: cat?.color || "#888",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2.5,
        });
      });

      marker.addListener("mouseout", () => {
        setHoveredPlace(null);
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 15,
          fillColor: cat?.color || "#888",
          fillOpacity: 0.9,
          strokeColor: "#fff",
          strokeWeight: 2,
        });
      });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <style>{`
            aside::-webkit-scrollbar {
                width: 10px;
            }
            aside::-webkit-scrollbar-track {
                background: transparent;
            }
            aside::-webkit-scrollbar-thumb {
                background: #717744;
                border-radius: 999px;
            }
            aside::-webkit-scrollbar-thumb:hover {
                background: #bcbd8b66;
            }

        `}</style>

      {/* ── Header ── */}
      <header style={s.header}>

        {/* Top row: logo + search + grade */}
        <div style={s.headerInner}>
          <div style={s.titleRibbon}>
            <div style={s.titleBar} />
            <h1 style={s.title}>Third Space</h1>
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

          <GradeBadge scoreData={scoreData} />
        </div>

        {/* Filters row */}
        <div style={s.filters}>
          {PLACE_CATEGORIES.map((cat) => (
            <button
                key={cat.type}
                style={{
                    ...s.filterChip,
                    background: activeCategories.includes(cat.type) ? "transparent" : "transparent",
                    color: activeCategories.includes(cat.type) ? cat.color : "#444",
                    borderColor: activeCategories.includes(cat.type) ? cat.color : "#333",
                }}
                onClick={() => toggleCategory(cat.type)}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Main body ── */}
      <div style={s.body}>

        {/* Sidebar */}
        <aside style={{ ...s.sidebar, width: sidebarOpen ? 400 : 0, minWidth: 0, transition: "width 0.3s ease", overflow: "hidden" }}>
            {searched && (
                <ScoreCard scoreData={scoreData} places={places} searchInput={searchInput} />
            )}
            <PlaceList
                places={visiblePlaces}
                selectedPlace={selectedPlace}
                onSelect={handleSelectPlace}
                searched={searched}
            />
        </aside>

        {/* Map area */}
        <div style={s.mapContainer}>
          <div ref={mapRef} style={s.map} />

          <button
            onClick={() => setSidebarOpen(p => !p)}
            style={{
            position: "absolute",
            top: "50%",
            left: 12,
            transform: "translateY(-50%)",
            background: "#0d0d14",
            border: "1px solid #bcbd8b44",
            borderRadius: "6px",
            color: "#bcbd8b",
            cursor: "pointer",
            padding: "0.4rem 0.3rem",
            zIndex: 10,
            fontSize: "0.7rem",
            lineHeight: 1,
            }}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>

          {/* Hover tooltip — shows on pin mouseover */}
          {hoveredPlace && (
            <div style={s.mapTooltip}>
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