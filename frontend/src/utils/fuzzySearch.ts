import Fuse, { IFuseOptions } from "fuse.js";
import { SummaryPaper } from "@/types/SummaryPaper";

const options: IFuseOptions<SummaryPaper> = {
  includeScore: true,
  keys: [
    "title", "authors", "summary_english", "problem_english",
    "method_english", "results_english",
    "summary_japanese", "problem_japanese",
    "method_japanese", "results_japanese",
  ],
  threshold: 0.4,
};

export const fuzzySearch = (papers: SummaryPaper[], query: string) => {
  const fuse = new Fuse(papers, options);
  return query.trim()
    ? fuse.search(query).map((res) => res.item)
    : papers;
};
