import { parse } from "date-fns";
import { DateRange } from "react-day-picker";
import { Paper } from "../components/PaperCard";

/**
 * 各論文の最初のセッションの日付文字列（例："Mon, 28 Apr | 3:22 PM - 3:34 PM"）から
 * 日付部分（"Mon, 28 Apr"）を取り出し、指定した年を補完してパース、指定の日付範囲に収まる論文のみを返す
 */
export const filterPapersByDate = (
  papers: Paper[],
  dateRange: DateRange | undefined,
  defaultYear: number = 2025
): Paper[] => {
  if (!dateRange || !dateRange.from || !dateRange.to) return papers;
  return papers.filter((paper) => {
    const sessionDateStr = paper.sessions?.[0]?.session_date;
    if (!sessionDateStr) return false;
    const [datePart] = sessionDateStr.split("|");
    const trimmedDate = datePart.trim();
    // 年情報が無い場合、defaultYear を補完してパースする
    const parsedDate = parse(trimmedDate + " " + defaultYear, "EEE, dd LLL yyyy", new Date());
    if (isNaN(parsedDate.getTime())) return false;
    return parsedDate >= dateRange.from && parsedDate <= dateRange.to;
  });
};
