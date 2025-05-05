import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { SummaryPaper } from "@/types/SummaryPaper";

interface Props {
  paper: SummaryPaper;
  lang: "en" | "ja";
  query?: string;
}

export const PaperSummaryCard: React.FC<Props> = ({
  paper,
  lang,
  query = "",
}) => {
  const getField = (key: string) => {
    const fullKey = `${key}_${lang === "en" ? "english" : "japanese"}`;
    return paper[fullKey as keyof SummaryPaper] || "";
  };

  const highlight = (text: string): string => {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  };

  return (
    <Card className="bg-card text-card-foreground rounded-md shadow-md p-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          <span dangerouslySetInnerHTML={{ __html: highlight(paper.title) }} />
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          <span
            dangerouslySetInnerHTML={{ __html: highlight(paper.authors) }}
          />{" "}
          ({paper.year})
        </p>
        <a
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary underline"
        >
          DOI: {paper.doi}
        </a>
      </CardHeader>
      <CardContent className="space-y-2 text-sm mt-2">
        <div>
          <strong>Summary:</strong>{" "}
          <span
            dangerouslySetInnerHTML={{
              __html: highlight(getField("summary")),
            }}
          />
        </div>
        <div>
          <strong>Problem:</strong>{" "}
          <span
            dangerouslySetInnerHTML={{
              __html: highlight(getField("problem")),
            }}
          />
        </div>
        <div>
          <strong>Method:</strong>{" "}
          <span
            dangerouslySetInnerHTML={{
              __html: highlight(getField("method")),
            }}
          />
        </div>
        <div>
          <strong>Results:</strong>{" "}
          <span
            dangerouslySetInnerHTML={{
              __html: highlight(getField("results")),
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

