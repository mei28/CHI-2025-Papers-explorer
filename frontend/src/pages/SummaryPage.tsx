import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/PageContainer";
import { PaperSummaryCard } from "@/components/PaperSummaryCard";
import { SummaryPaper } from "@/types/SummaryPaper";
import { fuzzySearch } from "@/utils/fuzzySearch";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

export const SummaryPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<"en" | "ja">("en");
  const [papers, setPapers] = useState<SummaryPaper[]>([]);
  const [filtered, setFiltered] = useState<SummaryPaper[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/CHI-2025-Papers-explorer/data.json");
        const json = await res.json();
        setPapers(json);
        setFiltered(json);
      } catch (err) {
        console.error("JSON読み込み失敗:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setFiltered(papers);
    } else {
      setFiltered(fuzzySearch(papers, query));
    }
    setCurrentPage(1);
  }, [query, papers, lang]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Paper Summaries</h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search summaries..."
            className="flex-1"
          />
          <ToggleGroup
            type="single"
            value={lang}
            onValueChange={(value) => value && setLang(value as "en" | "ja")}
            className="rounded-md bg-muted"
          >
            <ToggleGroupItem
              value="en"
              className="text-sm px-4 py-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-primary"
            >
              English
            </ToggleGroupItem>
            <ToggleGroupItem
              value="ja"
              className="text-sm px-4 py-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-primary"
            >
              日本語
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="grid gap-6 mb-8">
          {paginated.map((paper) => (
            <PaperSummaryCard
              key={paper.id}
              paper={paper}
              lang={lang}
              query={query}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="justify-center mt-6 mb-10">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="cursor-pointer"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                />
              </PaginationItem>

              <PaginationItem>
                <span className="text-sm px-4 py-1 rounded-md border bg-muted">
                  Page {currentPage} of {totalPages}
                </span>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  className="cursor-pointer"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </PageContainer>
  );
};

