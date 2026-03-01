    import { useState, useEffect } from "react";
    import { landingStyles as styles } from "../styles/landing";
    import mapBg from "../assets/mapbg.png";
    console.log("mapBg path:", mapBg);
    //Full Screen Landing page

    export default function LandingPage({ onEnter, searchInput, setSearchInput }) {
    const [visible, setVisible] = useState(false);
    

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 80);
        return () => clearTimeout(timer);
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && searchInput.trim()) {
        onEnter();
        }
    };

    return (
        <div style={styles.page}>
            <img
                src={mapBg}
                alt=""
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 0.5,        // ← very faint, just a texture. increase to make it more visible
                    zIndex: 0,
                    pointerEvents: "none",
                }}
            />
        <nav style={styles.nav}>
            <span style={styles.navLogo}>Third Space</span>
            <span style={styles.navTag}>Smart City Project</span>
        </nav>

        <main style={styles.main}>

            <p style={{ ...styles.label, opacity: visible ? 1 : 0 }}>
            Social Infrastructure Explorer
            </p>

            <h1 style={{ ...styles.headline, opacity: visible ? 1 : 0 }}>
            Does your city<br />have a soul?
            </h1>

            <p style={{ ...styles.description, opacity: visible ? 1 : 0 }}>
            Third spaces — cafés, parks, libraries, community centers —
            are where real community happens. We score your neighborhood
            to show what exists, and what's missing.
            </p>

            {/* Search bar */}
            <div style={{ ...styles.searchRow, opacity: visible ? 1 : 0 }}>
            <input
                style={styles.input}
                placeholder="Enter a neighborhood or city..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
            />
            <button
                style={styles.button}
                onClick={() => searchInput.trim() && onEnter()}
            >
                Explore →
            </button>
            </div>

            <p style={{ ...styles.hint, opacity: visible ? 1 : 0 }}>
            Try "Rolla, MO" or "Brooklyn, NY"
            </p>

        </main>

        </div>
    );
    }