// All styles for LandingPage.jsx and CityGrid.jsx
// Edit these to change the look of the landing page.

export const landingStyles = {

  // The full-screen background
  page: {
    minHeight: "100vh",
    background: "#0a0a0f",
    color: "#eeeeee",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Syne', sans-serif",
    position: "relative",
    overflow: "hidden",
  },


  // Top nav bar
  nav: {
    zIndex: 1,
    background:"#0a0a0f",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem 2.5rem",
    borderBottom: "1px solid #222",
  },
  navLogo: {
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
  },
  navTag: {
    fontSize: "0.75rem",
    color: "#555",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },

  // Center section — takes up all remaining vertical space
  main: {
    zIndex: 1,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "4rem 2rem",
    maxWidth: 640,
    margin: "0 auto",
  },

  // Small text above the headline
  label: {
    fontSize: "0.75rem",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#bcbd8b",
    marginBottom: "1.5rem",
    transition: "opacity 0.6s ease 0.1s",
  },

  // Main hero headline 
  headline: {
    fontSize: "clamp(2.5rem, 7vw, 5rem)",
    fontWeight: 700,
    lineHeight: 1.1,
    color: "#eff1ed",
    margin: "0 0 1.5rem",
    transition: "opacity 0.6s ease 0.25s",
    fontFamily: "'Cormorant Garamond', serif"
  },

  // Paragraph below headline
  description: {
    fontSize: "1rem",
    lineHeight: 1.7,
    color: "#bcbd8b",
    marginBottom: "2.5rem",
    transition: "opacity 0.6s ease 0.4s",
  },

  // Search bar
  searchRow: { 
    display: "flex", 
    gap: "0.5rem", 
    marginBottom: "0.75rem",
    transition: "opacity 0.6s ease 0.55s"
    },

  input: { flex: 1, 
    background: "#1a1a2a", 
    border: "1px solid #333", 
    borderRadius: "8px", 
    padding: "0.6rem 1rem", 
    color: "#eee", 
    fontSize: "0.9rem", 
    outline: "none",
    transition: "opacity 0.6s ease 0.55s"
    },

  // search button
  button: {
    background: "#717744",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "0.9rem 2rem",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "opacity 0.6s ease 0.55s",
  },

  hint: {
    marginTop: "0.75rem",
    fontSize: "1rem",
    color: "#717744",
    transition: "opacity 0.6s ease 0.6s",
  },

  // Bottom footer strip
  footer: {
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    padding: "1.25rem 2.5rem",
    borderTop: "1px solid #222",
    fontSize: "0.72rem",
    color: "#444",
    letterSpacing: "0.05em",
  },

};