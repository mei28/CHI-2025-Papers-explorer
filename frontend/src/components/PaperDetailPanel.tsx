import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buttonClass } from "@/theme/components";
import { Paper } from "./PaperCard";

interface PaperDetailPanelProps {
  paper: Paper;
  onClear: () => void;
}

export const PaperDetailPanel: React.FC<PaperDetailPanelProps> = ({ paper, onClear }) => {
  // 著者情報
  let authorDisplay = "Unknown Author";
  if (paper.authors && paper.authors.length > 0) {
    const first = paper.authors[0];
    authorDisplay = first.name + (first.affiliation ? ` (${first.affiliation})` : "");
    if (paper.authors.length > 1) {
      authorDisplay += " et al.";
    }
  }

  // details 情報
  let detailsInfo = "Details: N/A";
  if (paper.details) {
    const { content_type, duration, presentation_time } = paper.details;
    detailsInfo = `Type: ${content_type || "N/A"} · Duration: ${duration || "N/A"}`;
    if (presentation_time) {
      detailsInfo += ` · Presentation: ${presentation_time}`;
    }
  }

  // セッション情報（最初のセッションのみ）
  let sessionInfo = "";
  if (paper.sessions && paper.sessions.length > 0) {
    const s = paper.sessions[0];
    sessionInfo = `${s.session_name || "N/A"}\n${s.session_date || "N/A"}\n${s.session_venue || "N/A"}`;
  }

  return (
    <Card className="w-full bg-white rounded-lg shadow-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{paper.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-gray-700">{paper.abstract}</p>
        <p className="text-xs text-gray-500">Author: {authorDisplay}</p>
        <p className="text-xs text-gray-500 whitespace-pre-wrap">{detailsInfo}</p>
        {sessionInfo && (
          <p className="text-xs text-gray-500 whitespace-pre-wrap">Session Info: {sessionInfo}</p>
        )}
        <p className="text-xs text-gray-500">Score: {paper.score.toFixed(3)}</p>
      </CardContent>
      <CardFooter className="flex gap-4">
        <Button onClick={() => window.open(paper.url, "_blank")} className={buttonClass}>
          Open Paper
        </Button>
        <Button onClick={onClear} className={buttonClass}>
          Clear Selection
        </Button>
      </CardFooter>
    </Card>
  );
};

