import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import MainApp from "./pages/MainApp";

export default function App() {
  const [page, setPage] = useState("landing");
  const [searchInput, setSearchInput] = useState("");
  const [shouldSearch, setShouldSearch] = useState(false);

  const handleEnter = () => {
    setShouldSearch(true);
    setPage("app");
  };

  return (
    <>
      {page === "landing" && (
        <LandingPage
          onEnter={handleEnter}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
        />
      )}

      <div
        style={{
          visibility: page === "app" ? "visible" : "hidden",
          position: page === "app" ? "relative" : "absolute",
          inset: 0,
          height: "100vh",
        }}
      >
        <MainApp
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          shouldSearch={shouldSearch}
          setShouldSearch={setShouldSearch}
        />
      </div>
    </>
  );
}