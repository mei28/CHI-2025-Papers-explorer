import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { getUmapCoordinates, searchPapers } from "../utils/apiClient";

interface UmapData {
  [id: string]: [number, number];
}

interface SearchResult {
  id: number;
  score: number;
}

export const VisualizationPage: React.FC = () => {
  const [umapData, setUmapData] = useState<UmapData>({});
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState<string>("");
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

  // 検索クエリが変更された場合に、検索結果を取得する関数
  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      // 上位 50 件程度取得（必要に応じて top_n を調整）
      const results = await searchPapers(query, 500);
      // 検索結果は Paper 型ですが、ここでは id と score に着目
      const mappedResults = results.map((r: any) => ({
        id: r.id,
        score: r.score,
      }));
      setSearchResults(mappedResults);
    } catch (err) {
      setError("Search failed. Please try again.");
    }
    setLoading(false);
  };

  // UMAP 座標と検索結果をマージして散布図のデータを作成する
  const createScatterData = () => {
    const ids = Object.keys(umapData);
    const x: number[] = [];
    const y: number[] = [];
    const colors: number[] = [];
    const texts: string[] = [];

    // 検索結果を id をキーにしてマッピング
    const scoreMap: { [id: string]: number } = {};
    searchResults.forEach((r) => {
      scoreMap[r.id] = r.score;
    });

    ids.forEach((id) => {
      const [xVal, yVal] = umapData[id];
      x.push(xVal);
      y.push(yVal);
      // 検索結果にあればそのスコア、なければ 0（もしくは他のデフォルト値）を使用
      colors.push(scoreMap[id] !== undefined ? scoreMap[id] : 0);
      texts.push(`Paper ID: ${id}\nScore: ${scoreMap[id] !== undefined ? scoreMap[id].toFixed(3) : "N/A"}`);
    });

    return { x, y, colors, texts };
  };

  const scatterData = createScatterData();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">UMAP Visualization</h1>
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Enter search query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2 rounded-md flex-1"
        />
        <button onClick={handleSearch} className="bg-blue-500 text-white p-2 rounded-md">
          Search
        </button>
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
            marker: {
              size: 12,
              color: scatterData.colors,
              colorscale: "Viridis", // 好みのカラースケールに変更可能
              colorbar: { title: "Score" },
              cmin: 0,
              // cmax: 上限スコア、必要に応じて固定値または動的に決定
            },
          },
        ]}
        layout={{ title: "UMAP Scatter Plot", autosize: true, height: 600 }}
        useResizeHandler
        style={{ width: "100%" }}
      />
    </div>
  );
};
