import React, { useEffect, useState } from "react";
import { SearchBar } from "../components/SearchBar";
import { ScatterPlot } from "../components/ScatterPlot";
import { CardGrid } from "../components/CardGrid";
import { PaperDetailPanel } from "../components/PaperDetailPanel";
import { searchPapers, getDimensionCoordinates } from "../utils/apiClient";
import { Paper } from "../components/PaperCard";
import { PageContainer } from "../components/PageContainer";
import { OptionsPanel, DimReductionMethod } from "../components/OptionsPanel";
import { DateRange } from "react-day-picker";
import { filterPapersByDate } from "@/utils/filterByDate";
import { filterPapersByContent } from "../utils/filterByContent";

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 3, 26),
    to: new Date(2025, 4, 1),
  });

  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(["Papers"]);

  // 次元削減手法に応じた座標データをロード
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

  // 初回ロード時に検索を実行
  useEffect(() => {
    handleSearch();
  }, []);

  // 検索実行：カード用（topN件）および散布図用（例として2000件）の結果を取得し、日付フィルタリングを適用
  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const cardResults = await searchPapers(query, 2000);
      const scatterResults = await searchPapers(query, 2000);
      setCardPapers(filterPapersByContent(
        filterPapersByDate(cardResults, dateRange),
        selectedContentTypes
      ).slice(0, topN));
      setScatterPapers(
        filterPapersByContent(
          filterPapersByDate(scatterResults, dateRange),
          selectedContentTypes
        )
      );
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
    scatterPapers.forEach((p) => {
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
      <div className="flex min-h-screen">
        {/* メインコンテンツ */}
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

              <OptionsPanel
                selectedMethod={dimMethod}
                onMethodChange={setDimMethod}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                selectedContentTypes={selectedContentTypes}
                onContentTypesChange={setSelectedContentTypes}
              />

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
                  <PaperDetailPanel
                    paper={displayPaper}
                    onClear={() => setSelectedPaper(null)}
                  />
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

