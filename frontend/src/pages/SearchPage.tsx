import React, { useEffect, useState } from "react";
import { CardGrid } from "../components/CardGrid";
import { searchPapers } from "../utils/apiClient";
import { Paper } from "../components/PaperCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { inputClass, buttonClass } from "@/theme/components";
import { PageContainer } from "../components/PageContainer";
import { filterPapersByDate } from "@/utils/filterByDate";
import { DateRange } from "react-day-picker";
import { OptionsPanel, DimReductionMethod } from "../components/OptionsPanel";

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [topN, setTopN] = useState<number>(10);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 3, 26),
    to: new Date(2025, 4, 1),
  });

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await searchPapers(query, 2000);
      setPapers(filterPapersByDate(data, dateRange).slice(0, topN));
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

      <OptionsPanel
        // selectedMethod={dimMethod}
        // onMethodChange={setDimMethod}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {papers.length > 0 && <CardGrid papers={papers} />}
    </PageContainer>
  );
};

export default SearchPage;

