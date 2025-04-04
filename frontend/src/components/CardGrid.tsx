import React from "react";
import { PaperCard, Paper } from "./PaperCard";

interface CardGridProps {
  papers: Paper[];
  onPaperHover?: (paper: Paper | null) => void;
}

export const CardGrid: React.FC<CardGridProps> = ({ papers, onPaperHover }) => {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
    >
      {papers.map((paper) => (
        <div key={paper.id}>
          <PaperCard
            paper={paper}
            onMouseEnter={(p) => onPaperHover && onPaperHover(p)}
            onMouseLeave={() => onPaperHover && onPaperHover(null)}
          />
        </div>
      ))}
    </div>
  );
};

