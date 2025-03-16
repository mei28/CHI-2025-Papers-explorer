import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export interface Author {
  name: string;
  affiliation?: string;
}

export interface Session {
  session_name?: string;
  session_date?: string;
  session_venue?: string;
}

export interface Paper {
  id: number;
  url: string;
  title: string;
  abstract?: string;
  score: number;
  authors?: Author[];
  details?: {
    content_type?: string;
    duration?: string;
    presentation_time?: string;
  };
  sessions?: Session[];
}

const truncateText = (text: string, maxLen: number): string =>
  text.length > maxLen ? text.slice(0, maxLen).trim() + "..." : text;

interface PaperCardProps {
  paper: Paper;
}

export const PaperCard: React.FC<PaperCardProps> = ({ paper }) => {
  const { title, abstract = "", url, score, authors, details, sessions } = paper;
  const truncatedAbstract = truncateText(abstract, 250);

  // 著者情報：第一著者のみ表示。所属情報があれば "(affiliation)" を付加し、複数なら "et al." を追加
  let authorDisplay = "Unknown Author";
  if (authors && authors.length > 0) {
    const first = authors[0];
    authorDisplay = first.name;
    if (first.affiliation) {
      authorDisplay += ` (${first.affiliation})`;
    }
    if (authors.length > 1) {
      authorDisplay += " et al.";
    }
  }


  // セッション情報（最初のセッションのみ）
  let sessionInfo = "";
  if (sessions && sessions.length > 0) {
    const s = sessions[0];
    sessionInfo = `${s.session_name || "N/A"}\n${s.session_date || "N/A"}\n${s.session_venue || "N/A"}`;
  }

  // 複数情報をまとめる。ここでは details と sessionInfo を改行で分けて表示
  const extraInfo = [sessionInfo].filter(Boolean).join("\n");

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 space-y-2">
          <div className="text-xs text-gray-500">Author: {authorDisplay}</div>
          <div className="text-sm text-gray-700">{truncatedAbstract}</div>
          <div className="text-xs text-gray-500 whitespace-pre-wrap">
            {extraInfo}
          </div>
        </CardContent>
        <CardFooter className="text-xs text-gray-500">
          Score: {score.toFixed(3)}
        </CardFooter>
      </Card>
    </a>
  );
};

