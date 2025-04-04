import React, { useEffect, useState } from "react";
import { CardGrid } from "../components/CardGrid";
import { searchPapers } from "../utils/apiClient";
import { Paper } from "../components/PaperCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { inputClass, buttonClass } from "@/theme/components";
import { PageContainer } from "../components/PageContainer";

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [topN, setTopN] = useState<number>(10);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await searchPapers(query, topN);
      setPapers(data);
    } catch (err) {
      setError("Search failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold mb-6">Search Papers</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Enter search query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={inputClass}
        />
        <Input
          type="number"
          min={1}
          max={100}
          value={topN.toString()}
          onChange={(e) => {
            const parsed = parseInt(e.target.value, 10);
            setTopN(isNaN(parsed) || parsed < 1 ? 1 : parsed);
          }}
          className="w-24"
        />
        <Button onClick={handleSearch} className={buttonClass}>
          Search
        </Button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {papers.length > 0 && <CardGrid papers={papers} />}
    </PageContainer>
  );
};

export default SearchPage;

