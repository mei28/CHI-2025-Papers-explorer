import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { inputClass, buttonClass } from "@/theme/components";

interface SearchBarProps {
  query: string;
  topN: number;
  onQueryChange: (newQuery: string) => void;
  onTopNChange: (newTopN: number) => void;
  onSearch: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  topN,
  onQueryChange,
  onTopNChange,
  onSearch,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <Input
        placeholder="Enter search query..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className={inputClass}
      />
      <Input
        type="number"
        min={1}
        max={100}
        value={topN.toString()}
        onChange={(e) => {
          const parsed = parseInt(e.target.value, 10);
          onTopNChange(isNaN(parsed) || parsed < 1 ? 1 : parsed);
        }}
        className="w-24"
      />
      <Button onClick={onSearch} className={buttonClass}>
        Search
      </Button>
    </div>
  );
};
