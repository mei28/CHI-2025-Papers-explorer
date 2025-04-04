import React, { useEffect, useState } from "react";
import { SearchBar } from "../components/SearchBar";
import { ScatterPlot } from "../components/ScatterPlot";
import { CardGrid } from "../components/CardGrid";
import { PaperDetailPanel } from "../components/PaperDetailPanel";
import { searchPapers, getUmapCoordinates } from "../utils/apiClient";
import { Paper } from "../components/PaperCard";

interface UmapData {
  [id: string]: [number, number];
}

export const HomePage: React.FC = () => {
  const [umapData, setUmapData] = useState<UmapData>({});
  const [cardPapers, setCardPapers] = useState<Paper[]>([]);
  const [scatterPapers, setScatterPapers] = useState<Paper[]>([]);
  const [query, setQuery] = useState<string>("");
  const [topN, setTopN] = useState<number>(10);
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

  // 初回ロード時ランダム表示
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      // CardGrid 用：topN 件
      const cardResults = await searchPapers(query, topN);
      // ScatterPlot 用：2000 件程度
      const scatterResults = await searchPapers(query, 2000);
      setCardPapers(cardResults);
      setScatterPapers(scatterResults);
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

    // scatterPapers を id をキーにしたマッピングにする
    const paperMap: { [id: string]: Paper } = {};
    scatterPapers.forEach((p) => {
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

  return (
    <div className="p-6 bg-background text-foreground min-h-screen">
      <h1 className="text-3xl font-bold mb-6">CHI 2025 Papers Explorer</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左半分: 検索バー & 散布図 */}
        <div>
          <SearchBar
            query={query}
            topN={topN}
            onQueryChange={setQuery}
            onTopNChange={setTopN}
            onSearch={handleSearch}
          />
          {loading && <p>Loading search results...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <div className="border rounded p-4 bg-white">
            <ScatterPlot
              x={scatterData.x}
              y={scatterData.y}
              colors={scatterData.colors}
              texts={scatterData.texts}
              customData={scatterData.customData}
              onHover={(paper) => !selectedPaper && setHoveredPaper(paper)}
              onClick={(paper) => setSelectedPaper(paper)}
            />
          </div>
          {displayPaper && (
            <div className="mt-4">
              <PaperDetailPanel paper={displayPaper} onClear={() => setSelectedPaper(null)} />
            </div>
          )}
        </div>
        {/* 右半分: 論文カードグリッド */}
        <div>
          <CardGrid papers={cardPapers} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;

