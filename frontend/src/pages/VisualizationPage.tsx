import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { getUmapCoordinates, searchPapers } from "../utils/apiClient";
import { Paper } from "../components/PaperCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { inputClass, buttonClass } from "@/theme/components";

interface UmapData {
  [id: string]: [number, number];
}

export const VisualizationPage: React.FC = () => {
  const [umapData, setUmapData] = useState<UmapData>({});
  const [papers, setPapers] = useState<Paper[]>([]);
  const [query, setQuery] = useState<string>("");
  const [hoveredPaper, setHoveredPaper] = useState<Paper | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // UMAP 座標をロード
  useEffect(() => {
    const fetchUmap = async () => {
      try {
        const data = await getUmapCoordinates();
        setUmapData(data);
      } catch (err) {
        setError("Failed to load UMAP data.");
      }
    };
    fetchUmap();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const results = await searchPapers(query, 1000);
      setPapers(results);
    } catch (err) {
      setError("Search failed. Please try again.");
    }
    setLoading(false);
  };

  const createScatterData = () => {
    const ids = Object.keys(umapData);
    const x: number[] = [];
    const y: number[] = [];
    const colors: number[] = [];
    const texts: string[] = [];
    const customData: Paper[] = [];

    const paperMap: { [id: string]: Paper } = {};
    papers.forEach((p) => {
      paperMap[p.id] = p;
    });

    ids.forEach((idStr) => {
      const [xVal, yVal] = umapData[idStr];
      x.push(xVal);
      y.push(yVal);
      const paper = paperMap[idStr] || null;
      const score = paper ? paper.score : 0;
      colors.push(score);
      texts.push(`Paper ID: ${idStr}\nScore: ${paper ? score.toFixed(3) : "N/A"}`);
      customData.push(paper);
    });

    return { x, y, colors, texts, customData };
  };

  const scatterData = createScatterData();
  const displayPaper = selectedPaper || hoveredPaper;

  const renderPaperDetails = (paper: Paper) => {
    let authorDisplay = "Unknown Author";
    if (paper.authors && paper.authors.length > 0) {
      const first = paper.authors[0];
      authorDisplay = first.name;
      if (first.affiliation) {
        authorDisplay += ` (${first.affiliation})`;
      }
      if (paper.authors.length > 1) {
        authorDisplay += " et al.";
      }
    }

    let detailsInfo = "Details: N/A";
    if (paper.details) {
      const { content_type, duration, presentation_time } = paper.details;
      detailsInfo = `Type: ${content_type || "N/A"} · Duration: ${duration || "N/A"}`;
      if (presentation_time) {
        detailsInfo += ` · Presentation: ${presentation_time}`;
      }
    }

    let sessionInfo = "";
    if (paper.sessions && paper.sessions.length > 0) {
      const s = paper.sessions[0];
      sessionInfo = `${s.session_name || "N/A"}\n${s.session_date || "N/A"}\n${s.session_venue || "N/A"}`;
    }

    return (
      <div className="p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-bold mb-2">{paper.title}</h2>
        <p className="text-sm text-gray-700 mb-2">{paper.abstract}</p>
        <p className="text-xs text-gray-500 mb-1">Author: {authorDisplay}</p>
        <p className="text-xs text-gray-500 whitespace-pre-wrap mb-1">{detailsInfo}</p>
        {sessionInfo && (
          <p className="text-xs text-gray-500 whitespace-pre-wrap mb-1">
            Session Info: {sessionInfo}
          </p>
        )}
        <p className="text-xs text-gray-500 mb-2">Score: {paper.score.toFixed(3)}</p>
        <button
          onClick={() => window.open(paper.url, "_blank")}
          className={buttonClass}
        >
          Open Paper
        </button>
      </div>
    );
  };

  return (
    <div className="p-6 bg-background text-foreground min-h-screen">
      <h1 className="text-3xl font-bold mb-4">UMAP Visualization</h1>
      <div className="mb-4 flex gap-4">
        <Input
          type="text"
          placeholder="Enter search query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={inputClass}
        />
        <Button
          onClick={handleSearch}
          className={buttonClass}
        >
          Search
        </Button>
      </div>
      {loading && <p>Loading search results...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <Plot
        data={[
          {
            x: scatterData.x,
            y: scatterData.y,
            mode: "markers",
            type: "scatter",
            text: scatterData.texts,
            customdata: scatterData.customData,
            hovertemplate: "%{text}<extra></extra>",
            marker: {
              size: 12,
              color: scatterData.colors,
              colorscale: "Viridis",
              colorbar: { title: "Score" },
              cmin: 0,
            },
          },
        ]}
        layout={{ title: "UMAP Scatter Plot", autosize: true, height: 600 }}
        useResizeHandler
        style={{ width: "100%" }}
        onHover={(event: any) => {
          if (!selectedPaper && event.points && event.points[0]) {
            setHoveredPaper(event.points[0].customdata as Paper);
          }
        }}
        onUnhover={() => {
          if (!selectedPaper) {
            setHoveredPaper(null);
          }
        }}
        onClick={(event: any) => {
          if (event.points && event.points[0]) {
            setSelectedPaper(event.points[0].customdata as Paper);
          }
        }}
      />
      {displayPaper && (
        <div className="mt-4">
          {renderPaperDetails(displayPaper)}
          {selectedPaper && (
            <button
              onClick={() => setSelectedPaper(null)}
              className={buttonClass}
            >
              Clear Selection
            </button>
          )}
        </div>
      )}
    </div>
  );
};

