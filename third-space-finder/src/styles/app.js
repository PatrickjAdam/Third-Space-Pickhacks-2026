// All styles for MainApp.jsx and its components.
// Edit these to change the look of the main map/search view.

export const appStyles = {
  root: { display: "flex", flexDirection: "column", height: "100vh", background: "#0a0a0f", color: "#eee", fontFamily: "'Syne', sans-serif" },
  header: { padding: "1rem 1.5rem 0.5rem", borderBottom: "1px solid #222", background: "#0d0d14" },
  headerInner: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" },
  title: { margin: 0, fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.03em", fontFamily: "'Cormorant Garamond', serif" },
  subtitle: { margin: "0.1rem 0 0", fontSize: "0.85rem", color: "#888" },

  // Grade badge (top right of header)
  gradeBadge: { borderRadius: "12px", padding: "0.5rem 1rem", textAlign: "center", minWidth: 90, display: "flex", flexDirection: "column" },
  gradeLabel: { fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(0,0,0,0.6)" },
  gradeValue: { fontSize: "2rem", fontWeight: 800, color: "#fff", lineHeight: 1 },
  gradeNum: { fontSize: "0.7rem", color: "rgba(255,255,255,0.7)" },

  // Search bar
  searchRow: { display: "flex", gap: "0.5rem", marginBottom: "0.75rem" },
  input: { flex: 1, background: "#1a1a2a", border: "1px solid #333", borderRadius: "8px", padding: "0.6rem 1rem", color: "#eee", fontSize: "0.9rem", outline: "none" },
  searchBtn: { background: "#E07A5F", border: "none", borderRadius: "8px", padding: "0.6rem 1.2rem", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" },

  // Category filter chips
  filters: { display: "flex", gap: "0.4rem", flexWrap: "wrap", paddingBottom: "0.75rem" },
  filterChip: { border: "1px solid", borderRadius: "20px", padding: "0.25rem 0.7rem", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s" },

  // Layout
  body: { display: "flex", flex: 1, overflow: "hidden" },
  sidebar: { width: 280, background: "#0d0d14", borderRight: "1px solid #1a1a2a", overflowY: "auto", display: "flex", flexDirection: "column" },

  // Score card (sidebar top)
  scoreCard: { padding: "1rem", borderBottom: "1px solid #1a1a2a" },
  sidebarTitle: { margin: "0 0 0.75rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#888" },
  scoreRow: { display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "0.3rem 0", borderBottom: "1px solid #1a1a2a" },
  missingBox: { marginTop: "0.75rem", padding: "0.6rem", background: "#1a1218", borderRadius: "8px" },
  missingTitle: { margin: "0 0 0.4rem", fontSize: "0.75rem", color: "#E07A5F" },
  missingTag: { display: "inline-block", background: "#2a1a1a", borderRadius: "4px", padding: "0.15rem 0.4rem", fontSize: "0.7rem", marginRight: "0.3rem", marginBottom: "0.3rem", color: "#ccc" },

  // Place list (sidebar bottom)
  placeList: { flex: 1, padding: "0.5rem" },
  placeCard: { display: "flex", gap: "0.7rem", alignItems: "center", padding: "0.6rem 0.7rem", borderRadius: "8px", marginBottom: "0.4rem", cursor: "pointer", transition: "background 0.2s" },
  placeName: { margin: 0, fontSize: "0.85rem", fontWeight: 600 },
  placeType: { margin: 0, fontSize: "0.72rem", color: "#888" },

  // Map area
  mapContainer: { flex: 1, position: "relative" },
  map: { width: "100%", height: "100%" },

  // Popup on map click
  placePopup: { position: "absolute", bottom: 24, left: 24, background: "#0d0d14", border: "1px solid #333", borderRadius: "12px", padding: "1rem 1.2rem", minWidth: 220, zIndex: 10 },
  closeBtn: { position: "absolute", top: 8, right: 10, background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "1rem" },
  popupName: { margin: "0 0 0.2rem", fontWeight: 700, fontSize: "1rem" },
  popupMeta: { margin: "0 0 0.2rem", fontSize: "0.8rem", color: "#aaa" },
  popupAddr: { margin: 0, fontSize: "0.78rem", color: "#888" },
};