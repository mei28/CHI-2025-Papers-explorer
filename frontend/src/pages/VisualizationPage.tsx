import React, { useEffect, useState } from "react";
import { getUmapCoordinates, searchPapers } from "../utils/apiClient";
import { Paper } from "../components/PaperCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { inputClass, buttonClass } from "@/theme/components";
import { PageContainer } from "../components/PageContainer";
import { ScatterPlot } from "../components/ScatterPlot";
import { PaperDetailPanel } from "../components/PaperDetailPanel";

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
      // Visualization 用のデータ（例として 2000 件）
      const results = await searchPapers(query, 2000);
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
    const sizes: number[] = [];

    const paperMap: { [id: string]: Paper } = {};
    papers.forEach((p) => {
      paperMap[p.id] = p;
    });

    // スコアの正規化処理（全体の最小・最大を用いてサイズを算出）
    let minScore = Infinity;
    let maxScore = -Infinity;
    ids.forEach((idStr) => {
      const paper = paperMap[idStr];
      const score = paper ? paper.score : 0;
      if (score < minScore) minScore = score;
      if (score > maxScore) maxScore = score;
    });
    if (maxScore === minScore) {
      minScore = 0;
      maxScore = 1;
    }
    const minSize = 2;
    const maxSize = 20;
    const sizeFactor = maxSize - minSize;

    ids.forEach((idStr) => {
      const [xVal, yVal] = umapData[idStr];
      x.push(xVal);
      y.push(yVal);
      const paper = paperMap[idStr] || null;
      const score = paper ? paper.score : 0;
      colors.push(score);
      texts.push(`Paper ID: ${idStr}\nScore: ${paper ? score.toFixed(3) : "N/A"}`);
      customData.push(paper);
      const normalized = (score - minScore) / (maxScore - minScore);
      sizes.push(Math.round(minSize + normalized * sizeFactor));
    });

    return { x, y, colors, texts, customData, sizes };
  };

  const scatterData = createScatterData();
  const displayPaper = selectedPaper || hoveredPaper;

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold mb-4">UMAP Visualization</h1>
      <div className="mb-4 flex gap-4">
        <Input
          type="text"
          placeholder="Enter search query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={inputClass}
        />
        <Button onClick={handleSearch} className={buttonClass}>
          Search
        </Button>
      </div>
      {loading && <p>Loading search results...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-6 border rounded p-4 bg-white">
        <ScatterPlot
          x={scatterData.x}
          y={scatterData.y}
          colors={scatterData.colors}
          texts={scatterData.texts}
          customData={scatterData.customData}
          sizes={scatterData.sizes}
          onHover={(paper) => !selectedPaper && setHoveredPaper(paper)}
          onClick={(paper) => setSelectedPaper(paper)}
        />
      </div>
      {displayPaper && (
        <div className="mt-4">
          <PaperDetailPanel paper={displayPaper} onClear={() => setSelectedPaper(null)} />
        </div>
      )}
    </PageContainer>
  );
};

export default VisualizationPage;

