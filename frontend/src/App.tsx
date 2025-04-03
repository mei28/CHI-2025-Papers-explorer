
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { SearchPage } from "./pages/SearchPage";
import { VisualizationPage } from "./pages/VisualizationPage";

const App: React.FC = () => {
  return (
    <Router basename='/CHI-2025-Papers-explorer'>
      <div style={{ padding: "20px" }}>
        <nav style={{ marginBottom: "20px" }}>
          <Link to="/search" style={{ marginRight: "20px" }}>
            Search
          </Link>
          <Link to="/visualization">Visualization</Link>
        </nav>

        <Routes>
          <Route path="/search" element={<SearchPage />} />
          <Route path="/visualization" element={<VisualizationPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

