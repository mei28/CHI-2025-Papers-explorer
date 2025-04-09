import { Paper } from "../components/PaperCard";

/**
 * 論文の details.content_type に基づいて、指定された contentTypes のものだけを残す。
 * allowedContents が空の場合は、フィルタをかけず全件返す。
 */
export const filterPapersByContent = (papers: Paper[], allowedContents: string[]): Paper[] => {
  if (!allowedContents || allowedContents.length === 0) return papers;
  return papers.filter((paper) => {
    const contentType = paper.details?.content_type || "";
    return allowedContents.includes(contentType);
  });
};
