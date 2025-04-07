import React, { useEffect, useState } from "react";
import { SearchBar } from "../components/SearchBar";
import { ScatterPlot } from "../components/ScatterPlot";
import { CardGrid } from "../components/CardGrid";
import { PaperDetailPanel } from "../components/PaperDetailPanel";
import { searchPapers, getDimensionCoordinates } from "../utils/apiClient";
import { Paper } from "../components/PaperCard";
import { PageContainer } from "../components/PageContainer";
import { OptionsPanel, DimReductionMethod } from "../components/OptionsPanel";

interface CoordData {
  [id: string]: [number, number];
}

export const HomePage: React.FC = () => {
  const [coordData, setCoordData] = useState<CoordData>({});
  const [cardPapers, setCardPapers] = useState<Paper[]>([]);
  const [scatterPapers, setScatterPapers] = useState<Paper[]>([]);
  const [query, setQuery] = useState<string>("");
  const [topN, setTopN] = useState<number>(10);
  const [hoveredPaper, setHoveredPaper] = useState<Paper | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [dimMethod, setDimMethod] = useState<DimReductionMethod>("umap");

  // 座標データをロード（次元削減手法に応じて）
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
      // ScatterPlot 用：例として 2000 件（必要に応じて調整）
      const scatterResults = await searchPapers(query, 2000);
      setCardPapers(cardResults);
      setScatterPapers(scatterResults);
    } catch (err) {
      setError("Search failed. Please try again.");
    }
    setLoading(false);
  };

  // 散布図用データ作成（正規化によるサイズも含む）
  const createScatterData = () => {
    const ids = Object.keys(coordData);
    const x: number[] = [];
    const y: number[] = [];
    const colors: number[] = [];
    const texts: string[] = [];
    const customData: Paper[] = [];
    const sizes: number[] = [];

    const paperMap: { [id: string]: Paper } = {};
    scatterPapers.forEach((p) => {
      paperMap[p.id] = p;
    });

    // 全体の score の最小・最大を計算
    let minScore = Infinity;
    let maxScore = -Infinity;
    ids.forEach((idStr) => {
      const paper = paperMap[idStr] || null;
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
    const sizeRange = maxSize - minSize;

    ids.forEach((idStr) => {
      const [xVal, yVal] = coordData[idStr];
      x.push(xVal);
      y.push(yVal);
      const paper = paperMap[idStr] || null;
      const score = paper ? paper.score : 0;
      colors.push(score);
      texts.push(`Paper ID: ${idStr}\nScore: ${paper ? score.toFixed(3) : "N/A"}`);
      customData.push(paper);
      const normalized = (score - minScore) / (maxScore - minScore);
      sizes.push(Math.round(minSize + normalized * sizeRange));
    });

    // すべてのサイズが同じ場合は、全て 4 に設定
    if (sizes.every((s) => s === sizes[0])) {
      sizes.fill(8);
    }

    return { x, y, colors, texts, customData, sizes };
  };

  const scatterData = createScatterData();
  const displayPaper = selectedPaper || hoveredPaper;

  return (
    <PageContainer>
      <div className="flex min-h-screen">
        {/* 右側: メインコンテンツ */}
        <div className="p-6 flex-1 bg-background text-foreground">
          <h1 className="text-3xl font-bold mb-6">CHI 2025 Papers Explorer</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 左側: 検索バー、散布図、詳細表示 */}
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

              <OptionsPanel selectedMethod={dimMethod} onMethodChange={setDimMethod} />

              <div className="border rounded p-4 bg-white">
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
            </div>
            {/* 右側: 論文カードグリッド */}
            <div>
              <CardGrid papers={cardPapers} />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default HomePage;

