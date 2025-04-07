import React, { useEffect, useState } from "react";
import { getDimensionCoordinates, searchPapers } from "../utils/apiClient";
import { Paper } from "../components/PaperCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { inputClass, buttonClass } from "@/theme/components";
import { PageContainer } from "../components/PageContainer";
import { ScatterPlot } from "../components/ScatterPlot";
import { PaperDetailPanel } from "../components/PaperDetailPanel";
import { OptionsPanel, DimReductionMethod } from "../components/OptionsPanel";
import { DateRange } from "react-day-picker";
import { filterPapersByDate } from "@/utils/filterByDate";

interface CoordData {
  [id: string]: [number, number];
}

export const VisualizationPage: React.FC = () => {
  const [coordData, setCoordData] = useState<CoordData>({});
  const [papers, setPapers] = useState<Paper[]>([]);
  const [query, setQuery] = useState<string>("");
  const [hoveredPaper, setHoveredPaper] = useState<Paper | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [dimMethod, setDimMethod] = useState<DimReductionMethod>("umap");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 3, 26),
    to: new Date(2025, 4, 1),
  });

  useEffect(() => {
    const fetchCoords = async () => {
      try {
        const data = await getDimensionCoordinates(dimMethod);
        setCoordData(data);
      } catch (err) {
        setError("Failed to load coordinates.");
      }
    };
    fetchCoords();
  }, [dimMethod]);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      // Visualization 用のデータ（例として 2000 件）
      const results = await searchPapers(query, 2000);
      setPapers(filterPapersByDate(results, dateRange));
    } catch (err) {
      setError("Search failed. Please try again.");
    }
    setLoading(false);
  };

  // 散布図用データ作成：score が有効な論文のみ対象とし、正規化に基づくサイズも算出
  const createScatterData = () => {
    const ids = Object.keys(coordData);
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

    // 有効な score を持つ論文だけの id を抽出
    const validIds = ids.filter((idStr) => {
      const paper = paperMap[idStr];
      return paper !== undefined && paper !== null && typeof paper.score === "number" && !isNaN(paper.score);
    });

    let minScore = Infinity;
    let maxScore = -Infinity;
    validIds.forEach((idStr) => {
      const paper = paperMap[idStr]!;
      const score = paper.score;
      if (score < minScore) minScore = score;
      if (score > maxScore) maxScore = score;
    });
    if (maxScore === minScore) {
      minScore = 0;
      maxScore = 1;
    }
    const minSize = 2;
    const maxSize = 20;
    const sizeRange = maxSize - minSize;

    validIds.forEach((idStr) => {
      const [xVal, yVal] = coordData[idStr];
      x.push(xVal);
      y.push(yVal);
      const paper = paperMap[idStr]!;
      const score = paper.score;
      colors.push(score);
      texts.push(`Paper ID: ${idStr}\nScore: ${score.toFixed(3)}`);
      customData.push(paper);
      const normalized = (score - minScore) / (maxScore - minScore);
      sizes.push(Math.round(minSize + normalized * sizeRange));
    });

    // もしすべてのサイズが同じなら、全て 8 に設定
    if (sizes.every((s) => s === sizes[0])) {
      sizes.fill(8);
    }

    return { x, y, colors, texts, customData, sizes };
  };

  const scatterData = createScatterData();
  const displayPaper = selectedPaper || hoveredPaper;

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold mb-4">Visualization</h1>
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


      <OptionsPanel
        selectedMethod={dimMethod}
        onMethodChange={setDimMethod}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

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

