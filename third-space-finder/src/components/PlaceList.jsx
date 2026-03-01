import { PLACE_CATEGORIES } from "../constants";
import { appStyles as s } from "../styles/app";

// Sidebar list of places returned from the Places API search.
// Clicking a card pans the map to that location.

export default function PlaceList({ places, selectedPlace, onSelect, searched }) {
  if (!searched) {
    return (
      <p style={{ color: "#555", padding: "1rem", fontSize: "0.85rem", lineHeight: 1.6 }}>
        Search a neighborhood to discover its social infrastructure and get a grade.
      </p>
    );
  }

  if (places.length === 0) {
    return <p style={{ color: "#888", padding: "1rem" }}>No places found. Try adjusting filters.</p>;
  }

  return (
    <div style={s.placeList}>
      {places.map((place, i) => {
        const cat = PLACE_CATEGORIES.find((c) => c.type === place.category);
        const isSelected = selectedPlace?.place_id === place.place_id;

        return (
          <div
            key={i}
            style={{
              ...s.placeCard,
              borderLeft: `4px solid ${cat?.color || "#888"}`,
              background: isSelected ? "#1a1a2e" : "#111",
            }}
            onClick={() => onSelect(place)}
          >
            <span style={{ fontSize: "1.2rem" }}>{cat?.emoji}</span>
            <div>
              <p style={s.placeName}>{place.name}</p>
              <p style={s.placeType}>
                {cat?.label}{place.rating ? ` · ⭐ ${place.rating}` : ""}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}