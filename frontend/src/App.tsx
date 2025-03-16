
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { SearchPage } from "./pages/SearchPage";
// import { VisualizationPage } from "./pages/VisualizationPage";

const App: React.FC = () => {
  return (
    <Router>
      <div style={{ padding: "20px" }}>
        <nav style={{ marginBottom: "20px" }}>
          <Link to="/" style={{ marginRight: "20px" }}>
            Search
          </Link>
          <Link to="/visualization">Visualization</Link>
        </nav>
        <Routes>
          <Route path="/" element={<SearchPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

