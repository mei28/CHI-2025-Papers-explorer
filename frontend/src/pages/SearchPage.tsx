import React, { useState } from "react";
import { CardGrid } from "../components/CardGrid";
import { searchPapers } from "../utils/apiClient";
import { Paper } from "../components/PaperCard";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [topN, setTopN] = useState<number>(10);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Search Papers</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Enter search query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Input
          type="number"
          min={1}
          max={100}
          value={topN}
          onChange={(e) => setTopN(Number(e.target.value))}
          className="w-24"
        />
        <Button onClick={handleSearch} className="px-6">
          Search
        </Button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {papers.length > 0 && <CardGrid papers={papers} />}
    </div>
  );
};

