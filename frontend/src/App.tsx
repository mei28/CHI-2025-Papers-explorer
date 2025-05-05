
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { SearchPage } from "./pages/SearchPage";
import { VisualizationPage } from "./pages/VisualizationPage";
import { SummaryPage } from "./pages/SummaryPage";
import { HomePage } from "./pages/Home";

const App: React.FC = () => {
  return (
    <Router basename='/CHI-2025-Papers-explorer'>
      <div style={{ padding: "20px" }}>
        <nav style={{ marginBottom: "20px" }}>
          <Link
            to="/"
            style={{ margin: "10px" }}
          >
            Home
          </Link>
          <Link
            to="/search"
            style={{ margin: "10px" }}
          >
            Search
          </Link>
          <Link
            to="/visualization"
            style={{ margin: "10px" }}
          >Visualization</Link>
          <Link to="/summary"
            style={{ margin: "10px" }}
          >
            Summary
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/visualization" element={<VisualizationPage />} />
          <Route path="/summary" element={<SummaryPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

