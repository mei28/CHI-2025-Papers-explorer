import React from "react";
import { PaperCard, Paper } from "./PaperCard";

interface CardGridProps {
  papers: Paper[];
}

export const CardGrid: React.FC<CardGridProps> = ({ papers }) => {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
    >
      {papers.map((paper) => (
        <div key={paper.id}>
          <PaperCard paper={paper} />
        </div>
      ))}
    </div>
  );
};

