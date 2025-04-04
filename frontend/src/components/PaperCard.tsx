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
  text && text.length > maxLen ? text.slice(0, maxLen).trim() + "..." : text;

interface PaperCardProps {
  paper: Paper;
  onMouseEnter?: (paper: Paper) => void;
  onMouseLeave?: () => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { title, abstract = "", url, score, authors, sessions } = paper;
  const truncatedAbstract = truncateText(abstract, 250);

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

  let sessionInfo = "";
  if (sessions && sessions.length > 0) {
    const s = sessions[0];
    sessionInfo = `${s.session_name || "N/A"}\n${s.session_date || "N/A"}\n${s.session_venue || "N/A"}`;
  }

  const extraInfo = sessionInfo;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block hover:shadow-lg transition-shadow"
      onMouseEnter={() => onMouseEnter && onMouseEnter(paper)}
      onMouseLeave={() => onMouseLeave && onMouseLeave()}
    >
      <Card className="w-full h-full bg-card rounded-lg shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-primary">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 space-y-2">
          <div className="text-xs text-muted-foreground">
            Author: {authorDisplay}
          </div>
          <div className="text-sm text-foreground">{truncatedAbstract}</div>
          <div className="text-xs text-muted whitespace-pre-wrap">
            {truncateText(extraInfo, 150)}
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Score: {score.toFixed(3)}
        </CardFooter>
      </Card>
    </a>
  );
};

